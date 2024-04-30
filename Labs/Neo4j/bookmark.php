<?php


require __DIR__ . '/vendor/autoload.php';

use Laudis\Neo4j\Authentication\Authenticate;
use Laudis\Neo4j\ClientBuilder;

$auth = Authenticate::basic('neo4j', 'ola12345678');
$client = ClientBuilder::create()
               ->withDriver('http', 'http://localhost:7474', $auth)
               ->withDefaultDriver('http')
               ->build();

// get the information of a bookmark with a specific URL that has been passed as a parameter
$url = $_GET['url'];

function queryBookmarkInfo($url, $client) {
    $query = 'MATCH (b:Bookmark {url: $url})-[:HAS_TAG]->(t:Tag)
    WITH b, COLLECT(t.name) AS tags
    RETURN b AS bookmark, tags;';
    $results = $client->run($query, ['url' => $url]);
    return $results;
}

queryBookmarkInfo($url, $client);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Bookmark</title>
</head>
<body>
    <h1>Bookmark</h1>
    <a href="index.php">Back to Bookmarks</a>
    <br>
    <ul>
    <?php
    
    try {
        $results = queryBookmarkInfo($url, $client);
        foreach ($results as $record) {
            // Get properties of the bookmark node
            $bookmark = $record->get('bookmark'); // Make sure 'bookmark' matches what you RETURN in Cypher
            $tags = $record->get('tags'); // Collect tags

            $properties = $bookmark->getProperties(); // Get properties of the bookmark
            echo "<li>";
            echo "URL: " . $properties['url'] . "<br>"; // Assuming 'url' is a property of the bookmark
            echo "</li>";
            echo "<li>";
            echo "Tags: ";
            foreach ($tags as $tag) {
                echo $tag . ", ";
            }
            echo "</li>";
            // make the timestamp human readable
            $date = new DateTime($properties['when_added']);
            echo "Timestamp: " . $date->format('Y-m-d H:i:s') . "<br>"; // Assuming 'when_added' is a property
            echo "</li>";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
    }
    ?>
    </ul>

</body>
</html>
 