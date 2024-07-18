<?php
require __DIR__ . '/CommonFunctions.php';

try {

    // Open the database connection
    $pdo = new PDO("sqlite:$newsDBPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Call the cleanup function
    cleanUpNewsEntries($pdo);

    // Get the optional newsType parameter (default to 0 if not set or invalid)
    $newsType = isset($_GET['newsType']) ? filter_var($_GET['newsType'], FILTER_VALIDATE_INT) : 0;

    // Ensure newsType is a valid integer
    if ($newsType === false) {
        $newsType = 0;
    }

    // Prepare and execute the query to fetch all news entries
    $stmt = $pdo->prepare("SELECT * FROM News WHERE NewsType = :newsType ORDER BY NewsType DESC, EventDate ASC, Published DESC");
    $stmt->execute([':newsType' => $newsType]);
    $newsEntries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return the news entries as JSON
    echo json_encode(['status' => 'success', 'data' => $newsEntries]);

} catch (Exception $e) {
    logMessage("Error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    logMessage("--- End of script RetrieveNewsWSG ---");
}
?>
