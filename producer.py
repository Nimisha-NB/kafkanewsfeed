from kafka import KafkaProducer
import json
import time

# Create a Kafka producer
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Sample user behavior events
events = [
    {"user_id": 1, "action": "click", "article_id": "A1"},
    {"user_id": 2, "action": "like", "article_id": "A2"},
    {"user_id": 1, "action": "read", "article_id": "A3", "time_spent": 45},
]

for event in events:
    producer.send("user-events", event)
    print(f"Sent: {event}")
    time.sleep(1)

producer.flush()
