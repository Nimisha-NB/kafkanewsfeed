import requests
import os
import re
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("NEWSAPI_KEY")
BASE_URL = "https://newsapi.org/v2/top-headlines"
# List of common words to ignore in tags
stopwords = {"the", "and", "a", "an", "of", "in", "on", "for", "with", "at","i","is", "to", "from", "by", "that", "this", "it", "as", "be", "are", "was", "were", "has", "have"}

def fetch_articles(category="technology", page_size=10):
    params = {
        "category": category,
        "language": "en",
        "pageSize": page_size,
        "apiKey": API_KEY
    }

    response = requests.get(BASE_URL, params=params)
    data = response.json()

    articles = []
    if data.get("status") == "ok":
        for i, article in enumerate(data.get("articles", [])):
            title = article.get("title") or ""
            
            # Generate tags from title
            words = re.findall(r'\b\w+\b', title.lower())
            tags = [w for w in words if w not in stopwords]
            
            articles.append({
                "article_id": f"A{i+1}",
                "title": title,
                "description": article.get("description"),
                "url": article.get("url"),
                "publishedAt": article.get("publishedAt"),
                "source": article.get("source", {}).get("name"),
                "tags": tags
            })
    return articles

    # print("Fetched articles with tags:")
    # for a in articles:
    #     # print(a["title"], "-> tags:", a["tags"])
    #     print(a["article_id"])
