<?php

require '../vendor/autoload.php';

const DEBUG = true;

// prepare template engine
$plates = new League\Plates\Engine(__DIR__ . '/../templates');
// parse server request uri
$url = parse_url($_SERVER['REQUEST_URI']);
$path = $url['path'];

// create template for defined routes
$response = match ($path) {
    '/' => [200, ["Content-Type" => "text/html"], $plates->make('index')],
    '/first' => [200, [], $plates->make('pages/first')],
    '/second' => [200, [], $plates->make('pages/second')],
    '/third' => [200, [], $plates->make('pages/third')],
    default => [404, [], "Not Found!"]
};

// prepare reponse
[$code, $headers, $body] = $response;

// set response code
http_response_code($code);

// set response headers
foreach ($headers as $key => $value) {
    header("$key: $value");
}

// remove response headers
header_remove("X-Powered-By");

// set default layout
if ($body instanceof \League\Plates\Template\Template) {
    $body->data(['title' => 'Vanillapod Hyper Sandbox']);
    $body->layout('layout', $body->data());
}

if (DEBUG) {
    var_dump($_SERVER, $url);
}
// render template
echo $body;
