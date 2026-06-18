import json

def calculate_score(enriched_data):
    """
    Calculates Lead Scoring based on Fit, Activity, and Recency.
    """
    score = 0
    rationales = []
    
    # 1. Fit (Firmographics) - 40 points max
    rooms = enriched_data.get("sources", {}).get("cadastur", {}).get("rooms", 0)
    if rooms > 20:
        score += 40
        rationales.append("High Fit: Large capacity (>20 rooms)")
    elif rooms > 10:
        score += 25
        rationales.append("Medium Fit: Moderate capacity (10-20 rooms)")
    else:
        score += 10
        rationales.append("Low Fit: Small capacity (<10 rooms)")
        
    # 2. Activity (Engagement) - 30 points max
    response_rate = enriched_data.get("sources", {}).get("booking", {}).get("response_rate")
    if response_rate == "High":
        score += 30
        rationales.append("High Activity: Very responsive to guest feedback")
    elif response_rate == "Medium":
        score += 15
        rationales.append("Medium Activity: Periodic responses")
        
    # 3. Recency (Digital Footprint) - 30 points max
    recent_reviews = enriched_data.get("sources", {}).get("booking", {}).get("recent_reviews", 0)
    if recent_reviews > 10:
        score += 30
        rationales.append("Fresh Lead: High volume of recent reviews (last 30 days)")
    elif recent_reviews > 2:
        score += 15
        rationales.append("Active Lead: Some recent reviews")
        
    # Final Categorization
    if score >= 80:
        category = "HOT"
    elif score >= 50:
        category = "WARM"
    else:
        category = "COLD"
        
    return {
        "final_score": score,
        "category": category,
        "rationales": rationales
    }

if __name__ == "__main__":
    # Test scoring with dummy data
    test_data = {
        "sources": {
            "cadastur": {"rooms": 15},
            "booking": {"response_rate": "High", "recent_reviews": 5}
        }
    }
    print(json.dumps(calculate_score(test_data), indent=2))
