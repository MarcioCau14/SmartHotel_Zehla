import pandas as pd
import re

file_path = "/Users/marciocau/Downloads/LEADS_POUSADAS_PRAIA_DO_ROSA.xlsx"

# Read the excel file
df = pd.read_excel(file_path)

def parse_price(price_str):
    if pd.isna(price_str) or price_str == "-":
        return 0
    # Remove "R$ ", "." and then replace "," with "." if needed
    # Example: "R$ 1.099" -> 1099
    # Example: "R$ 1.500" -> 1500
    clean = re.sub(r'[^\d]', '', str(price_str))
    try:
        return float(clean)
    except:
        return 0

# Create a temporary column for sorting
df['sort_val'] = df['VALORES'].apply(parse_price)

# Sort descending
df = df.sort_values(by='sort_val', ascending=False)

# Drop the temporary column
df = df.drop(columns=['sort_val'])

# Save back to the same location
df.to_excel(file_path, index=False)
print(f"File sorted successfully: {file_path}")
