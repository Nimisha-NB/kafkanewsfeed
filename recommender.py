from kafka import KafkaConsumer
import json
from collections import defaultdict
from news_api import articles  # import articles fetched from NewsAPI

# Store user interactions
user_history = defaultdict(list)  # {user_id: [article_ids]}


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

# Kafka consumer
consumer = KafkaConsumer(
    'user-events',
    bootstrap_servers='localhost:9092',
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    group_id='recommender-group',
    value_deserializer=lambda v: json.loads(v.decode('utf-8'))
)

print("Listening for user events...")

for message in consumer:
    event = message.value
    user_id = event['user_id']
    article_id = event['article_id']

    # Update user history
    user_history[user_id].append(article_id)
    print(f"User {user_id} interacted with {article_id}")

    # Generate recommendations
    recs = recommend_articles(user_id)
    print(f"Recommended articles for User {user_id}: {[r['title'] for r in recs]}\n")
