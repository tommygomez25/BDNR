from cassandra.cluster import Cluster
from cassandra.io.libevreactor import LibevConnection

# Connect to the Cassandra server running on the localhost.
cluster = Cluster(connection_class=LibevConnection)

# Connect to the `bdnr_test` keyspace.
session = cluster.connect('bdnr_test')

# Execute a CQL statement to insert a new product and a new shopping cart item.
product = ("00", 1, "Lightsaber Z42", 100000)
session.execute(
        """
        INSERT INTO catalog (product_id, stock, product_description, cost)
        VALUES (%s, %s, %s, %s)
        """,
        product
)

cart_item = ("1001", "00", 1, "Lightsaber Z42", 100000)
session.execute(
        """
        INSERT INTO shopping_cart (user_id, product_id, count, product_description, time_added, cost)
        VALUES (%s, %s, %s, %s, toUnixTimestamp(now()), %s)
        """,
        cart_item
)