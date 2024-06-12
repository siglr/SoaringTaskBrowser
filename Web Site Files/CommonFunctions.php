<?php
// Database and important files path
$databasePath = '/home2/siglr3/private/DPHXTaskBrowser/TasksDatabase.db';
$newsDBPath = '/home2/siglr3/private/DPHXTaskBrowser/News.db';
$logFile = '/home2/siglr3/private/DPHXTaskBrowser/error_log.txt';
$userPermissionsPath = '/home2/siglr3/private/DPHXTaskBrowser/UserRights.xml';

// Function to log messages
function logMessage($message) {
    $clientIp = $_SERVER['REMOTE_ADDR'];
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $clientIp $message\n", FILE_APPEND);
}

// Function to ensure datetime fields are properly formatted
function formatDatetime($datetime) {
    $dt = new DateTime($datetime);
    return $dt->format('Y-m-d H:i:s');
}

// Function to get user permissions
function getUserPermissions($userID) {
    global $userPermissionsPath;
    if (!file_exists($userPermissionsPath)) {
        logMessage("User permissions file not found: $userPermissionsPath");
        return null;
    }
    $xml = simplexml_load_file($userPermissionsPath);
    if ($xml === false) {
        logMessage("Failed to load user permissions file: $userPermissionsPath");
        return null;
    }
    foreach ($xml->User as $user) {
        if ((string)$user->ID === $userID) {
            return $user;
        }
    }
    return null;
}

// Function to retrieve user rights
function getUserRights($userPermissions) {
    if ($userPermissions === null) {
        return null;
    }
    $rights = [];
    foreach ($userPermissions->children() as $key => $value) {
        if ($key !== 'ID' && $key !== 'Name') {
            $rights[$key] = (string)$value;
        }
    }
    return $rights;
}

// Function to check user right
function checkUserRight($userPermissions, $right) {
    if ($userPermissions === null) {
        return false;
    }
    return (string)$userPermissions->$right === 'True';
}

// Function to check user permissions directly
function checkUserPermission($userID, $permission) {
    logMessage("Checking permission for UserID: $userID, Permission: $permission");

    // Get user permissions
    $userPermissions = getUserPermissions($userID);
    if ($userPermissions === null) {
        logMessage("No permissions found for userID: $userID");
        return false;
    }

    // Check the specified permission
    $hasRight = checkUserRight($userPermissions, $permission);
    logMessage("Permission check result for userID: $userID, Permission: $permission, HasRight: " . ($hasRight ? 'True' : 'False'));

    return $hasRight;
}
function cleanUpNewsEntries($pdo) {
    // Get the current UTC datetime
    $currentDatetime = $pdo->query("SELECT datetime('now')")->fetchColumn();
    //logMessage("Current UTC datetime: $currentDatetime");

    // Get the datetime for 7 days ago
    $datetimeMinus7Days = $pdo->query("SELECT datetime('now', '-7 days')")->fetchColumn();
    //logMessage("UTC datetime for 7 days ago: $datetimeMinus7Days");

    // Cleanup expired News and Event entries
    $pdo->exec("DELETE FROM News WHERE NewsType IN (1, 2) AND Expiration < datetime('now')");
    //logMessage("Expired News and Event entries deleted before: $currentDatetime");

    // Cleanup old Task entries
    $pdo->exec("DELETE FROM News WHERE NewsType = 0 AND Published < datetime('now', '-7 days')");
    //logMessage("Old Task entries deleted before: $datetimeMinus7Days");
}

// Function to create or update a task news entry
function createOrUpdateTaskNewsEntry($taskData, $isUpdate) {
    global $newsDBPath;

    try {
        // Open the news database connection
        $newsPdo = new PDO("sqlite:$newsDBPath");
        $newsPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        logMessage("News database connection established.");

        cleanUpNewsEntries($newsPdo);
        
        $action = $isUpdate ? 'UpdateTask' : 'CreateTask';
        $title = $isUpdate ? "Updated task #" . $taskData['EntrySeqID'] : "New task #" . $taskData['EntrySeqID'];

        $comments = !empty($taskData['MainAreaPOI']) ? $taskData['MainAreaPOI'] : $taskData['ShortDescription'];
        $credits = str_replace("All credits to ", "By ", preg_replace("/ for this task.*/", "", $taskData['Credits']));

        // Prepare the delete statement
        $deleteStmt = $newsPdo->prepare("DELETE FROM News WHERE NewsType = 0 AND Key = ?");
        $deleteStmt->execute(["T-{$taskData['TaskID']}"]);

        // Prepare the insert statement
        $stmt = $newsPdo->prepare("
            INSERT INTO News (Key, Published, Title, Subtitle, Comments, Credits, EventDate, News, NewsType, TaskID, EntrySeqID, URLToGo, Expiration)
            VALUES (:Key, :Published, :Title, :Subtitle, :Comments, :Credits, :EventDate, :News, 0, :TaskID, :EntrySeqID, :URLToGo, :Expiration)
        ");
        logMessage("Insert statement for news prepared.");

        // Execute the insert statement
        $stmt->execute([
            ':Key' => "T-{$taskData['TaskID']}",
            ':Published' => gmdate('Y-m-d H:i:s'), // Current UTC time
            ':Title' => $title,
            ':Subtitle' => $taskData['Title'],
            ':Comments' => $comments,
            ':Credits' => $credits,
            ':EventDate' => null,
            ':News' => null,
            ':TaskID' => $taskData['TaskID'],
            ':EntrySeqID' => $taskData['EntrySeqID'],
            ':URLToGo' => null,
            ':Expiration' => null
        ]);
        logMessage("News entry created or updated for TaskID: {$taskData['TaskID']}.");

    } catch (Exception $e) {
        logMessage("Error in createOrUpdateNewsEntry: " . $e->getMessage());
        throw new Exception('Failed to create or update news entry.');
    }
}
?>
