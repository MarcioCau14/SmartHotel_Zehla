from competitor_analyzer import CompetitorAnalyzer
import os

def generate_reports():
    # 1. Cloudbeds
    cb = CompetitorAnalyzer("Cloudbeds", "https://cloudbeds.com")
    cb.add_finding("structural", "headquarters", "San Diego, CA (EUA)")
    cb.add_finding("structural", "employee_count", "Large (Global)")
    cb.add_finding("structural", "estimated_revenue", "High (Unicorn)")
    cb.add_finding("tech_stack", "ai_tools", ["Cloudbeds Signals (Revenue Management)"])
    cb.add_finding("product_analysis", "core_features", ["PMS", "Channel Manager", "Booking Engine", "Payments"])
    cb.add_finding("product_analysis", "target_audience", ["Independent Hotels", "Boutiques", "Hostels", "Rentals"])
    cb.add_finding("market_footprint", "regions", ["Global", "Brazil"])
    cb.add_finding("swot_war_room", "weaknesses", ["Complexity for very small users", "High pricing", "Global support lag"])
    cb.save_analysis()

    # 2. Asksuite
    ak = CompetitorAnalyzer("Asksuite", "https://asksuite.com")
    ak.add_finding("structural", "headquarters", "Florianópolis, SC (Brasil)")
    ak.add_finding("tech_stack", "ai_tools", ["Proprietary Generative IA", "NLP"])
    ak.add_finding("product_analysis", "core_features", ["Omnichannel Chatbot", "Sales Automation"])
    ak.add_finding("product_analysis", "target_audience", ["Mid-Large Hotels", "Resorts"])
    ak.add_finding("market_footprint", "regions", ["Global (30+ countries)", "Brazil (Market Leader)"])
    ak.add_finding("swot_war_room", "strengths", ["Award-winning chatbot", "Deep hospitality specialization"])
    ak.save_analysis()

    # 3. Bitz Softwares
    bt = CompetitorAnalyzer("Bitz Softwares", "https://bitzsoftwares.com.br")
    bt.add_finding("structural", "headquarters", "Brasil")
    bt.add_finding("tech_stack", "ai_tools", ["IA Otelia (Front-desk/Sales)"])
    bt.add_finding("product_analysis", "core_features", ["Full PMS", "Digital Front-desk", "Otelia AI"])
    bt.add_finding("product_analysis", "target_audience", ["Hotels seeking digital transformation"])
    ak.add_finding("swot_war_room", "threats_to_us", ["Strong focus on AI-driven front-desk automation"])
    bt.save_analysis()

    # 4. Amenitiz
    am = CompetitorAnalyzer("Amenitiz", "https://amenitiz.com")
    am.add_finding("structural", "headquarters", "Barcelona, Spain")
    am.add_finding("product_analysis", "core_features", ["Website Builder", "PMS", "Channel Manager"])
    am.add_finding("product_analysis", "target_audience", ["Small independent hotels", "B&Bs"])
    am.add_finding("swot_war_room", "weaknesses", ["Limited deep automation features compared to enterprise PMS"])
    am.save_analysis()

    # 5. Desbravador
    db = CompetitorAnalyzer("Desbravador", "https://desbravador.com.br")
    db.add_finding("structural", "headquarters", "Chapecó, SC (Brasil)")
    db.add_finding("structural", "employee_count", "500+")
    db.add_finding("product_analysis", "core_features", ["Modular PMS", "POS", "Financial/ERP"])
    db.add_finding("product_analysis", "target_audience", ["From small inns to large resorts"])
    db.add_finding("market_footprint", "regions", ["Latin America leader"])
    db.add_finding("swot_war_room", "weaknesses", ["Legacy system complexity", "Steep learning curve"])
    db.save_analysis()

if __name__ == "__main__":
    generate_reports()
