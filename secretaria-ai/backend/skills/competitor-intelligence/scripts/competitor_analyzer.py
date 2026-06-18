import os
import json
import datetime

class CompetitorAnalyzer:
    """
    Framework para Inteligência Competitiva e Corporate OSINT.
    Padroniza a coleta de dados de adversários e análise estratégica.
    """
    
    def __init__(self, target_name, target_url):
        self.target_name = target_name
        self.target_url = target_url
        self.data = {
            "metadata": {
                "generated_at": datetime.datetime.now().isoformat(),
                "target": target_name,
                "url": target_url
            },
            "structural": {
                "cnpj": None,
                "founders": [],
                "employee_count": "Unknown",
                "estimated_revenue": "Unknown",
                "headquarters": None
            },
            "tech_stack": {
                "crm": None,
                "ai_tools": [],
                "marketing_automation": [],
                "hosting_infrastructure": None,
                "proprietary_tech": False
            },
            "product_analysis": {
                "core_features": [],
                "pricing_model": "Unknown",
                "integrations": [],
                "target_audience": []
            },
            "market_footprint": {
                "regions": [],
                "client_clusters": [],
                "social_proof": "Unknown"
            },
            "swot_war_room": {
                "strengths": [],
                "weaknesses": [],
                "opportunities": [],
                "threats_to_us": []
            }
        }

    def save_analysis(self, output_path=None):
        if not output_path:
            filename = f"analysis_{self.target_name.lower().replace(' ', '_')}.json"
            output_path = os.path.join(os.path.dirname(__file__), "..", "reports", filename)
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=4, ensure_ascii=False)
        print(f"Relatório de Inteligência salvo em: {output_path}")

    def add_finding(self, category, key, value):
        """Adiciona uma descoberta ao relatório."""
        if category in self.data:
            if isinstance(self.data[category].get(key), list):
                if isinstance(value, list):
                    self.data[category][key].extend(value)
                else:
                    self.data[category][key].append(value)
            else:
                self.data[category][key] = value

if __name__ == "__main__":
    # Exemplo de uso para inicializar uma nova pesquisa
    analyzer = CompetitorAnalyzer("Target Example", "https://example.com")
    analyzer.save_analysis()
