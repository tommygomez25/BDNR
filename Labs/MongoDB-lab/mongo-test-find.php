<?php

require __DIR__ . '/vendor/autoload.php';

try {
        // Connect to the local Mongo server.
        $mongo = new MongoDB\Client();

        // Select the collection.
        $collection = $mongo->selectDatabase('bdnr-php')->docs;

        // Create a cursor to iterate over the complete collection.
        $cursor = $collection->find();

        // Go through each record.
        foreach ($cursor as $result) {
                   print $result->country ." :: ". $result->capital ."\n";
        }

        // Count the number of results.
        $doc = $collection->Count();
        print "Number of records in collection: $doc\n";


} catch (Exception $e) {
        print $e->getMessage();
};


?>
