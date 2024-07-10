<?php
require __DIR__ . '/CommonFunctions.php';

try {
    // Open the database connection
    $pdo = new PDO("sqlite:$databasePath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if the ThreadAccess column exists
    $checkColumnQuery = "
        PRAGMA table_info(Tasks);
    ";
    $columns = $pdo->query($checkColumnQuery)->fetchAll(PDO::FETCH_ASSOC);
    $columnExists = false;

    foreach ($columns as $column) {
        if ($column['name'] == 'ThreadAccess') {
            $columnExists = true;
            break;
        }
    }

    // If the column does not exist, create it
    if (!$columnExists) {
        $addColumnQuery = "
            ALTER TABLE Tasks ADD COLUMN ThreadAccess INTEGER DEFAULT 0;
        ";
        $pdo->exec($addColumnQuery);
    }

    // Retrieve the EntrySeqID parameter from the query string
    if (isset($_GET['EntrySeqID']) && !empty($_GET['EntrySeqID'])) {
        $entrySeqID = $_GET['EntrySeqID'];

        // Define the query to update the ThreadAccess field
        $updateQuery = "
            UPDATE Tasks 
            SET 
                ThreadAccess = ThreadAccess + 1 
            WHERE 
                EntrySeqID = :entrySeqID
        ";

        // Prepare and execute the update query
        $stmt = $pdo->prepare($updateQuery);
        $stmt->bindParam(':entrySeqID', $entrySeqID, PDO::PARAM_INT);
        $stmt->execute();

        // Check if the update was successful
        if ($stmt->rowCount() > 0) {
            echo json_encode(['status' => 'success', 'message' => 'ThreadAccess incremented successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No task found with the provided EntrySeqID']);
        }
    } else {
        // Handle missing or empty EntrySeqID parameter
        logMessage("--- Script running IncrementThreadAccessForTask ---");
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing or empty EntrySeqID parameter'
        ]);
        logMessage("--- End of script IncrementThreadAccessForTask ---");
    }

} catch (PDOException $e) {
    logMessage("--- Script running IncrementThreadAccessForTask ---");
    echo json_encode([
        'status' => 'error',
        'message' => 'Connection failed: ' . $e->getMessage()
    ]);
    logMessage("--- End of script IncrementThreadAccessForTask ---");
}
?>
