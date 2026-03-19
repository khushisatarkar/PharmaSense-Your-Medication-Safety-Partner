import pandas as pd
import re

med_df = pd.read_csv("updated_indian_medicine_data.csv")
med_df['name'] = med_df['name'].str.lower()

def clean_ingredients(text):
    text = str(text).lower()
    text = re.sub(r'\d+.*?(mg|ml|%)', '', text)
    text = re.sub(r'\(.*?\)', '', text)
    words = re.findall(r'[a-zA-Z]+', text)
    return list(set(words))

def get_ingredients(medicine):
    medicine = medicine.lower()
    
    matches = med_df[med_df['name'].str.contains(medicine, na=False)]
    
    if not matches.empty:
        raw = matches.iloc[0]['ingredients']
        return clean_ingredients(raw)
    
    return []

def analyze_medicine(medicine, age, allergies, dosage):
    ingredients = get_ingredients(medicine)

    if not ingredients:
        return {
            "medicine": medicine,
            "result": "Not Found",
            "message": "Medicine not found in database",
            "ingredients": [],
            "side_effects": []
        }

    unsafe = False
    reason = "Safe for use"

    for ing in ingredients:
        if ing in allergies:
            unsafe = True
            reason = f"Allergy detected: {ing}"

    # dosage 
    if dosage == "daily" and age < 12:
        unsafe = True
        reason = "Not safe for daily use in children"

    return {
        "medicine": medicine,
        "result": "Unsafe" if unsafe else "Safe",
        "message": reason,
        "ingredients": ingredients,
        "side_effects": []  # add later from SIDER
    }