<?php

require_once 'errors.php';
require_once 'db.php';

function auth($status) {
    global $mysql, $user;

    if (!isset($_SERVER['HTTP_AUTHORIZATION']) || $_SERVER['HTTP_AUTHORIZATION'] === '') unauthorized();
    $token = $mysql->escape_string($_SERVER['HTTP_AUTHORIZATION']);

    $res = query("SELECT id, user_id FROM tokens WHERE token = UNHEX(SHA2('$token', 512))");
    if ($res->num_rows !== 1) unauthorized();

    $row = $res->fetch_row();
    $res->close();

    $user = [
        'id' => $row[1],
        'token_id' => $row[0]
    ];

    $res = query("SELECT * FROM users WHERE id = $user[id]");

    $row = $res->fetch_assoc();
    $res->close();

    if ((intval($row['status']) & $status) === 0) forbidden();

    $user['login'] = $row['login'];
    $user['status'] = intval($row['status']);
    $user['first_name'] = $row['first_name'];
    $user['last_name'] = $row['last_name'];
    $user['patronymic'] = $row['patronymic'];
}
