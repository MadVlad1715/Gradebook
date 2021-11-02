<?php

$ADMIN = 1;
$TEACHER = 2;
$STUDENT = 4;

$routing = [
    [
        'method' => 'OPTIONS',
        'pattern' => '#^.*$#i',
        'handler' => 'options',
    ],
    [
        'method' => 'POST',
        'pattern' => '#^login$#i',
        'handler' => 'login'
    ],
    [
        'method' => 'GET',
        'pattern' => '#^token/verify$#i',
        'handler' => 'token_verify',
        'auth' => $ADMIN | $TEACHER | $STUDENT
    ],
    [
        'method' => 'GET',
        'pattern' => '#^logout$#i',
        'handler' => 'logout',
        'auth' => $ADMIN | $TEACHER | $STUDENT
    ],
    [
        'method' => 'GET',
        'pattern' => '#^user$#i',
        'handler' => 'user',
        'auth' => $ADMIN | $TEACHER | $STUDENT
    ],
    [
        'method' => 'PUT',
        'pattern' => '#^user$#i',
        'handler' => 'edit_profile',
        'auth' => $ADMIN | $TEACHER | $STUDENT
    ],
    [
        'method' => 'GET',
        'pattern' => '#^groups$#i',
        'handler' => 'groups',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'DELETE',
        'pattern' => '#^groups/.*$#i',
        'handler' => 'group_delete',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'POST',
        'pattern' => '#^groups$#i',
        'handler' => 'group_create',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'PUT',
        'pattern' => '#^groups/.*$#i',
        'handler' => 'group_edit',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'GET',
        'pattern' => '#^teachers$#i',
        'handler' => 'teachers',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'DELETE',
        'pattern' => '#^teachers/.*$#i',
        'handler' => 'teacher_delete',
        'auth' => $ADMIN
    ],
    [
        'method' => 'PUT',
        'pattern' => '#^teachers/.*$#i',
        'handler' => 'teacher_edit',
        'auth' => $ADMIN
    ],
    [
        'method' => 'POST',
        'pattern' => '#^teachers$#i',
        'handler' => 'teacher_create',
        'auth' => $ADMIN
    ],
    [
        'method' => 'GET',
        'pattern' => '#^students$#i',
        'handler' => 'students',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'POST',
        'pattern' => '#^students$#i',
        'handler' => 'student_create',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'PUT',
        'pattern' => '#^students/.*$#i',
        'handler' => 'student_edit',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'DELETE',
        'pattern' => '#^students/.*$#i',
        'handler' => 'student_delete',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'GET',
        'pattern' => '#^marks/.*/.*$#i',
        'handler' => 'marks',
        'auth' => $ADMIN | $TEACHER | $STUDENT
    ],
    [
        'method' => 'PUT',
        'pattern' => '#^marks$#i',
        'handler' => 'mark_update',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'POST',
        'pattern' => '#^columns$#i',
        'handler' => 'column_create',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'PATCH',
        'pattern' => '#^columns/.*$#i',
        'handler' => 'column_update',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'DELETE',
        'pattern' => '#^columns/.*$#i',
        'handler' => 'column_delete',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'GET',
        'pattern' => '#^subjects/.*$#i',
        'handler' => 'subjects',
        'auth' => $ADMIN | $TEACHER | $STUDENT
    ],
    [
        'method' => 'POST',
        'pattern' => '#^subjects$#i',
        'handler' => 'subject_create',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'PUT',
        'pattern' => '#^subjects/.*$#i',
        'handler' => 'subject_edit',
        'auth' => $ADMIN | $TEACHER
    ],
    [
        'method' => 'DELETE',
        'pattern' => '#^subjects/.*$#i',
        'handler' => 'subject_delete',
        'auth' => $ADMIN | $TEACHER
    ],
];
