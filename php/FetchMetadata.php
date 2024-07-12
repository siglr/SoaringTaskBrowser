<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

function fetchLinkMetadata($url) {
    $context = stream_context_create(['http' => ['header' => 'User-Agent: Mozilla/5.0']]);
    $html = file_get_contents($url, false, $context);
    if ($html === false) {
        error_log('Failed to fetch link metadata: HTTP request failed');
        return ['error' => 'Failed to fetch link metadata', 'details' => 'HTTP request failed'];
    }
    $doc = new DOMDocument();
    @$doc->loadHTML($html);

    $metadata = [
        'ogTitle' => '',
        'ogDescription' => '',
        'ogImage' => ''
    ];

    foreach ($doc->getElementsByTagName('meta') as $meta) {
        if ($meta->getAttribute('property') == 'og:title') {
            $metadata['ogTitle'] = $meta->getAttribute('content');
        }
        if ($meta->getAttribute('property') == 'og:description') {
            $metadata['ogDescription'] = $meta->getAttribute('content');
        }
        if ($meta->getAttribute('property') == 'og:image') {
            $metadata['ogImage'] = $meta->getAttribute('content');
        }
    }

    return $metadata;
}

if (isset($_GET['url'])) {
    $url = $_GET['url'];
    $metadata = fetchLinkMetadata($url);
    echo json_encode($metadata);
} else {
    echo json_encode(['error' => 'No URL provided']);
}
