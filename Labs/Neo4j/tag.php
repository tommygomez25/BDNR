<?php


require __DIR__ . '/vendor/autoload.php';

use \Laudis\Neo4j\Authentication\Authenticate;
use \Laudis\Neo4j\ClientBuilder;

$auth = Authenticate::basic('neo4j', 'ola12345678');
$client = ClientBuilder::create()
               ->withDriver('http', 'http://localhost:7474', $auth)
               ->withDefaultDriver('http')
               ->build();

$tags = [];
if (isset($_GET['tags'])) {
    $tags = explode(',', $_GET['tags']);
}

function queryBookmarksByTags($tags, $client) {
    $query = 'WITH $tags AS tags
    MATCH (b:Bookmark)-[:HAS_TAG]->(t:Tag)
    WHERE t.name IN tags
    // Only show nodes that have the necessary number of distinct matches, i.e. that have all the required tags.
    WITH b, tags, SIZE(tags) AS inputCnt, COUNT(DISTINCT t) AS cnt
    WHERE cnt = inputCnt
    RETURN b.url, tags
    ORDER BY b.when_added;';
    $results = $client->run($query, ['tags' => $tags]);
    return $results;
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Bookmarks by Tags</title>
</head>
<body>
    <h1>Bookmarks by Tags</h1>
    <a href="index.php">Back to Bookmarks</a>
    <br>
    <ul>
    <?php
    
    try {
        $results = queryBookmarksByTags($tags, $client);
        echo "<ul>";
        foreach ($results as $row) {
            $url = $row->get('b.url'); 
            $tags = $row->get('tags'); 

            echo "<li>";
            // click on the url and go to the bookmark page
            echo "<a href='bookmark.php?url=$url'>$url</a>";
            echo "</li>";
        }
        echo "</ul>";
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
    }
    ?>
    </ul>
