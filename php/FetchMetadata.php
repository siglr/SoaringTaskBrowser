<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Replace 'YOUR_NEW_API_KEY' with your actual YouTube Data API key
define('YOUTUBE_API_KEY', 'AIzaSyCQD9fCWerrxjy-GQr3-w0k1d2UftSXDfo');

function fetchYouTubeMetadata($videoId) {
    $apiUrl = "https://www.googleapis.com/youtube/v3/videos?id={$videoId}&key=" . YOUTUBE_API_KEY . "&part=snippet";
    $response = file_get_contents($apiUrl);
    if ($response === false) {
        return ['error' => 'Failed to fetch YouTube metadata', 'details' => 'HTTP request failed'];
    }
    $data = json_decode($response, true);
    if (isset($data['error'])) {
        return ['error' => 'API Error', 'details' => $data['error']['message']];
    }
    if (isset($data['items'][0]['snippet'])) {
        $snippet = $data['items'][0]['snippet'];
        $shortDescription = strlen($snippet['description']) > 150 ? substr($snippet['description'], 0, 150) . '...' : $snippet['description'];
        return [
            'ogTitle' => $snippet['title'],
            'ogDescription' => $shortDescription,
            'ogImage' => $snippet['thumbnails']['high']['url'],
            'embedHtml' => '<iframe width="560" height="315" src="https://www.youtube.com/embed/' . $videoId . '" frameborder="0" allowfullscreen></iframe>'
        ];
    }
    return ['error' => 'No metadata found for this YouTube video'];
}

if (isset($_GET['url'])) {
    $url = $_GET['url'];

    if (strpos($url, 'youtube.com') !== false || strpos($url, 'youtu.be') !== false) {
        // Extract the video ID from the URL
        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i', $url, $matches)) {
            $videoId = $matches[1];
            $metadata = fetchYouTubeMetadata($videoId);
            echo json_encode($metadata);
            exit;
        } else {
            echo json_encode(['error' => 'Invalid YouTube URL']);
            exit;
        }
    }

    // Fallback to general metadata fetching for other URLs
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        $error_msg = curl_error($ch);
        curl_close($ch);
        echo json_encode(['error' => 'Failed to fetch metadata', 'details' => $error_msg]);
        exit;
    }

    curl_close($ch);
    $doc = new DOMDocument();
    @$doc->loadHTML($response);
    $metadata = [
        'ogTitle' => '',
        'ogDescription' => '',
        'ogImage' => ''
    ];

    $metaTags = $doc->getElementsByTagName('meta');
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
    exit;
}

echo json_encode(['error' => 'No URL provided']);
?>
