<?php

require __DIR__ . '/vendor/autoload.php';

Predis\Autoloader::register();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    

    $url = filter_input(INPUT_POST, 'url', FILTER_VALIDATE_URL);
    $tags = $_POST['tags'] ?? '';

    if (!$url || empty($tags)) {

        header("Location: add.html?error=invalid_data");
        exit;
    }

    try {
        $redis = new Predis\Client();

        $bookmarkId = $redis->incr('next_bookmark_id'); // to generate a incremental unique id for the bookmark
    
    
        $timestamp = time(); // to sort the sorted set by time
    
    
        $redis->hset("bookmark:$bookmarkId", 'url', $url);
    
    
        $tagSetKey = "bookmark:$bookmarkId:tags";
        $tagsArray = explode(' ', $tags);
    
        foreach ($tagsArray as $tag) {
            $redis->sadd($tagSetKey, $tag); 
    
    
            $redis->sadd("tag:$tag", $bookmarkId); 
        }
    
    
        $redis->zadd('bookmarks', $timestamp, $bookmarkId); // sorted set
    }
    catch (Exception $e) {
        print $e->getMessage();
        exit;
    }
    
    header("Location: index.php");
    exit;
    
} else {

    header("Location: add.html");
    exit;
}

?>