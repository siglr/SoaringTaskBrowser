<?php
require __DIR__ . '/CommonFunctions.php';

try {
    // Open the database connection
    $pdo = new PDO("sqlite:$databasePath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Define the query to retrieve the records
    $query = "SELECT EntrySeqID, 
                     Title,
                     LastUpdate, 
                     MainAreaPOI,
                     DepartureName || ' (' || DepartureICAO || ')' AS DepartureInfo,
                     ArrivalName || ' (' || ArrivalICAO || ')' AS ArrivalInfo,
                     TaskDistance || ' (' || TotalDistance || ')' AS DistanceInfo
                     FROM Tasks";

    // Prepare and execute the query
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Output the results as JSON
    header('Content-Type: application/json');
    echo json_encode($tasks);

} catch (PDOException $e) {
    logMessage("Connection failed: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Connection failed']);
}
?>
