<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

define('YOUTUBE_API_KEY', 'AIzaSyCQD9fCWerrxjy-GQr3-w0k1d2UftSXDfo');

function fetchYouTubeMetadata($videoId) {
    $apiUrl = "https://www.googleapis.com/youtube/v3/videos?id={$videoId}&key=" . YOUTUBE_API_KEY . "&part=snippet";
    $response = file_get_contents($apiUrl);
    if ($response === false) {
        error_log('Failed to fetch YouTube metadata: HTTP request failed');
        return ['error' => 'Failed to fetch YouTube metadata', 'details' => 'HTTP request failed'];
    }
    $data = json_decode($response, true);
    if (isset($data['error'])) {
        error_log('API Error: ' . $data['error']['message']);
        return ['error' => 'API Error', 'details' => $data['error']['message']];
    }
    if (isset($data['items'][0]['snippet'])) {
        $snippet = $data['items'][0]['snippet'];
        $shortDescription = strlen($snippet['description']) > 150 ? substr($snippet['description'], 0, 150) . '...' : $snippet['description'];
        $result = [
            'ogTitle' => $snippet['title'],
            'ogDescription' => $shortDescription,
            'ogImage' => $snippet['thumbnails']['high']['url'],
            'embedHtml' => '<iframe width="560" height="315" src="https://www.youtube.com/embed/' . $videoId . '" frameborder="0" allowfullscreen></iframe>'
        ];
        return $result;
    } else {
        error_log('No snippet found in the API response');
        return ['error' => 'No snippet found in the API response'];
    }
}

if (isset($_GET['url'])) {
    $url = $_GET['url'];
    if (strpos($url, 'youtu.be') !== false) {
        $videoId = substr(parse_url($url, PHP_URL_PATH), 1);
    } elseif (strpos($url, 'youtube.com') !== false) {
        parse_str(parse_url($url, PHP_URL_QUERY), $queryParams);
        $videoId = $queryParams['v'] ?? null;
    } else {
        $videoId = null;
    }

    if ($videoId) {
        $metadata = fetchYouTubeMetadata($videoId);
        echo json_encode($metadata);
    } else {
        echo json_encode(['error' => 'Invalid YouTube URL']);
    }
} else {
    echo json_encode(['error' => 'No URL provided']);
}
