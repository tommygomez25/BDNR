import json
import random
from datetime import datetime

# Carregar dados de usuários do arquivo JSON
with open('./data/posts.json') as f:
    posts = json.load(f)

# create dict words
words = {}

# para cada post adicionar field popularityScore, que é numLikes + (age*10)
for post in posts:
    # break post['title'] into array of words (separate whitespace, punctuation)
    title_words = post['title'].split()

    id = post['id']

    # para cada palavra no título do post
    # append to the dict words value the id of the post
    for word in title_words:
        if word in words:
            words[word].append(id)
        else:
            words[word] = [id]

# load the posts to json
with open('./data/words.json', 'w') as f:
    json.dump(words, f, indent=4)
    
    
    
