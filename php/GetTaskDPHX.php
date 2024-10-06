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

    // Define the query to retrieve the task details
    $query = "
        SELECT TaskID, PLNFilename
        FROM Tasks
        WHERE EntrySeqID = :entrySeqID
    ";

    // Prepare and execute the query
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':entrySeqID', $entrySeqID, PDO::PARAM_INT);
    $stmt->execute();

    // Fetch the task details
    $task = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($task) {
        $taskID = $task['TaskID'];
        $dphxFilename = $task['PLNFilename'] ?? $taskID . '.dphx';

        // Define the path to the DPHX file
        $filePath = "https://siglr.com/DiscordPostHelper/TaskBrowser/Tasks/$dphxFilename";

        // Check if the file exists
        if (!file_exists($filePath)) {
            throw new Exception('DPHX file not found');
        }

        // Set headers to force download
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
        header('Content-Length: ' . filesize($filePath));

        // Read the file
        readfile($filePath);
        exit;
    } else {
        throw new Exception('Task not found');
    }
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
