import requests
import os
import json
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv("../.env")

class Agent:
    def generate_keywords_from_articles(self, articles: List[Dict]) -> Dict[str, any]:
        articles_text = self._format_articles(articles)
        return self._fetch_keywords_from_ai(articles_text)

    def _format_articles(self, articles: List[Dict]) -> str:
        formatted_text = "=== NEWS ARTICLES FOR ANALYSIS ===\n\n"
        
        for idx, article in enumerate(articles, 1):
            formatted_text += f"Article {idx}:\n"
            formatted_text += f"  Title: {article.get('title', 'N/A')}\n"
            formatted_text += f"  Description: {article.get('description', 'N/A')}\n"
            formatted_text += f"  Source: {article.get('source', 'N/A')}\n"
            formatted_text += f"  Published: {article.get('publishedAt', 'N/A')}\n"
            formatted_text += f"  URL: {article.get('url', 'N/A')}\n"
            
            if article.get('tags'):
                formatted_text += f"  Tags: {', '.join(article['tags'][:10])}\n"
            
            formatted_text += "\n" + "-" * 80 + "\n\n"
        
        return formatted_text

    def _prepare_messages(self, articles_text: str) -> List[Dict]:
        return [
            {
                "role": "system",
                "content": (
                    "You are an expert news analyst specialized in identifying key trends and generating "
                    "relevant search keywords from multiple news articles. Your task is to:\n\n"
                    "1. Analyze the provided news articles\n"
                    "2. Identify the main themes and topics\n"
                    "3. Generate EXACTLY 3 keywords that would be most effective for finding related fresh news\n"
                    "4. Provide a brief summary of the analyzed content\n\n"
                    "IMPORTANT: Always return your response in the following JSON format:\n\n"
                    "```json\n"
                    "{\n"
                    '  "keywords": ["keyword1", "keyword2", "keyword3"],\n'
                    '  "summary": "Brief summary of the analyzed articles and why these keywords are relevant",\n'
                    '  "topics": ["topic1", "topic2", "topic3"]\n'
                    "}\n"
                    "```\n\n"
                    "Guidelines for keyword generation:\n"
                    "- Keywords should be 1-3 words each\n"
                    "- Focus on the most newsworthy and trending aspects\n"
                    "- Avoid overly generic terms\n"
                    "- Prioritize terms that would fetch relevant, current news\n"
                    "- Consider both specific entities (companies, people, technologies) and broader themes\n"
                    "- MUST return exactly 3 keywords, no more, no less\n"
                )
            },
            {
                "role": "user",
                "content": articles_text
            }
        ]

    def _fetch_keywords_from_ai(self, articles_text: str) -> Dict[str, any]:
        messages = self._prepare_messages(articles_text)
        
        url = 'https://api.openai.com/v1/chat/completions'
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f"Bearer {os.getenv('OPENAI_API_KEY')}"
        }

        data = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.5,
            "response_format": {"type": "json_object"}
        }

        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            content = response.json()['choices'][0]['message']['content'].strip()
            
            try:
                result = json.loads(content)
                
                if 'keywords' in result and len(result['keywords']) != 3:
                    result['keywords'] = result['keywords'][:3] if len(result['keywords']) > 3 else result['keywords'] + ['news', 'update', 'latest'][:3-len(result['keywords'])]
                
                return result
            except json.JSONDecodeError:
                raise Exception(f"Failed to parse AI response as JSON: {content}")
        else:
            raise Exception(f"Error: {response.status_code} - {response.text}")


if __name__ == "__main__":
    with open("../articles.json", "r") as f:
        sample_articles = json.load(f)
    agent = Agent()
    
    try:
        result = agent.generate_keywords_from_articles(sample_articles)
        print("Generated Keywords:", result['keywords'])
        print("\nTopics:", result['topics'])
    except Exception as e:
        print(f"Error: {e}")