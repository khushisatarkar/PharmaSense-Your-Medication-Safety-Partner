from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS
import json
from itertools import combinations

from rdkit import Chem
from rdkit.Chem import Descriptors

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


if __name__ == "__main__":
    app.run(debug=True)