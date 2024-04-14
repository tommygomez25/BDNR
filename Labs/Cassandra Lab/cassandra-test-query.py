
from cassandra.cluster import Cluster
from cassandra.io.libevreactor import LibevConnection

# Connect to the Cassandra server running on the localhost.
cluster = Cluster(connection_class=LibevConnection)

# Connect to the `bdnr_test` keyspace.
session = cluster.connect('bdnr_test')

# Execute a CQL statement and iterate through the results.
catalog = session.execute('SELECT * FROM catalog')
for product in catalog:
  print(product.product_id, product.product_description)