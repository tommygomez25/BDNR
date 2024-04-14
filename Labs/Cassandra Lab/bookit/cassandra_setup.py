from cassandra.cluster import Cluster
from cassandra.io.libevreactor import LibevConnection

def get_session():
    cluster = Cluster(connection_class=LibevConnection)
    session = cluster.connect('bookit')
    return session