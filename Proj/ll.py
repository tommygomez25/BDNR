import json
import random

# Carregar dados de usuários do arquivo JSON
with open('./data/users.json', 'r') as file:
    users_data = json.load(file)

# Criar lista para armazenar os dados dos follows
follows_data = []
followers_data = []

# Gerar follows para cada usuário
for user in users_data:
    username = user['username']
    follows = random.sample([u['username'] for u in users_data if u['username'] != username], random.randint(0, int(len(users_data)/2) - 1))
    
    user_data = {
        'username': username,
        'follows': follows
    }
    
    follows_data.append(user_data)

# Gerar followers para cada usuário
for user in users_data:
    username = user['username']
    followers = [u['username'] for u in follows_data if username in u['follows']]
    
    user_data = {
        'username': username,
        'followers': followers
    }
    
    followers_data.append(user_data)

# Salvar os dados dos follows em um arquivo JSON
with open('./data/follows.json', 'w') as file:
    json.dump(follows_data, file, indent=4)

# Salvar os dados dos followers em um arquivo JSON
with open('./data/followers.json', 'w') as file:
    json.dump(followers_data, file, indent=4)

print("Arquivos follows.json e followers.json criados com sucesso!")
