<?php

require __DIR__ . '/vendor/autoload.php';

try {

    $mongo = new MongoDB\Client();

    $db = $mongo->selectDatabase('mini-forum');

    $collection = $db->topics;

    if($_SERVER['REQUEST_METHOD'] === 'POST') {
        $author = filter_input(INPUT_POST, 'author');
        $title = filter_input(INPUT_POST, 'title');
        $body = filter_input(INPUT_POST, 'body');

        $collection->insertOne([
            'title' => $title,
            'body' => $body,
            'author' => $author,
            'comments' => []
        ]);

        header('Location: index.php');
        exit;
    }

} catch (Exception $e) {
    print $e->getMessage();
}

?>