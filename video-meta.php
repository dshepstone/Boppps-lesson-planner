<?php
/**
 * video-meta.php
 * Unified metadata fetcher for YouTube, Vimeo, Panopto.
 * - YouTube: Google Data API v3 (requires API key in /secure-config/config.php)
 *            Requests part=snippet,status and returns 'embeddable' flag.
 * - Vimeo:   oEmbed server-side (no key)
 * - Panopto: hostname + sensible defaults (no key)
 *
 * Place this file at: /public_html/api/video-meta.php
 * Place config at:    /secure-config/config.php   (one level above public_html)
 *
 * Query params:
 *   platform: youtube | vimeo | panopto
 *   url:      full video URL
 *   id:       (optional) video id for youtube, if you prefer to pass it directly
 *
 * Response JSON (keys may be empty if not available):
 *   {
 *     platform, title, author, channelUrl, date (YYYY-MM-DD),
 *     videoUrl, [videoId], [embeddable]  // embeddable only for YouTube
 *   }
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  echo json_encode(['ok' => true]);
  exit;
}

// ---------- Load secure config (outside web root) ----------
$secureConfig = __DIR__ . '/../../secure-config/config.php';
if (!file_exists($secureConfig)) {
  http_response_code(500);
  echo json_encode(['error' => 'Secure config file missing', 'hint' => 'Create /secure-config/config.php above public_html']);
  exit;
}
require $secureConfig; // must define('YOUTUBE_API_KEY', '...');

// ---------- Utilities ----------
function respond($arr, $code = 200) {
  http_response_code($code);
  echo json_encode($arr);
  exit;
}

function fetch_url($url) {
  // Try file_get_contents with sane timeouts
  $ctx = stream_context_create([
    'http' => ['timeout' => 12, 'ignore_errors' => true],
    'ssl'  => ['verify_peer' => true, 'verify_peer_name' => true]
  ]);
  $data = @file_get_contents($url, false, $ctx);
  if ($data !== false) return $data;

  // Fallback: cURL
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT        => 12,
      CURLOPT_SSL_VERIFYPEER => true,
      CURLOPT_SSL_VERIFYHOST => 2,
      CURLOPT_USERAGENT      => 'video-meta-proxy/1.0'
    ]);
    $out  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($out !== false && $code >= 200 && $code < 300) return $out;
  }
  return false;
}

function yt_extract_id_from_url($url) {
  $parts = parse_url($url);
  if (!$parts) return '';
  $host = strtolower($parts['host'] ?? '');
  // youtu.be/<id>
  if (strpos($host, 'youtu.be') !== false) {
    $path = trim($parts['path'] ?? '', '/');
    return $path ?: '';
  }
  // youtube.com/watch?v=<id>
  if (!empty($parts['query'])) {
    parse_str($parts['query'], $qs);
    if (!empty($qs['v'])) return $qs['v'];
  }
  // youtube.com/shorts/<id>
  if (!empty($parts['path']) && preg_match('~/shorts/([^/?#]+)~i', $parts['path'], $m)) {
    return $m[1];
  }
  // youtube.com/embed/<id>
  if (!empty($parts['path']) && preg_match('~/embed/([^/?#]+)~i', $parts['path'], $m)) {
    return $m[1];
  }
  return '';
}

// ---------- Inputs ----------
$platform = isset($_GET['platform']) ? strtolower(trim($_GET['platform'])) : '';
$url      = isset($_GET['url']) ? trim($_GET['url']) : '';
$id       = isset($_GET['id']) ? trim($_GET['id']) : '';

if (!$platform || (!$url && !$id)) {
  respond(['error' => 'Missing params', 'hint' => 'Provide platform and url OR id'], 400);
}

// ---------- Router ----------
try {
  if ($platform === 'youtube') {
    if (!defined('YOUTUBE_API_KEY') || !YOUTUBE_API_KEY) {
      respond(['error' => 'Missing YouTube API key', 'hint' => 'Define YOUTUBE_API_KEY in /secure-config/config.php'], 500);
    }

    $videoId = $id ?: yt_extract_id_from_url($url);
    if (!$videoId) respond(['error' => 'No YouTube video id'], 400);

    // Request snippet + status for title/date/channel + embeddable
    $api = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id='
           . urlencode($videoId) . '&key=' . urlencode(YOUTUBE_API_KEY);

    $raw = fetch_url($api);
    if ($raw === false) respond(['error' => 'YouTube API request failed'], 502);

    $j = json_decode($raw, true);
    if (!is_array($j) || empty($j['items'][0])) {
      respond(['error' => 'Video not found'], 404);
    }

    $sn = $j['items'][0]['snippet'] ?? [];
    $st = $j['items'][0]['status']  ?? [];
    $channelId  = $sn['channelId']     ?? '';
    $channelUrl = $channelId ? 'https://www.youtube.com/channel/' . $channelId : '';
    $date       = isset($sn['publishedAt']) ? substr($sn['publishedAt'], 0, 10) : '';
    $embeddable = isset($st['embeddable']) ? (bool)$st['embeddable'] : null;

    respond([
      'platform'   => 'YouTube',
      'title'      => $sn['title']        ?? '',
      'author'     => $sn['channelTitle'] ?? '',
      'channelUrl' => $channelUrl,
      'date'       => $date,
      'videoUrl'   => $url ?: ('https://www.youtube.com/watch?v=' . $videoId),
      'videoId'    => $videoId,
      'embeddable' => $embeddable
    ]);
  }

  if ($platform === 'vimeo') {
    if (!$url) respond(['error' => 'Missing Vimeo URL'], 400);

    // Vimeo oEmbed (no key; server-side so no CORS)
    $oe  = 'https://vimeo.com/api/oembed.json?url=' . urlencode($url);
    $raw = fetch_url($oe);
    if ($raw === false) respond(['error' => 'Vimeo oEmbed request failed'], 502);

    $data = json_decode($raw, true);
    if (!is_array($data)) respond(['error' => 'Invalid Vimeo oEmbed response'], 502);

    $date = '';
    if (!empty($data['upload_date'])) {
      // Often: "YYYY-MM-DD HH:MM:SS" → trim
      $date = substr($data['upload_date'], 0, 10);
    }

    respond([
      'platform'   => 'Vimeo',
      'title'      => $data['title']        ?? '',
      'author'     => $data['author_name']  ?? '',
      'channelUrl' => $data['author_url']   ?? '',
      'date'       => $date,
      'videoUrl'   => $url
    ]);
  }

  if ($platform === 'panopto') {
    if (!$url) respond(['error' => 'Missing Panopto URL'], 400);
    // Panopto typically needs org auth; supply sensible defaults
    $host = parse_url($url, PHP_URL_HOST);
    respond([
      'platform'   => $host ?: 'Panopto',
      'title'      => 'Panopto Session',
      'author'     => '',
      'channelUrl' => '',
      'date'       => '',
      'videoUrl'   => $url
    ]);
  }

  respond(['error' => 'Unsupported platform'], 400);

} catch (Throwable $e) {
  respond(['error' => 'Server error', 'details' => $e->getMessage()], 500);
}
