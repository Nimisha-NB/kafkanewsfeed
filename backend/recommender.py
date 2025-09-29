from collections import defaultdict
from news_api import fetch_articles


# Store user interactions
user_history = defaultdict(list)  # {user_id: [article_ids]}

articles = fetch_articles(page_size=20)
# print(user_history)


def recommend_articles(user_id):

    
    # Get all articles the user has interacted with
    read_articles = user_history.get(user_id, [])

    # Collect all tags from articles the user has read
    read_tags = []
    for a_id in read_articles:
        for art in articles:
            if art["article_id"] == a_id:
                read_tags.extend(art.get("tags", []))

    # Recommend articles that share tags but the user hasn't read yet
    recommendations = []
    for art in articles:
        if art["article_id"] not in read_articles and any(tag in read_tags for tag in art.get("tags", [])):
            recommendations.append(art)

    return recommendations


