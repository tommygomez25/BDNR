import json
import datetime

# Load data from JSON file
with open('./data/posts.json') as f:
    posts = json.load(f)
    
# Iterate over each post
for post in posts:
    
    # we have a post date with 'postDate' in the format MM/DD/YYYY and 'postTime' in the format HH:MM:SS and we want to convert them both to a single timestamp object
    postDate = post['postDate']
    postTime = post['postTime']
    
    # Split the date and time into month, day, year, hour, minute, and second
    month, day, year = postDate.split('/')
    hour, minute, second = postTime.split(':')
    
    # Create a datetime object
    datetimeObj = datetime.datetime(int(year), int(month), int(day), int(hour), int(minute), int(second))
    
    # Convert the datetime object to a timestamp
    timestamp = datetimeObj.timestamp()
    
    # remove decimal from timestamp
    timestamp = int(timestamp)
    
    # Store the timestamp in the post
    post['timestamp'] = timestamp
    

# Save posts to new JSON file
with open('./data/date_posts.json', 'w') as f:
    json.dump(posts, f, indent=4)