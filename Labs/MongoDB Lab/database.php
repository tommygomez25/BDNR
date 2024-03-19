<?php

require __DIR__ . '/vendor/autoload.php';

try {

    $mongo = new MongoDB\Client();

    $db = $mongo->selectDatabase('mini-forum');

    // create a new collection
    $collection = $db->createCollection('topics');

    // create a new document
    $topic = [
        'title' => 'Example Title',
        'body' => 'This is an example post body.',
        'author' => 'AuthorName',
        'comments' => []
    ];

    // insert the new document
    $insertOneResult = $collection->insertOne($topic);

    echo "Inserted with Object ID '{$insertOneResult->getInsertedId()}'";

} catch (Exception $e) {
    print $e->getMessage();
};

?>
