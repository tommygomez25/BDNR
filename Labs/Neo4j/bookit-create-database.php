<?php 

require __DIR__ . '/vendor/autoload.php';

use \Laudis\Neo4j\Authentication\Authenticate;
use \Laudis\Neo4j\ClientBuilder;

$auth = Authenticate::basic('neo4j', 'ola12345678');
$client = ClientBuilder::create()
        ->withDriver('http', 'http://localhost:7687', $auth)
        ->withDefaultDriver('http')
        ->build();

// Assuming you want to perform some initial setup or operations:
$results = $client->run(<<<'CYPHER'
// Your Cypher query to create nodes, relationships, or set up the schema
// For example, creating a node:
CREATE (b:Bookmark {url_md5: 'hash_here', url: 'http://example.com', timestamp: datetime()})
// Create Tags and Link to Bookmark
FOREACH (tag IN ['Neo4j', 'Database', 'Graph'] | 
    MERGE (t:Tag {name: tag})
    MERGE (b)-[:TAGGED_WITH]->(t)
)
CYPHER
);

echo 'Setup or node creation completed successfully';

?>
