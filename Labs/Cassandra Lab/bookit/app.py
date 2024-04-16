import hashlib
from flask import Flask, render_template, request, redirect, url_for
from cassandra_setup import get_session
from cassandra.query import BatchStatement, SimpleStatement
from collections import defaultdict

app = Flask(__name__)

def insert_bookmark(url_md5, url, tags):
    session = get_session()

    # Prepare the batch statement
    batch = BatchStatement()

    # Current timestamp to be used for all inserts
    from datetime import datetime
    current_timestamp = datetime.now()

    # Insert into bookmarks table
    batch.add(SimpleStatement("""
        INSERT INTO bookmarks (url_md5, url, timestamp, tags)
        VALUES (%s, %s, %s, %s)
    """), (url_md5, url, current_timestamp, set(tags)))

    # Insert into bookmarks_by_tags for each tag and ':all:' tag
    tags.append(':all:')
    for tag in tags:
        batch.add(SimpleStatement("""
            INSERT INTO bookmarks_by_tags (tag, url_md5, url, timestamp)
            VALUES (%s, %s, %s, %s)
        """), (tag, url_md5, url, current_timestamp))

    # Execute batch
    session.execute(batch)
    print("Batch insert completed.")

    # Close the session
    session.shutdown()

def query_bookmark_info(url_md5):
    session = get_session()

    query = "SELECT * FROM bookmarks WHERE url_md5 = %s"
    result = session.execute(query, [url_md5])
    print(result[0] if result else None)
    return result[0] if result else None

def query_latest_bookmarks():
    session = get_session()
    query = "SELECT * FROM bookmarks_by_tags WHERE tag = ':all:' ORDER BY timestamp DESC"
    result = session.execute(query)
    return list(result) if result else []

def query_bookmarks_by_tags(tags):
    session = get_session()

    bookmarks = defaultdict(list)

    for tag in tags:
        query = "SELECT * FROM bookmarks_by_tags WHERE tag = %s ORDER BY timestamp DESC"
        results = session.execute(query, [tag])
        for result in results:
            bookmarks[tag].append(result)

    # Intersecting results on the client side
    if tags:
        # Start with bookmarks from the first tag
        intersection = set(bookmarks[tags[0]])
        for tag in tags[1:]:
            intersection.intersection_update(bookmarks[tag])
        
        
        # Print intersected results
        for bookmark in intersection:
            print(bookmark)

        return list(intersection)
    else:
        print("No tags provided")
    
    return bookmarks if bookmarks else []

def query_tags(url_md5):
    session = get_session()

    query = "SELECT tags FROM bookmarks WHERE url_md5 = %s"
    result = session.execute(query, [url_md5])
    print(result[0].tags if result else None)
    return result[0].tags if result else None


@app.route('/', methods=['GET'])
def index():
    session = get_session()
    bookmarks = []  # Initialize bookmarks as an empty list
    bookmark_results = query_latest_bookmarks()

    for bookmark in bookmark_results:
        bookmark_dict = {column: value for column, value in bookmark._asdict().items()}
        tags = query_tags(bookmark_dict['url_md5'])
        bookmark_dict['tags'] = tags
        bookmarks.append(bookmark_dict)

    session.shutdown()
    return render_template('index.html', bookmarks=bookmarks)

@app.route('/add', methods=['GET', 'POST'])
def add():
    if request.method == 'POST':
        url = request.form.get('url')  # This will return None if 'url' isn't present
        tags = request.form.get('tags')

        # Check if the url and tags are not None and not empty
        if url and tags:
            tags = tags.split(',')  # Assume tags are comma-separated
            url_md5 = hashlib.md5(url.encode()).hexdigest()
            insert_bookmark(url_md5, url, tags)
            return redirect(url_for('index'))
        else:
            # Handle the error: either display a message or redirect with an error message
            return "URL and Tags are required!", 400

    return render_template('add.html')

@app.route('/bookmark/<url_md5>', methods=['GET'])
def bookmark(url_md5):
    bookmark_info = query_bookmark_info(url_md5)
    return render_template('bookmark.html', bookmark=bookmark_info)

@app.route('/tag/<tag>', methods=['GET'])
def tag(tag):
    bookmark_results = query_bookmarks_by_tags([tag])
    bookmarks = []
    for bookmark in bookmark_results:
        bookmark_dict = {column: value for column, value in bookmark._asdict().items()}
        tags = query_tags(bookmark_dict['url_md5'])
        bookmark_dict['tags'] = tags
        bookmarks.append(bookmark_dict)
    return render_template('tag.html', tag=tag, bookmarks=bookmarks)

if __name__ == '__main__':
    app.run(debug=True)