<?php
header('Content-Type: application/json');

$url = $_GET['url'] ?? '';

if (!$url) {
    echo json_encode(['error' => 'No URL provided']);
    exit;
}

// Skip Discord links
if (strpos($url, 'discord://') !== false || strpos($url, 'discord.com') !== false) {
    echo json_encode(['ogTitle' => '', 'ogDescription' => '', 'ogImage' => '']);
    exit;
}

// Fetch metadata for other links
try {
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => 'User-Agent: PHP'
        ]
    ]);
    $html = file_get_contents($url, false, $context);

    if ($html === false) {
        throw new Exception("HTTP request failed");
    }

    $doc = new DOMDocument();
    @$doc->loadHTML($html);
    $tags = $doc->getElementsByTagName('meta');

    $metadata = [
        'ogTitle' => '',
        'ogDescription' => '',
        'ogImage' => ''
    ];

    foreach ($tags as $tag) {
        if ($tag->getAttribute('property') == 'og:title') {
            $metadata['ogTitle'] = $tag->getAttribute('content');
        }
        if ($tag->getAttribute('property') == 'og:description') {
            $metadata['ogDescription'] = $tag->getAttribute('content');
        }
        if ($tag->getAttribute('property') == 'og:image') {
            $metadata['ogImage'] = $tag->getAttribute('content');
        }
    }

    echo json_encode($metadata);

} catch (Exception $e) {
    error_log('Failed to fetch link metadata: ' . $e->getMessage());
    echo json_encode(['ogTitle' => '', 'ogDescription' => '', 'ogImage' => '']);
}
?>
