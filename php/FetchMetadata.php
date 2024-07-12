<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if (isset($_GET['url'])) {
    $url = $_GET['url'];

    // Use cURL to fetch the contents of the URL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
    $response = curl_exec($ch);
    curl_close($ch);

    // Check if the response is valid
    if ($response === false) {
        echo json_encode(['error' => 'Failed to fetch URL']);
        exit;
    }

    // Parse the HTML to extract metadata
    libxml_use_internal_errors(true);
    $doc = new DOMDocument();
    $doc->loadHTML($response);
    libxml_clear_errors();

    $metaTags = $doc->getElementsByTagName('meta');
    $metadata = [];

    foreach ($metaTags as $meta) {
        if ($meta->getAttribute('property') === 'og:title') {
            $metadata['ogTitle'] = $meta->getAttribute('content');
        }
        if ($meta->getAttribute('property') === 'og:description') {
            $metadata['ogDescription'] = $meta->getAttribute('content');
        }
        if ($meta->getAttribute('property') === 'og:image') {
            $metadata['ogImage'] = $meta->getAttribute('content');
        }
    }

    echo json_encode($metadata);
} else {
    echo json_encode(['error' => 'No URL provided']);
}
?>
