import json
from faker import Faker
import random
from datetime import datetime

    
fake = Faker()

# Generate users data
users = []
for i in range(1000):
    user = {
        "id": i,
        "username": fake.user_name(),
        "firstName": fake.first_name(),
        "lastName": fake.last_name(),
        "email": fake.email(),
        "gender": random.choice(["Male", "Female"]),
        "bio": fake.sentence(),
        "phoneNumber": fake.phone_number(),
        "birthday": fake.date_of_birth(minimum_age=18, maximum_age=90).strftime('%m/%d/%Y'),
        "location": fake.address(),
        "profileVisibility": fake.boolean(),
        "messagePrivacy": fake.boolean()
    }
    users.append(user)

# Generate posts data
posts = []
for i in range(1000):
    post = {
        "id": i,
        "title": fake.sentence(),
        "content": fake.paragraph(),
        "postDate": fake.date_this_year().strftime('%m/%d/%Y'),
        "postTime": fake.time(pattern="%H:%M:%S"),
        "numLikes": fake.random_number(digits=3),
        "numFavs": fake.random_number(digits=3),
        "postPrivacy": fake.boolean(),
        "wasEdited": fake.boolean(),
        "username": random.choice([user['username'] for user in users]),
        "comments": [],
        "popularityScore": fake.random_number(digits=5),
        "timestamp": fake.random_number(digits=4)
    }
    posts.append(post)
    
reference_date = datetime(2001, 1, 1)

# para cada post adicionar field popularityScore, que é numLikes + (age*10)
for post in posts:
    post_date = datetime.strptime(post['postDate'], '%m/%d/%Y')
    age = (post_date - reference_date).days
    
    post['timestamp'] = age

    # Calcular a pontuação de popularidade
    popularity_score = post['numLikes'] + (age * 10)

    # Adicionar o campo popularityScore ao post
    post['popularityScore'] = popularity_score
    

# Generate comments for posts
for post in posts:
    num_comments = random.randint(0, 20)  # número aleatório de comentários para cada post
    post['comments'] = []

    for _ in range(num_comments):
        comment = {
            "id": fake.unique.random_number(digits=5),
            "username": random.choice([user['username'] for user in users]),
            "content": fake.paragraph(),
            "commentDate": fake.date_this_year().strftime('%m/%d/%Y'),
            "commentTime": fake.time(pattern="%H:%M:%S"),
            "numLikes": fake.random_number(digits=3),
            "postPrivacy": fake.boolean(),
            "wasEdited": fake.boolean(),
            "postId": post['id']
        }
        post['comments'].append(comment)


# Generate follows data
follows = []
for user in users:
    followed_users = random.sample([u['username'] for u in users if u['username'] != user['username']], random.randint(1, min(100, len(users)-1)))
    follow_data = {
        "username": user['username'],
        "follows": followed_users
    }
    follows.append(follow_data)

# Generate followers data
followers = []
for user in users:
    followers_list = random.sample([u['username'] for u in users if u['username'] != user['username']], random.randint(1, min(100, len(users)-1)))
    followers_data = {
        "username": user['username'],
        "followers": followers_list
    }
    followers.append(followers_data)

# Write data to JSON files
with open('users.json', 'w') as f:
    json.dump(users, f, indent=4)

with open('posts.json', 'w') as f:
    json.dump(posts, f, indent=4)

with open('follows.json', 'w') as f:
    json.dump(follows, f, indent=4)

with open('followers.json', 'w') as f:
    json.dump(followers, f, indent=4)

    
