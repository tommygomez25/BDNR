<?php

require __DIR__ . '/vendor/autoload.php';

try {
	// Connect to the local Mongo server.
	$mongo = new MongoDB\Client();

	// Select the collection.
	$collection = $mongo->selectDatabase('mini-forum')->topics;

	// Create a cursor to iterate over the complete collection.
	$cursor = $collection->find();

	$topicID = isset($_GET['topic']) ? $_GET['topic'] : null;

	if($topicID) {
		echo "<a href='index.php'>Back to Topics</a>";
		$topic = $collection->findOne(['_id' => new MongoDB\BSON\ObjectId($topicID)]);
		echo "<h1>" . htmlspecialchars($topic['title']) . "</h1>";
		echo "<p>" . htmlspecialchars($topic['body']) . "</p>";
		echo "<p>Author: " . htmlspecialchars($topic['author']) . "</p>";
	
		// Display comments
		echo "<h2>Comments</h2>";
		if (!empty($topic['comments'])) {
			foreach ($topic['comments'] as $comment) {
				echo "<div>";
				echo "<p>" . htmlspecialchars($comment['text']) . "</p>";
				echo "<p>Comment by: " . htmlspecialchars($comment['author']) . "</p>";
				echo "</div>";
			}
		}

		echo "<h2>Add a Comment!</h2>";

		// Display the comment form
		echo "<form action='new_comment.php' method='post'>";
		echo "<input type='hidden' name='topic' value='" . $topicID . "'>";
		echo "<textarea name='comment'></textarea>";
		echo "<input type='text' name='author'>";
		echo "<input type='submit' value='Add Comment'>";
		echo "</form>";

	} else {
		// List all topics
		$topics = $collection->find([]);
		echo "<h1>Mini Forum</h1>";
		echo "<h2>Topics</h2>";
		// Display the list of topics
		echo "<ul>";
		foreach ($topics as $topic) {
			echo "<li>";
			// a link to the topic
			echo "<a href='?topic=" . $topic['_id'] . "'>" . htmlspecialchars($topic['title']) . "</a><br>";

			echo "</li>";
		}
		echo "</ul>";

		// Button to create a new topic
		echo "<a href='new_topic.html'>New Topic</a>";
	}

} catch (Exception $e) {
    print $e->getMessage();
};
?>
