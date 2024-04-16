from cassandra.cluster import Cluster
from cassandra.io.libevreactor import LibevConnection

# Connect to the Cassandra server running on the localhost.
cluster = Cluster(connection_class=LibevConnection)
session = cluster.connect()

# Create the `bookit` keyspace.
session.execute(
        """
        CREATE KEYSPACE IF NOT EXISTS bookit
        WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 }
        """
)

# Connect to the `bookit` keyspace.
session.set_keyspace('bookit')

# Create tables
session.execute("""
    CREATE TABLE IF NOT EXISTS bookmarks (
        url_md5 TEXT PRIMARY KEY,
        url TEXT,
        timestamp TIMESTAMP,
        tags SET<TEXT>
    )
""")

session.execute("""
    CREATE TABLE IF NOT EXISTS bookmarks_by_tags (
        tag TEXT,
        url_md5 TEXT,
        url TEXT,
        timestamp TIMESTAMP,
        PRIMARY KEY ((tag), timestamp)
    ) WITH CLUSTERING ORDER BY (timestamp DESC);
""")

print("Setup complete!")