import zipfile
import xml.etree.ElementTree as ET
import os

def extract_docx_text(docx_path):
    try:
        # docx is a zip file
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
            
        root = ET.fromstring(xml_content)
        
        # XML namespaces used by Word
        namespaces = {
            'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
        }
        
        paragraphs = []
        for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = [node.text for node in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
            if texts:
                paragraphs.append("".join(texts))
            else:
                paragraphs.append("")
                
        return "\n".join(paragraphs)
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == '__main__':
    docx_path = '/Users/marciocau/Downloads/OSINT_CONDUCTING_AI_COMPLETO/OSINT_CONDUCTING_AI_ANALISE_COMPLETA.docx'
    output_path = '/Users/marciocau/Downloads/OSINT_CONDUCTING_AI_COMPLETO/OSINT_CONDUCTING_AI_ANALISE_COMPLETA_EXTRACTED.txt'
    
    print(f"Extracting text from {docx_path}...")
    text = extract_docx_text(docx_path)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)
        
    print(f"Extracted text saved to {output_path} (Size: {len(text)} chars)")
