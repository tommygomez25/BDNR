<?php

require __DIR__ . '/vendor/autoload.php';

use Laudis\Neo4j\Authentication\Authenticate;
use Laudis\Neo4j\ClientBuilder;

// Set up the Neo4j client
$auth = Authenticate::basic('neo4j', 'ola12345678');
$client = ClientBuilder::create()
    ->withDriver('http', 'http://localhost:7474', $auth)
    ->withDefaultDriver('http')
    ->build();



function queryLatestBookmarks($client) {
    $query = 'MATCH (b:Bookmark)-[:HAS_TAG]->(t:Tag) WITH b, COLLECT(t.name) AS tags RETURN b.url, tags ORDER BY b.when_added  LIMIT 10;';
    $results = $client->run($query);
    return $results;
}



?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>BookIt Bookmarks</title>
</head>
<body>
    <h1>Bookit!</h1>

    <form action="insert.php" method="post">
        <label for="url">URL:</label>
        <input type="text" name="url" id="url">
        <label for="tags">Tags:</label>
        <input type="text" name="tags" id="tags">
        <input type="submit" value="Insert Bookmark">
    </form>
    <br>
    <form action="tag.php" method="get">
        <label for="tags">Tags:</label>
        <input type="text" name="tags" id="tags">
        <input type="submit" value="Search by Tags">
    </form>
    <ul>
        <?php 

        try {
            $results = queryLatestBookmarks($client);
            echo "<ul>";
            foreach ($results as $row) {
                $url = $row->get('b.url'); 
                $tags = $row->get('tags'); 

                echo "<li>";
                // click on the url and go to the bookmark page
                echo "<a href='bookmark.php?url=$url'>$url</a>";
                echo "<ul>";
                foreach ($tags as $tag) {
                    echo "<li><a href='tag.php?tags=$tag'>$tag</a></li>";
                }
                echo "</ul>";
                echo "</li>";
            }
            echo "</ul>";
        } catch (Exception $e) {
            echo "An error occurred: " . $e->getMessage();
        }

        ?>
    </ul>

</body>
</html>
