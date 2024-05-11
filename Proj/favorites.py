import json

# Load data from JSON file
with open('./data/favorites.json') as f:
    favorites = json.load(f)

# Create a new dictionary to store the data in the desired format
user_posts = {}

# Iterate over each favorite entry
for favorite in favorites:
    username = favorite['username']
    postID = favorite['postID']
    
    # Check if the username already exists in the dictionary
    if username in user_posts:
        # Append the post ID to the existing list
        user_posts[username].append(postID)
    else:
        # Create a new list with the first post ID
        user_posts[username] = [postID]

# Save the data to a new JSON file
with open('./data/user_posts.json', 'w') as f:
    json.dump(user_posts, f, indent=4)