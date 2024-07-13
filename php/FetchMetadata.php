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

function fetchUrl($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // If the target site uses HTTPS
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.9',
        'Cache-Control: no-cache',
        'Connection: keep-alive',
        'Pragma: no-cache',
        'Upgrade-Insecure-Requests: 1'
    ]);

    $output = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        throw new Exception(curl_error($ch));
    }
    
    curl_close($ch);

    if ($httpCode >= 400) {
        throw new Exception("HTTP request to $url failed with status code $httpCode");
    }

    return $output;
}

try {
    $html = fetchUrl($url);
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
    error_log('Failed to fetch link ($url) metadata: ' . $e->getMessage());
    echo json_encode(['ogTitle' => '', 'ogDescription' => '', 'ogImage' => '']);
}
?>
