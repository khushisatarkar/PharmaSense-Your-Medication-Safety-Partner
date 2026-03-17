from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS
import json
from itertools import combinations

from rdkit import Chem
from rdkit.Chem import Descriptors

import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",  # default XAMPP
    database="pharmasense"
)

cursor = db.cursor(dictionary=True)

app = Flask(__name__)
CORS(app)

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("brand_to_generic.json") as f:
    brand_map = json.load(f)

with open("generic_to_smiles.json") as f:
    smiles_map = json.load(f)


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
                "message": "⚠ Duplicate active ingredient detected! This may cause overdose risk."
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
    data = request.get_json(force=True)

    medicine = data.get("medicine", "").lower()
    age = int(data.get("age", 0))
    allergies = data.get("allergies", [])
    current_meds = data.get("currentMeds", [])

    issues = []

    if medicine not in brand_map:
        return jsonify({
            "medicine": medicine,
            "result": "❌ Unknown Medicine",
            "message": "Medicine not found in database"
        })

    generics = brand_map[medicine]

    for g in generics:
        if g in allergies:
            issues.append(f"Allergic to {g}")

    if age < 12:
        issues.append("Not recommended for children under 12")

    duplicates = check_duplicate_ingredients(current_meds + [medicine])
    if duplicates:
        issues.append(f"Contains duplicate ingredient: {', '.join(duplicates)}")

    if issues:
        return jsonify({
            "medicine": medicine,
            "result": "⚠ Not Safe",
            "message": " | ".join(issues)
        })
    else:
        return jsonify({
            "medicine": medicine,
            "result": "✅ Safe",
            "message": "No major risk detected"
        })

if __name__ == "__main__":
    app.run(debug=True)