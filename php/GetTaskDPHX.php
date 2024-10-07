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
        SELECT TaskID, Title
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
        $taskTitle = $task['Title'];
        $dphxFilename = $taskID . '.dphx';

        // Define the URL to the DPHX file
        $fileUrl = "https://siglr.com/DiscordPostHelper/TaskBrowser/Tasks/$dphxFilename";

        // Open the file URL
        $fileStream = @fopen($fileUrl, 'rb');
        if (!$fileStream) {
            throw new Exception('DPHX file not found');
        }

        // Sanitize the task title to create a safe filename
        $safeTitle = preg_replace('/[^a-zA-Z0-9\s\(\)_-]/', '', $taskTitle);
        $downloadFilename = trim($safeTitle) . '.dphx';

        // Set headers to force download with the correct filename
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $downloadFilename . '"');
        header('Content-Length: ' . get_headers($fileUrl, true)['Content-Length']);

        // Output the file to the browser
        fpassthru($fileStream);
        fclose($fileStream);

        // Increment download count
        $now = new DateTime("now", new DateTimeZone("UTC"));
        $nowFormatted = $now->format('Y-m-d H:i:s');

        // Update the task record to increment download count and set the last download time
        $updateQuery = "
            UPDATE Tasks 
            SET 
                TotDownloads = TotDownloads + 1, 
                LastDownloadUpdate = :lastDownloadUpdate 
            WHERE 
                EntrySeqID = :entrySeqID
        ";

        $stmt = $pdo->prepare($updateQuery);
        $stmt->bindParam(':lastDownloadUpdate', $nowFormatted, PDO::PARAM_STR);
        $stmt->bindParam(':entrySeqID', $entrySeqID, PDO::PARAM_INT);
        $stmt->execute();

        exit;
    } else {
        throw new Exception('Task not found');
    }
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
