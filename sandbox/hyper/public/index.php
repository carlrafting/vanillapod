<?php

require '../vendor/autoload.php';

$plates = new League\Plates\Engine(__DIR__ . '/../templates');
$url = parse_url($_SERVER['REQUEST_URI']);

// create template for defined routes
$template = match ($url['path']) {
    '/' => $plates->make('index'),
    '/first' => $plates->make('pages/first'),
    '/second' => $plates->make('pages/second'),
    '/third' => $plates->make('pages/third'),
    default => 'NOPE!'
};

// set default template
$template->layout('layout', $template->data());

// render template
echo $template;
