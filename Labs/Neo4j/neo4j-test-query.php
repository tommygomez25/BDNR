
​​<?php
require __DIR__ . '/vendor/autoload.php';

use \Laudis\Neo4j\Authentication\Authenticate;
use \Laudis\Neo4j\ClientBuilder;

$auth = Authenticate::basic('neo4j', 'ola12345678');
$client = ClientBuilder::create()
               ->withDriver('http', 'http://localhost:7474', $auth)
               ->withDefaultDriver('http')
               ->build();

// get all the bookmarks
$results = $client->run('MATCH (b:Bookmark) RETURN b');
foreach ($results as $result) {
    $bookmark = $result->get('b');
    echo "URL: " . $bookmark->value('url') . "\n";
    echo "Tags: " . implode(", ", $bookmark->value('tags')) . "\n";
    echo "Timestamp: " . $bookmark->value('timestamp') . "\n";
    echo "\n";
}
?>