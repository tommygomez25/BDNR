import json

# Load data from JSON file
with open('./data/chats.json') as f:
    chats = json.load(f)
    
with open('./data/messages.json') as f:
    messages = json.load(f)
    
with open('./data/users.json') as f:
    users = json.load(f)
    
# Create a new dictionary where the key is the user ID and the value is the user's username
usernames = {user['id']: user['username'] for user in users}

user_chats = {}

# Iterate over each message
for message in messages:
    senderID = message['senderID']
    receiverID = message['receiverID']
    
    sender = usernames[senderID]
    receiver = usernames[receiverID]
    
    # check if the sender comes first alphabetically
    if sender < receiver:
        chatID = f"{sender}:{receiver}"
    else:
        chatID = f"{receiver}:{sender}"
        
    user_chats[message['chatID']] = chatID
        
    # remove the chatID from the message
    del message['chatID']
    
    # Store in the message if the chatID + ":" + message['id']
    message['id'] = f"{chatID}:{message['id']}"
    
# Save messages to new JSON file
with open('./data/user_messages.json', 'w') as f:
    json.dump(messages, f, indent=4)
    
# Iterate over each chat
for chat in chats:
    id = chat['id']
    
    # Replace the chatID with the new user_chatID
    chat['id'] = user_chats[id]
    
# Save chats to new JSON file
with open('./data/user_chats.json', 'w') as f:
    json.dump(chats, f, indent=4)
    
    
    

        
    
    
