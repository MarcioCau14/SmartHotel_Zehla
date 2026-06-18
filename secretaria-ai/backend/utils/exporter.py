import pandas as pd
import os
import shutil
from datetime import datetime
from schema.models import Context

def export_to_excel(context: Context, filename: str = "LISTA_PROSPECCAO_LEADS.xlsx"):
    """
    Automated export to the 'Perfect Format':
    Empresa - Decisor - Cargo - E-mail - WhatsApp - Setor - Social_Media - Porte
    """
    if not context.candidates:
        print("[EXPORTER] No leads found to export.")
        return None

    # Prepare Data with EXACT 10 Columns
    data = []
    org = context.organizations[0] if context.organizations else None
    
    for c in context.candidates:
        org_name = org.name if org else c.metadata.get("source_domain", "N/A")
        setor = org.industry if org else c.metadata.get("sector", "N/A")
        porte = org.size if org else c.metadata.get("size", "Grande Porte")
        cnpj = org.cnpj if org else "N/A"
        address = org.address if org else "N/A"

        data.append({
            "Empresa": org_name,
            "Decisor": c.name,
            "Cargo": c.title,
            "E-mail": c.email,
            "WhatsApp": c.metadata.get("whatsapp", "(11) 99999-0000"),
            "Setor": setor,
            "Social_Media": c.social_links.get("linkedin") or c.social_links.get("instagram", ""),
            "Porte": porte,
            "CNPJ": cnpj,
            "Endereço": address
        })

    # Create DataFrame with ordered columns
    columns = ["Empresa", "Decisor", "Cargo", "E-mail", "WhatsApp", "Setor", "Social_Media", "Porte", "CNPJ", "Endereço"]
    df = pd.DataFrame(data, columns=columns)

    # Paths
    base_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "outbox")
    if not os.path.exists(base_path):
        os.makedirs(base_path)
    
    full_path = os.path.join(base_path, filename)
    downloads_path = f"/Users/marciocau/Downloads/{filename}"

    # Generate XLSX (XLSX preserves links better in Google Sheets)
    with pd.ExcelWriter(full_path, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Leads")

    # AUTO-DOWNLOAD (System copy)
    if os.path.exists("/Users/marciocau/Downloads"):
        shutil.copy(full_path, downloads_path)
        print(f"[EXPORTER] Success! File downloaded to: {downloads_path}")

    return downloads_path
