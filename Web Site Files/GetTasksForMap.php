<?php
require __DIR__ . '/CommonFunctions.php';

try {
    // Open the database connection
    $pdo = new PDO("sqlite:$databasePath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Retrieve query parameters
    $latMin = $_GET['latMin'];
    $latMax = $_GET['latMax'];
    $lngMin = $_GET['lngMin'];
    $lngMax = $_GET['lngMax'];

    // Define the query to retrieve the records within the bounding box
    $query = "
        SELECT 
            EntrySeqID, 
            TaskID, 
            Title,
            PLNXML
        FROM 
            Tasks
        WHERE
            LatMin <= :latMax AND
            LatMax >= :latMin AND
            LongMin <= :lngMax AND
            LongMax >= :lngMin
    ";

    // Prepare and execute the query
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':latMin', $latMin);
    $stmt->bindParam(':latMax', $latMax);
    $stmt->bindParam(':lngMin', $lngMin);
    $stmt->bindParam(':lngMax', $lngMax);
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
