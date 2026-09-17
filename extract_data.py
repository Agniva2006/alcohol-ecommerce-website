import pandas as pd
import json

file_path = r"C:\Users\User\Desktop\sip&savior\Jalpaiguri_Complete_Alcohol_Inventory_Matrix(AutoRecovered).xlsx"
xl = pd.ExcelFile(file_path)

data = {}
for sheet in xl.sheet_names:
    df = xl.parse(sheet)
    # Convert dataframe to list of dictionaries
    records = df.to_dict(orient='records')
    # Clean keys (trim spaces)
    cleaned_records = []
    for r in records:
        cleaned_r = {str(k).strip(): v for k, v in r.items()}
        cleaned_records.append(cleaned_r)
    data[sheet] = cleaned_records

with open(r"C:\Users\User\Desktop\sip&savior\backend\seed_data.json", "w") as f:
    json.dump(data, f, indent=2)

print("Data extracted successfully to backend/seed_data.json")
