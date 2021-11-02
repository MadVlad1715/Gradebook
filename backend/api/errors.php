<?php

function error($msg, $responseCode) {
    http_response_code($responseCode);
    echo json_encode([
        'status' => false,
        'message' => $msg
    ]);

    global $mysql;
    if (isset($mysql)) $mysql->close();
    die();
}

function resource_not_found() {
    error('Resource not found', 404);
}

function bad_request() {
    error('Bad request', 400);
}

function unauthorized() {
    error('Unauthorized', 401);
}

function internal_error() {
	global $mysql;
    //error('Internal server error', 500);
	error($mysql->error, 500);
}

function forbidden() {
    error('Forbidden', 403);
}
