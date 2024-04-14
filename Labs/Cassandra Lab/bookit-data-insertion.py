from cassandra.cluster import Cluster
from cassandra.io.libevreactor import LibevConnection
from cassandra.query import BatchStatement, SimpleStatement

def insert_bookmark(url_md5, url, tags):


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
