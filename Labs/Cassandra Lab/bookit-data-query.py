from cassandra.cluster import Cluster
from cassandra.io.libevreactor import LibevConnection
from collections import defaultdict

# Connect to the Cassandra server running on the localhost.
cluster = Cluster(connection_class=LibevConnection)

# Connect to the `bookit` keyspace.
session = cluster.connect('bookit')

def query_bookmark_info(url_md5):
    query = "SELECT * FROM bookmarks WHERE url_md5 = %s"
    result = session.execute(query, [url_md5])
    for row in result:
        print(row)

def query_latest_bookmarks():
    query = "SELECT * FROM bookmarks_by_tags WHERE tag = ':all:' ORDER BY timestamp DESC"
    result = session.execute(query)
    for row in result:
        print(row)

def query_bookmarks_by_tags(tags):
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
    else:
        print("No tags provided")

