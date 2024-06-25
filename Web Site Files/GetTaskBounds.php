<?php
require __DIR__ . '/CommonFunctions.php';

try {
    // Open the database connection
    $pdo = new PDO("sqlite:$databasePath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Retrieve the EntrySeqID from the query parameters
    $entrySeqID = isset($_GET['entrySeqID']) ? $_GET['entrySeqID'] : null;

    if ($entrySeqID) {
        // Define the query to retrieve the bounds for the specific task
        $query = "
            SELECT 
                LatMin,
                LatMax,
                LongMin,
                LongMax
            FROM 
                Tasks
            WHERE
                EntrySeqID = :entrySeqID
        ";

        // Prepare and execute the query
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':entrySeqID', $entrySeqID, PDO::PARAM_INT);
        $stmt->execute();
        $bounds = $stmt->fetch(PDO::FETCH_ASSOC);

        // Output the bounds as JSON
        header('Content-Type: application/json');
        echo json_encode($bounds);
    } else {
        throw new Exception('EntrySeqID is required');
    }

} catch (PDOException $e) {
    logMessage("Connection failed: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Connection failed']);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
?>
