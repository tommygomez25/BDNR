<?php

require __DIR__ . '/vendor/autoload.php';

Predis\Autoloader::register();

try {
    
    $redis = new Predis\Client();

    
    if (isset($_GET['tags'])) {
        
        $tags = explode(',', $_GET['tags']); // Parse comma separated tags

       
        $bookmarks = [];

        $intersectKey = 'intersect:'.implode(':', $tags); // e.g. intersect:tag1:tag2:tag3 -> tags in the url

        $intersectResult = $redis->sinterstore($intersectKey, ...array_map(function ($tag) {
            return "tag:$tag"; // -> because we have a set of the form tag:tag1 with the bookmark ids (line 38 in bookit.php)
                                // -> we want to know if there exists any bookmark that has all the tags in the url

        }, $tags)); // sinterstore stores the intersection of the sets in a key and returns the number of elements in the resulting set
        
        

        if ($intersectResult > 0) {

            $bookmarkIds = $redis->zrevrange('bookmarks',0,-1); // zrevrange returns the first 15 elements of the sorted set in reverse order

            foreach ($bookmarkIds as $bookmarkId) {
                $bookmarkKey = "bookmark:$bookmarkId";
                $bookmarkTags = $redis->smembers("bookmark:$bookmarkId:tags");
                $bookmark = $redis->hgetall($bookmarkKey);
                
                if (count(array_intersect($tags, $bookmarkTags)) === count($tags)) {
                    $bookmarks[$bookmarkId] = $redis->hgetall($bookmarkKey);

                    $bookmarks[$bookmarkId] = $bookmark;
                }
            }
        }

        $redis->del($intersectKey);

    } else {
        
        $bookmarkIds = $redis->zrevrange('bookmarks', 0, 14);
        
        // Retrieve bookmark details for each ID
        foreach ($bookmarkIds as $bookmarkId) {
            $bookmarkKey = "bookmark:$bookmarkId";
            $bookmark = $redis->hgetall($bookmarkKey);

            // Add to the results array
            $bookmarks[$bookmarkId] = $bookmark;
        }
    }

} catch (Exception $e) {
    // Handle Redis connection or operation error
    print $e->getMessage();
    exit;
}

// Display bookmarks
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bookmarks</title>
    <link rel="stylesheet" href="index.css">
</head>

<body>
    <h2>Bookmarks</h2>

    <ul>
        <?php foreach ($bookmarks as $bookmarkId => $bookmark) : ?>
            <li>
                <strong>Bookmark ID:</strong> <?php echo $bookmarkId; ?><br>
                <strong>URL:</strong> <a href="<?php echo $bookmark['url']; ?>" target="_blank"><?php echo $bookmark['url']; ?></a><br>
                <strong>Tags:</strong> <?php echo implode(', ', $redis->smembers("bookmark:$bookmarkId:tags")); ?>
            </li>
        <?php endforeach; ?>
    </ul>

    <button><a href="index.php">Home</a></button>
    <button><a href="add.html">Add a new bookmark</a></button>

</body>
</html>