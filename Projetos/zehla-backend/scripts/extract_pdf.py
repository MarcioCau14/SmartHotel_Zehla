import sys
import os

pdf_path = "/Users/marciocau/Downloads/Guia_Google_para_Pousadas_-_Quarto_Cheio.pdf"
output_path = "/Users/marciocau/Downloads/Guia_Google_para_Pousadas_-_Quarto_Cheio.txt"

try:
    from pypdf import PdfReader
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"SUCCESS: Extracted to {output_path}")
except ImportError:
    print("pypdf not found. Trying to install...")
    import subprocess
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "pypdf"], check=True)
        from pypdf import PdfReader
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"SUCCESS: Extracted to {output_path} after install")
    except Exception as e:
        print(f"ERROR: {e}")
except Exception as e:
    print(f"ERROR: {e}")
