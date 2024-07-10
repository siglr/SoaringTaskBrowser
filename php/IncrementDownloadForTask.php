<?php
require __DIR__ . '/CommonFunctions.php';

try {
    // Open the database connection
    $pdo = new PDO("sqlite:$databasePath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Retrieve the EntrySeqID parameter from the query string
    if (isset($_GET['EntrySeqID']) && !empty($_GET['EntrySeqID'])) {
        $entrySeqID = $_GET['EntrySeqID'];
        // Get the current UTC time
        $now = new DateTime("now", new DateTimeZone("UTC"));
        $nowFormatted = $now->format('Y-m-d H:i:s');
        
        // Define the query to update the record
        $updateQuery = "
            UPDATE Tasks 
            SET 
                TotDownloads = TotDownloads + 1, 
                LastDownloadUpdate = :lastDownloadUpdate 
            WHERE 
                EntrySeqID = :entrySeqID
        ";

        // Prepare and execute the update query
        $stmt = $pdo->prepare($updateQuery);
        $stmt->bindParam(':lastDownloadUpdate', $nowFormatted, PDO::PARAM_STR);
        $stmt->bindParam(':entrySeqID', $entrySeqID, PDO::PARAM_INT);
        $stmt->execute();

        // Define the query to retrieve the updated record
        $selectQuery = "
            SELECT TotDownloads, LastDownloadUpdate 
            FROM Tasks 
            WHERE EntrySeqID = :entrySeqID
        ";

        // Prepare and execute the select query
        $stmt = $pdo->prepare($selectQuery);
        $stmt->bindParam(':entrySeqID', $entrySeqID, PDO::PARAM_INT);
        $stmt->execute();
        $task = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($task) {
            echo json_encode(['status' => 'success', 'TotDownloads' => $task['TotDownloads'], 'LastDownloadUpdate' => $task['LastDownloadUpdate']]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No task found with the provided EntrySeqID']);
        }
    } else {
        // Handle missing or empty EntrySeqID parameter
        logMessage("--- Script running IncrementDownloadForTask ---");
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing or empty EntrySeqID parameter'
        ]);
        logMessage("--- End of script IncrementDownloadForTask ---");
    }

} catch (PDOException $e) {
    logMessage("--- Script running IncrementDownloadForTask ---");
    echo json_encode([
        'status' => 'error',
        'message' => 'Connection failed: ' . $e->getMessage()
    ]);
    logMessage("--- End of script IncrementDownloadForTask ---");
}
?>
