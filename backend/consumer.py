from kafka import KafkaConsumer
import json
from recommender import user_history, recommend_articles

def consume_user_events():
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