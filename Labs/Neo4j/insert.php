<?php


require __DIR__ . '/vendor/autoload.php';

use \Laudis\Neo4j\Authentication\Authenticate;
use \Laudis\Neo4j\ClientBuilder;

$auth = Authenticate::basic('neo4j', 'ola12345678');
$client = ClientBuilder::create()
               ->withDriver('http', 'http://localhost:7474', $auth)
               ->withDefaultDriver('http')
               ->build();

// get the url 
$url = $_POST['url'];
$tags = [];
if (isset($_POST['tags'])) {
    $tags = explode(',', $_POST['tags']);
}

echo "URL: " . $url . "\n";
echo "Tags: " . implode(", ", $tags) . "\n";

function insertBookmark($url, $tags, $client) {
    try {
        // Always merge the bookmark to avoid duplication but create new relationships if necessary
        foreach ($tags as $tag) {
            $client->run(<<<CYPHER
                MERGE (b:Bookmark {url: \$url})
                ON CREATE SET b.when_added = datetime()
                MERGE (t:Tag {name: \$tag})
                MERGE (b)-[:HAS_TAG]->(t);
            CYPHER, [
                'url' => $url,
                'tag' => $tag  // Pass each tag individually
            ]);
        }
        echo "Bookmark and tags handled.\n";
    } catch (Exception $e) {
        echo "An error occurred: " . $e->getMessage();
    }
}

insertBookmark($url, $tags, $client);
?>