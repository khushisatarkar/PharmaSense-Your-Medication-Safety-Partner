from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS
import json
from itertools import combinations
import pandas as pd
import re

from rdkit import Chem
from rdkit.Chem import Descriptors

import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",  
    database="pharmasense"
)

med_df = pd.read_csv("updated_indian_medicine_data.csv")
med_df['name'] = med_df['name'].str.lower()

def clean_ingredients(text):
    text = str(text).lower()
    text = re.sub(r'\d+.*?(mg|ml|%)', '', text)
    text = re.sub(r'\(.*?\)', '', text)
    return list(set(re.findall(r'[a-zA-Z]+', text)))

def get_ingredients(medicine):
    medicine = medicine.lower()
    matches = med_df[med_df['name'].str.contains(medicine, na=False)]

    if not matches.empty:
        row = matches.iloc[0]
        raw = row.get('salt_composition')
        if pd.isna(raw) or raw == "":
            raw = row.get('short_composition1')
        if pd.isna(raw) or raw == "":
            raw = row.get('short_composition2')
        if pd.isna(raw) or raw == "":
            return []
        return clean_ingredients(raw)
    return []

cursor = db.cursor(dictionary=True)

app = Flask(__name__)
CORS(app)

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("brand_to_generic.json") as f:
    brand_map = json.load(f)

with open("generic_to_smiles.json") as f:
    smiles_map = json.load(f)

with open("safety_model.pkl", "rb") as f:
    safety_model = pickle.load(f)

with open("encoders.pkl", "rb") as f:
    le_ing, le_dosage, le_allergy = pickle.load(f)


def smiles_to_features(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return [0]*5
    
    return [
        Descriptors.MolWt(mol),
        Descriptors.NumHDonors(mol),
        Descriptors.NumHAcceptors(mol),
        Descriptors.MolLogP(mol),
        Descriptors.TPSA(mol)
    ]


def convert_brands_to_smiles(brands):
    result = []

    for brand in brands:
        original_name = brand.strip()
        brand_key = brand.lower().strip()

        if brand_key in brand_map:
            generics = brand_map[brand_key]

            for g in generics:
                if g in smiles_map:
                    result.append({
                        "name": original_name,
                        "smiles": smiles_map[g]
                    })
                    break 
    unique = {}
    for d in result:
        unique[d["name"].lower()] = d

    return list(unique.values())


def check_duplicate_ingredients(brands):
    ingredient_count = {}

    for brand in brands:
        brand_key = brand.lower().strip()

        if brand_key in brand_map:
            generics = brand_map[brand_key]

            for g in generics:
                ingredient_count[g] = ingredient_count.get(g, 0) + 1

    duplicates = [k for k, v in ingredient_count.items() if v > 1]
    return duplicates


def predict(drug_data):
    pairs = list(combinations(drug_data, 2))
    results = []

    for d1, d2 in pairs:
        s1, s2 = d1["smiles"], d2["smiles"]

        features = [[len(s1), len(s2)]]
        pred = model.predict(features)[0]

        results.append({
            "drug1": d1["name"],
            "drug2": d2["name"],
            "result": "⚠ Not Safe" if pred == 1 else "✅ Safe"
        })

    return results


@app.route("/")
def home():
    return "Drug compatibility API is running!"


@app.route("/predict", methods=["POST"])
def predict_api():
    try:
        data = request.get_json(force=True)
        brands = data.get("drugs", [])

        if len(brands) < 2:
            return jsonify({"error": "Need at least 2 medicines"}), 400

        duplicates = check_duplicate_ingredients(brands)

        if duplicates:
            return jsonify({
                "type": "warning",
                "ingredients": duplicates,
                "message": "⚠ Duplicate active ingredient detected! This may cause overdose risk.",
                "override": "Not Safe"
            })

        drug_data = convert_brands_to_smiles(brands)
        if len(drug_data) < 2:
            return jsonify({"error": "Invalid or unknown drugs"}), 400
        results = predict(drug_data)

        return jsonify({
            "type": "prediction",
            "results": results
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/profile", methods=["GET"])
def get_profile():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "No user ID provided"}), 400

    cursor.execute("""
        SELECT age, allergies, current_meds 
        FROM users 
        WHERE id=%s
    """, (user_id,))

    user = cursor.fetchone()

    if not user:
        return jsonify({})

    allergies = []
    meds = []

    if user["allergies"]:
        allergies = [a.strip().lower() for a in user["allergies"].split(",")]

    if user.get("current_meds"):
        meds = [m.strip().lower() for m in user["current_meds"].split(",")]

    return jsonify({
        "age": user["age"],
        "allergies": allergies,
        "currentMeds": meds
    })

@app.route("/safety", methods=["POST"])
def safety_check():
    try:
        data = request.get_json(force=True)
        print("Incoming:", data)
        medicine = data.get("medicine", "").lower().strip()
        age = int(data.get("age", 0))
        allergies = [a.lower().strip() for a in data.get("allergies", [])]
        current_meds = [m.lower().strip() for m in data.get("currentMeds", [])]

        try:
            dosage_amount = int(data.get("dosageAmount", 0))
        except:
            dosage_amount = 0

        ingredients = get_ingredients(medicine)
        if not ingredients:
            return jsonify({
                "medicine": medicine,
                "result": "❌ Unknown Medicine",
                "message": "Medicine not found in dataset",
                "ingredients": []
            })

        ingredient = ingredients[0]
        try:
            ing_enc = le_ing.transform([ingredient])[0]
        except:
            ing_enc = 0

        try:
            dosage_label = "high" if dosage_amount > 500 else "normal"
            dosage_enc = le_dosage.transform([dosage_label])[0]
        except:
            dosage_enc = 0

        try:
            allergy_input = allergies[0] if allergies else "none"
            allergy_enc = le_allergy.transform([allergy_input])[0]
        except:
            allergy_enc = 0

        features = [[ing_enc, age, dosage_enc, allergy_enc]]
        pred = safety_model.predict(features)[0]
        result = "⚠ Not Safe" if pred == 1 else "✅ Safe"
        # confidence_msg = "ML-based safety prediction"
        confidence_msg = "Please consult a healthcare professional in case of any other concerns."
        interaction_warning = None

        try:
            all_drugs = current_meds + [medicine]
            drug_data = convert_brands_to_smiles(all_drugs)
            if len(drug_data) >= 2:
                interactions = predict(drug_data)
                unsafe_pairs = [
                    f"{r['drug1']} + {r['drug2']}"
                    for r in interactions if "Not Safe" in r["result"]
                ]
                if unsafe_pairs:
                    interaction_warning = f"Interactions found: {', '.join(unsafe_pairs)}"
                    result = "⚠ Not Safe"
        except Exception as e:
            print("Interaction model error:", e)

        warnings = []
        for ing in ingredients:
            if ing in allergies:
                warnings.append(f"Allergic to {ing}")

        if "paracetamol" in ingredients:
            if dosage_amount > 650:
                warnings.append("High dosage for paracetamol (>650mg)")

        if age < 12 and dosage_amount > 500:
            warnings.append("High dose for child")

        # Duplicate ingredient explanation
        duplicates = check_duplicate_ingredients(current_meds + [medicine])
        if duplicates:
            warnings.append(f"Duplicate ingredient: {', '.join(duplicates)}")
        message_parts = [confidence_msg]
        if interaction_warning:
            message_parts.append(interaction_warning)

        if warnings:
            message_parts.append("Warnings: " + " | ".join(warnings))
        final_message = " | ".join(message_parts)
        return jsonify({
            "medicine": medicine,
            "result": result,
            "message": final_message,
            "ingredients": ingredients
        })

    except Exception as e:
        print("ERROR in /safety:", str(e))
        return jsonify({
            "result": "❌ Server Error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True)