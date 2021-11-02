<?php

function escape_string($str) {
    global $mysql;

    if (isset($mysql)) return $mysql->escape_string($str);
}


function format_name($str) {
    $words = preg_split('/\s+/', $str);

    foreach ($words as &$word)
        $word = mb_strtoupper(mb_substr($word, 0, 1)).mb_strtolower(mb_substr($word, 1));

    return join(' ', $words);
}

function mb_len($str) {
    return mb_strlen($str, 'UTF-8');
}
