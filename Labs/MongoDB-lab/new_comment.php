<?php

require __DIR__ . '/vendor/autoload.php';

try {
    
        $mongo = new MongoDB\Client();
    
        $db = $mongo->selectDatabase('mini-forum');
    
        $collection = $db->topics;
    
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $topicID = filter_input(INPUT_POST, 'topic');
            $author = filter_input(INPUT_POST, 'author');
            $comment = filter_input(INPUT_POST, 'comment');

            $collection->updateOne(
                ['_id' => new MongoDB\BSON\ObjectId($topicID)],
                ['$push' => ['comments' => ['author' => $author, 'text' => $comment]]]
            );

            header('Location: index.php?topic=' . $topicID);
            exit;
        }
    
    } catch (Exception $e) {
        print $e->getMessage();
}

?>