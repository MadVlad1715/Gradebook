<?php

require('../vendor/autoload.php');

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Max-Age: 86400');
}

header('Content-type: application/json');

require_once 'errors.php';
require_once 'db.php';
require_once 'routing.php';
require_once 'handlers.php';

function response($data = []) {
    if (!isset($data['status'])) $data['status'] = true;
    echo json_encode($data);
}

$mysql = dbConnect();

$url = $_SERVER['REDIRECT_URL'];
$method = $_SERVER['REQUEST_METHOD'];

if (str_starts_with($url, '/')) $url = substr($url, 1);
if (str_starts_with($url, 'api/')) $url = substr($url, 4);
if ($url !== '' && $url[strlen($url) - 1] == '/') $url = substr($url, 0, -1);
if ($url === '') resource_not_found();

$explode_url = explode('/', $url);

$found = false;
foreach ($routing as $route) {
    if ($route['method'] === $method && preg_match($route['pattern'], $url)) {
        if (isset($route['auth'])) auth($route['auth']);
        response($route['handler']());
        $found = true;
        break;
    }
}

if (!$found) resource_not_found();

$mysql->close();
