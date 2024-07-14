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
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // If the target site uses HTTPS correct
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
        throw new Exception("HTTP request failed with status code $httpCode");
    }

    return $output;
}

try {
    $html = fetchUrl($url);
    if (!$html) {
        throw new Exception('Failed to fetch content from the URL');
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
        if ($tag->getAttribute('property') == 'og:title' || $tag->getAttribute('name') == 'title') {
            $metadata['ogTitle'] = $tag->getAttribute('content');
        }
        if ($tag->getAttribute('property') == 'og:description' || $tag->getAttribute('name') == 'description') {
            $metadata['ogDescription'] = $tag->getAttribute('content');
        }
        if ($tag->getAttribute('property') == 'og:image' || $tag->getAttribute('name') == 'image') {
            $metadata['ogImage'] = $tag->getAttribute('content');
        }
    }

    if (empty($metadata['ogTitle'])) {
        $titles = $doc->getElementsByTagName('title');
        if ($titles->length > 0) {
            $metadata['ogTitle'] = $titles->item(0)->textContent;
        }
    }

    if (empty($metadata['ogDescription'])) {
        $metaDescriptions = $doc->getElementsByTagName('meta');
        foreach ($metaDescriptions as $metaDescription) {
            if ($metaDescription->getAttribute('name') == 'description') {
                $metadata['ogDescription'] = $metaDescription->getAttribute('content');
                break;
            }
        }
    }

    if (empty($metadata['ogTitle']) && empty($metadata['ogDescription']) && empty($metadata['ogImage'])) {
        throw new Exception('No metadata found');
    }

    echo json_encode($metadata);

} catch (Exception $e) {
    error_log('Failed to fetch link metadata: ' . $e->getMessage());
    echo json_encode(['ogTitle' => '', 'ogDescription' => '', 'ogImage' => '']);
}
?>
