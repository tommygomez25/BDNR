import json
import random
from datetime import datetime

# Carregar dados de usuários do arquivo JSON
with open('./data/posts.json') as f:
    posts = json.load(f)
    
reference_date = datetime(2001, 1, 1)

# para cada post adicionar field popularityScore, que é numLikes + (age*10)
for post in posts:
    post_date = datetime.strptime(post['postDate'], '%m/%d/%Y')
    age = (post_date - reference_date).days

    # Calcular a pontuação de popularidade
    popularity_score = post['numLikes'] + (age * 10)

    # Adicionar o campo popularityScore ao post
    post['popularityScore'] = popularity_score

# load the posts to json
with open('./data/posts.json', 'w') as f:
    json.dump(posts, f, indent=4)
    
    
    
