<?php

require __DIR__ . '/vendor/autoload.php';

use Laudis\Neo4j\Authentication\Authenticate;
use Laudis\Neo4j\ClientBuilder;

// Set up the Neo4j client
$auth = Authenticate::basic('neo4j', 'password');
$client = ClientBuilder::create()
    ->withDriver('http', 'http://localhost:7687', $auth)
    ->withDefaultDriver('http')
    ->build();

function queryBookmarkInfo($url_md5, $client) {
    $query = 'MATCH (b:Bookmark {url_md5: $url_md5}) RETURN b';
    $results = $client->run($query, ['url_md5' => $url_md5]);
    foreach ($results as $row) {
        print_r($row);
    }
}

function queryLatestBookmarks($client) {
    $query = 'MATCH (b:Bookmark)-[r:TAGGED_WITH]->(t:Tag {name: ":all:"}) RETURN b ORDER BY b.timestamp DESC';
    $results = $client->run($query);
    foreach ($results as $row) {
        print_r($row);
    }
}

function queryBookmarksByTags($tags, $client) {
    $bookmarks = [];
    foreach ($tags as $tag) {
        $query = 'MATCH (b:Bookmark)-[r:TAGGED_WITH]->(t:Tag {name: $tag}) RETURN b ORDER BY b.timestamp DESC';
        $results = $client->run($query, ['tag' => $tag]);
        foreach ($results as $result) {
            $bookmarks[$tag][] = $result;
        }
    }

    // Intersecting results
    if (!empty($tags)) {
        $intersection = call_user_func_array('array_intersect', $bookmarks);
        foreach ($intersection as $bookmark) {
            print_r($bookmark);
        }
    } else {
        echo "No tags provided\n";
    }
}

?>
