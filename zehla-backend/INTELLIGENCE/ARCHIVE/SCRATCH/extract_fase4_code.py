from pypdf import PdfReader
import os

pdf_path = "/Users/marciocau/zehla-backend/ZEHLA_Whatsapp_brain/ZEHLA_Brain_Fase4_Implementacao_Codigo.pdf"
output_path = "/Users/marciocau/zehla-backend/ZEHLA_Whatsapp_brain/ZEHLA_Brain_Fase4_Implementacao_Codigo.txt"

try:
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"SUCCESS: Extracted to {output_path}")
except Exception as e:
    print(f"ERROR: {e}")
