import re

file_path = "/Users/marciocau/Downloads/SECRETARIA.AI — RELATÓRIO DE SINCRONIZAÇÃO FRONT-END ↔ BACK-END.md"
with open(file_path, 'r') as f:
    lines = f.readlines()
    for idx, line in enumerate(lines):
        if re.search(r'ipad|air', line, re.IGNORECASE):
            print(f"Line {idx+1}: {line.strip()}")
