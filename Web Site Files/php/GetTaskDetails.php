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
        SELECT
            TaskID,
            EntrySeqID, 
            Title,
            ShortDescription,
            MainAreaPOI,
            DepartureName,
            DepartureICAO,
            DepartureExtra,
            ArrivalName,
            ArrivalICAO,
            ArrivalExtra,
            SimDateTime,
            SimDateTimeExtraInfo,
            IncludeYear,
            SoaringRidge,
            SoaringThermals,
            SoaringWaves,
            SoaringDynamic,
            SoaringExtraInfo,
            DurationMin,
            DurationMax,
            DurationExtraInfo,
            TaskDistance,
            TotalDistance,
            RecommendedGliders,
            DifficultyRating,
            DifficultyExtraInfo,
            LongDescription,
            WeatherSummary,
            Credits,
            Countries,
            PLNFilename,
            PLNXML,
            WPRFilename,
            WPRXML
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
        // Output the task details as JSON
        header('Content-Type: application/json');
        echo json_encode($task);
    } else {
        throw new Exception('Task not found');
    }
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
?>
