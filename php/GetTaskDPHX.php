<?php
require __DIR__ . '/CommonFunctions.php';

try {
    // Check if EntrySeqID is provided
    if (!isset($_GET['entrySeqID'])) {
        throw new Exception('Missing required parameter: entrySeqID');
    }

    $entrySeqID = (int)$_GET['entrySeqID'];

    // Open the database connection
    $pdo = new PDO("sqlite:$databasePath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Define the query to retrieve the TaskID using EntrySeqID
    $query = "SELECT TaskID FROM Tasks WHERE EntrySeqID = :entrySeqID";
    
    // Prepare and execute the query
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':entrySeqID', $entrySeqID, PDO::PARAM_INT);
    $stmt->execute();

    // Fetch the TaskID
    $task = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$task) {
        throw new Exception('Task not found');
    }

    // Get the TaskID from the query result
    $taskID = $task['TaskID'];

    // Construct the URL to the DPHX file
    $fileUrl = "https://siglr.com/DiscordPostHelper/TaskBrowser/Tasks/" . $taskID . ".dphx";

    // Use headers to redirect the user to the DPHX file
    header("Location: $fileUrl");
    exit;
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
?>
