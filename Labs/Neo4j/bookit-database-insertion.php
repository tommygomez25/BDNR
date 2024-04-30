<?php

require __DIR__ . '/vendor/autoload.php';

use Laudis\Neo4j\Authentication\Authenticate;
use Laudis\Neo4j\ClientBuilder;
use Laudis\Neo4j\Databags\TransactionConfiguration;

// Set up the Neo4j client
$auth = Authenticate::basic('neo4j', 'password');
$client = ClientBuilder::create()
    ->withDriver('bolt', 'bolt://localhost:7687', $auth)
    ->withDefaultDriver('bolt')
    ->build();

function insertBookmark($url_md5, $url, $tags, $client) {
    $tags[] = ':all:'; // Add the ':all:' tag to the list of tags
    $currentTimestamp = new DateTime();

    $client->writeTransaction(function ($tsx) use ($url_md5, $url, $tags, $currentTimestamp) {
        // Create the Bookmark node
        $tsx->run('CREATE (b:Bookmark {url_md5: $url_md5, url: $url, timestamp: $timestamp})', [
            'url_md5' => $url_md5,
            'url' => $url,
            'timestamp' => $currentTimestamp
        ]);

        // Create Tag nodes and relationships
        foreach ($tags as $tag) {
            $tsx->run('MERGE (t:Tag {name: $tag}) MERGE (b)-[:TAGGED_WITH]->(t)', [
                'tag' => $tag
            ]);
        }
    }, TransactionConfiguration::default());

    echo "Batch insert completed.\n";
}

?>