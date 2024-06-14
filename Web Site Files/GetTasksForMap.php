<?php
require __DIR__ . '/CommonFunctions.php';

try {
    // Open the database connection
    $pdo = new PDO("sqlite:$databasePath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Define the query to retrieve the records
    $query = "
        SELECT 
            w.EntrySeqID, 
            w.TaskID, 
            t.Title,
            w.PLNXML
        FROM 
            WorldMapInfo w
        INNER JOIN 
            Tasks t ON w.TaskID = t.TaskID
    ";

    // Prepare and execute the query
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $worldMapInfo = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Output the results as JSON
    header('Content-Type: application/json');
    echo json_encode($worldMapInfo);

} catch (PDOException $e) {
    logMessage("Connection failed: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Connection failed']);
}
?>
