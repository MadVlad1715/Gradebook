<?php

require_once 'errors.php';

function dbConnect() {
	$url = parse_url(getenv("CLEARDB_DATABASE_URL"));

	$server = $url["host"];
	$username = $url["user"];
	$password = $url["pass"];
	$db = substr($url["path"], 1);
	
    $mysql = new mysqli($server, $username, $password, $db);
    if ($mysql->connect_errno) error('Database connection error', 500);

    $mysql->set_charset("utf8mb4");

    return $mysql;
}

function query($query, $ignore_errors = []) {
    global $mysql;
    if (!isset($mysql)) return null;

    $response = $mysql->query($query);
    if ($mysql->errno && !in_array($mysql->errno, $ignore_errors, true)) internal_error();

    return $response;
}

function multi_query($query, $ignore_errors = []) {
    global $mysql;
    if (!isset($mysql)) return null;

    $response = [];

    if ($mysql->multi_query($query)) {
        do {
            if ($result = $mysql->store_result()) {
                $response[] = $result->fetch_all(MYSQLI_NUM);
                $result->free();
            }
        } while ($mysql->next_result());
    }

    if ($mysql->errno && !in_array($mysql->errno, $ignore_errors, true)) internal_error();

    return $response;
}
