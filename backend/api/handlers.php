<?php

require_once 'errors.php';
require_once 'db.php';
require_once 'auth.php';
require_once 'utils.php';

function options() {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
}

function login(): array {
    global $mysql;

    if (isset($_SERVER['HTTP_AUTHORIZATION']) && $_SERVER['HTTP_AUTHORIZATION'] !== '') bad_request();

    $data = json_decode(file_get_contents('php://input'), true);

    $login = $mysql->escape_string($data['login']);
    $pass = $data['password'];
    if (!isset($login) || !isset($pass) || $login === '' || $pass === '') bad_request();

    $res = query("SELECT * FROM users WHERE login='$login'");
    if ($res->num_rows == 0) {
        $res->close();
        unauthorized();
    }

    $user = $res->fetch_assoc();
    $res->close();

    if (!password_verify($pass, $user['password'])) unauthorized();

    try {
        $token = bin2hex(random_bytes(32));
    } catch (Exception $e) {
        error($e->getMessage(), 500);
    }

    query("INSERT INTO tokens (user_id, token, expiry_time) VALUES ('$user[id]', UNHEX(SHA2('$token', 512)), NULL)");

    $response = [
        'status' => true,
        'token' => $token,
        'userStatus' => $user['status']
    ];

    if ($user['status'] & 4) {
        $user_id = $user['id'];
        $res = query("SELECT g.name FROM users u
                INNER JOIN students s on u.id = s.id
                INNER JOIN `groups` g on s.group_id = g.id
                WHERE u.id = $user_id;");
        $response['groupName'] = $res->fetch_row()[0];
    }

    return $response;
}

function token_verify(): array {
    global $user;

    $response = [
        'status' => true,
        'userStatus' => $user['status']
    ];

    $user_id = $user['id'];

    if ($user['status'] & 4) {
        $res = query("SELECT g.name FROM users u
                INNER JOIN students s on u.id = s.id
                INNER JOIN `groups` g on s.group_id = g.id
                WHERE u.id = $user_id");
        $response['groupName'] = $res->fetch_row()[0];
    }

    return $response;
}

function logout() {
    global $user;

    if (isset($_GET['all']) && $_GET['all'] === 'true')
        query("DELETE FROM tokens WHERE user_id = $user[id]");
    else query("DELETE FROM tokens WHERE id = $user[token_id]");
}

function user(): array {
    global $user;

    $response = [
        'login' => $user['login'],
        'status' => $user['status'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'patronymic' => $user['patronymic'],
    ];

    if ($user['status'] & 2) {
        $res = query("SELECT name FROM groups WHERE classroom_teacher_id = $user[id]");
        while ($row = $res->fetch_row()) {
            $response['classroom_teacher'][] = $row[0];
        }
        $res->close();
    }

    if ($user['status'] & 4) {
        $res = query("SELECT g.name FROM `groups` g
                            INNER JOIN students s ON g.id = s.group_id
                            WHERE s.id = $user[id]");

        if ($res->num_rows !== 0) $response['group'] = $res->fetch_row()[0];
        $res->close();
    }

    return $response;
}

function groups($id = null): array {

    $where = '';
    if (isset($id)) $where = "WHERE g.id = $id";

    $res = query("SELECT g.id, g.name,
                            CONCAT(u.last_name, ' ', u.first_name, ' ', u.patronymic) AS classroom_teacher,
                            COALESCE(s_count.count, 0) AS student_count,
                            COALESCE(sb_count.count, 0) AS subjects_count,
                            UNIX_TIMESTAMP(g.creation_time)
                        FROM `groups` g
                        LEFT JOIN teachers t on g.classroom_teacher_id = t.id
                        LEFT JOIN users u on t.id = u.id
                        LEFT JOIN teachers t2 on t2.id = g.classroom_teacher_id
                        LEFT JOIN (
                            SELECT sb.group_id, COUNT(sb.id) AS count
                            FROM subjects sb
                            GROUP BY sb.group_id
                        ) sb_count ON g.id = sb_count.group_id
                        LEFT JOIN (
                            SELECT s.group_id, COUNT(s.id) AS count
                            FROM students s
                            GROUP BY s.group_id
                        ) s_count ON g.id = s_count.group_id
                        $where
                        ORDER BY g.creation_time DESC");

    $response['groups'] = $res->fetch_all(MYSQLI_NUM);
    $res->close();

    return $response;
}

function group_delete(): array {
    global $explode_url;

    $group_id = filter_var($explode_url[1], FILTER_VALIDATE_INT);
    if ($group_id === false) bad_request();

    $res = query("DELETE FROM `groups` WHERE `groups`.id = $group_id");

    return [
        'status' => $res,
        'id' => $group_id
    ];
}

function group_create(): array {
    global $mysql;

    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['name']) || !array_key_exists('classroomTeacherId', $data)) bad_request();
    $name = escape_string(mb_strtoupper($data['name']));
    $classroom_teacher_id = 'NULL';
    if ($data['classroomTeacherId'] !== null) $classroom_teacher_id = filter_var($data['classroomTeacherId'], FILTER_VALIDATE_INT);

    if (mb_len($name) < 3 || mb_len($name) > 15 || $classroom_teacher_id === false) bad_request();
    $res = query("INSERT INTO `groups`(name, classroom_teacher_id) VALUES ('$name', $classroom_teacher_id)");

    $response = ['status' => $res];
    if ($res) {
        $response['group'] = groups($mysql->insert_id)['groups'][0];
    }

    return $response;
}

function teachers($id = null): array {
    $where = '';
    if (isset($id)) $where = "WHERE t.id = $id";

    $res = query("SELECT t.id, u.login, u.first_name, u.last_name, u.patronymic, sb_count.count, UNIX_TIMESTAMP(u.creation_time) FROM teachers t
                        INNER JOIN users u ON u.id = t.id
                        LEFT JOIN (
                            SELECT sb.teacher_id, COUNT(sb.id) AS count
                            FROM subjects sb
                            GROUP BY sb.teacher_id
                        ) sb_count ON t.id = sb_count.teacher_id
                        $where
                        ORDER BY u.creation_time DESC");

    $response['teachers'] = $res->fetch_all(MYSQLI_NUM);
    $res->close();

    return $response;
}

function teacher_delete(): array {
    global $explode_url;

    $teacher_id = filter_var($explode_url[1], FILTER_VALIDATE_INT);
    if ($teacher_id === false) bad_request();

    $res = query("DELETE FROM users
                        WHERE users.id = (SELECT t.id FROM teachers t WHERE t.id = $teacher_id)");

    return [
        'status' => false,
        'id' => $teacher_id
    ];
}

function teacher_create(): array
{
    global $mysql;

    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['login']) || !isset($data['firstName']) || !isset($data['lastName'])
        || !isset($data['patronymic']) || !isset($data['password'])) bad_request();

    $login = escape_string($data['login']);
    $first_name = format_name(escape_string($data['firstName']));
    $last_name = format_name(escape_string($data['lastName']));
    $patronymic = format_name(escape_string($data['patronymic']));
    $password = $data['password'];

    if (preg_match('/\s/', $login) || mb_len($login) < 5 || mb_len($login) > 20
        || mb_len($first_name) < 3 || mb_len($first_name) > 20
        || mb_len($last_name) < 3 || mb_len($last_name) > 20
        || mb_len($patronymic) < 3 || mb_len($patronymic) > 20
        || mb_len($password) < 5 || mb_len($password) > 50) bad_request();

    $password = password_hash($password, PASSWORD_DEFAULT);

    $res = multi_query("INSERT INTO users(login, password, status, first_name, last_name, patronymic)
                                VALUES ('$login', '$password', 2, '$first_name', '$last_name', '$patronymic');
                                INSERT INTO teachers VALUES (LAST_INSERT_ID())", [1062]);

    if ($mysql->errno === 1062) error("Login already in use", 409);

    $response['teacher'] = teachers($mysql->insert_id)['teachers'][0];

    return $response;
}

function students($id = null): array {
    $where = '';
    if (isset($id)) $where = "WHERE s.id = $id";

    $res = query("SELECT s.id, u.login, u.first_name, u.last_name, s.group_id, g.name, UNIX_TIMESTAMP(u.creation_time)
                        FROM students s
                        LEFT JOIN users u ON u.id = s.id
                        LEFT JOIN `groups` g ON g.id = s.group_id
                        $where
                        ORDER BY u.creation_time DESC");

    $response['students'] = $res->fetch_all(MYSQLI_NUM);
    $res->close();

    return $response;
}

function student_delete(): array {
    global $explode_url;

    $student_id = filter_var($explode_url[1], FILTER_VALIDATE_INT);
    if ($student_id === false) bad_request();

    $res = query("DELETE FROM users
                        WHERE users.id = (SELECT s.id FROM students s WHERE s.id = $student_id)");

    return [
        'status' => false,
        'id' => $student_id
    ];
}

function student_create(): array {
    global $mysql;

    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['login']) || !isset($data['firstName']) || !isset($data['lastName'])
        || !isset($data['groupId']) || filter_var($data['groupId'],FILTER_VALIDATE_INT) === false
        || !isset($data['password'])) bad_request();

    $login = escape_string($data['login']);
    $first_name = format_name(escape_string($data['firstName']));
    $last_name = format_name(escape_string($data['lastName']));
    $group_id = filter_var($data['groupId'],FILTER_VALIDATE_INT);
    $password = $data['password'];

    if (preg_match('/\s/', $login) || mb_len($login) < 5 || mb_len($login) > 20
        || mb_len($first_name) < 3 || mb_len($first_name) > 20
        || mb_len($last_name) < 3 || mb_len($last_name) > 20
        || mb_len($password) < 5 || mb_len($password) > 50) bad_request();

    $password = password_hash($password, PASSWORD_DEFAULT);

    $res = multi_query("INSERT INTO users(login, password, status, first_name, last_name)
                        SELECT * FROM (SELECT '$login', '$password', 4, '$first_name', '$last_name') as tmp
                        WHERE EXISTS (SELECT id FROM `groups` WHERE id = $group_id)
                        LIMIT 1;
                        INSERT INTO students(id, group_id) VALUES (LAST_INSERT_ID(), $group_id)", [1062]);

    if ($mysql->errno === 1062) error("Login already in use", 409);

    $response['student'] = students($mysql->insert_id)['students'][0];

    return $response;
}

function marks(): array {
    global $explode_url;

    $group_name = escape_string($explode_url[1]);
    $subject_name = escape_string($explode_url[2]);

    $res = multi_query("
    SELECT @subject_id := s.id, s.name, CONCAT(u.last_name, ' ', u.first_name, ' ', u.patronymic) as teacher,
       @group_id := g.id, g.name, CONCAT(u.last_name, ' ', u.first_name, ' ', u.patronymic) as classroom_teacher
    FROM subjects s
    INNER JOIN `groups` g ON s.group_id = g.id AND g.name = '$group_name'
    LEFT JOIN teachers t ON s.teacher_id = t.id
    LEFT JOIN users u ON  t.id = u.id
    LEFT JOIN teachers t2 ON g.classroom_teacher_id = t2.id
    LEFT JOIN users u2 ON t2.id = u2.id
    WHERE s.name = '$subject_name';
    
    SELECT mc.id, UNIX_TIMESTAMP(mc.date) FROM mark_columns mc WHERE subject_id = @subject_id;
    
    SELECT s.id,  CONCAT(u.last_name, ' ', u.first_name) FROM students s
    INNER JOIN `groups` g ON s.group_id = g.id AND g.id = @group_id
    LEFT JOIN users u on s.id = u.id;
    
    SELECT m.id, mc.id, m.student_id, m.mark FROM marks m
    INNER JOIN mark_columns mc ON m.column_id = mc.id AND mc.subject_id = @subject_id;
    ");

    if (empty($res[0])) resource_not_found();

    $response['subject'] = $res[0][0];
    $response['cols'] = $res[1];
    $response['students'] = $res[2];
    $response['marks'] = $res[3];

    return $response;
}

function mark_update() {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['colId']) || filter_var($data['colId'],FILTER_VALIDATE_INT) === false ||
        !isset($data['stId']) || filter_var($data['stId'],FILTER_VALIDATE_INT) === false ||
        !isset($data['mark'])) bad_request();

    $column_id = filter_var($data['colId'],FILTER_VALIDATE_INT);
    $student_id = filter_var($data['stId'],FILTER_VALIDATE_INT);
    $mark = escape_string($data['mark']);

    multi_query("INSERT INTO marks(column_id, student_id, mark) VALUES ($column_id, $student_id, '$mark') ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), mark = '$mark';
                 CALL set_subject_last_edit_time_by_mark(LAST_INSERT_ID());");
}

function column_create() {
    global $mysql;
    $data = json_decode(file_get_contents('php://input'), true);

    $subject_id = filter_var($data['subjectId'],FILTER_VALIDATE_INT);
    $date = filter_var($data['date'],FILTER_VALIDATE_INT);

    if ($subject_id === false || $date === false) bad_request();

    multi_query("INSERT INTO mark_columns(subject_id, date) VALUES ($subject_id, FROM_UNIXTIME($date));
                 CALL set_subject_last_edit_time_by_mark_column(LAST_INSERT_ID());");

    return [
        'columnId' => $mysql->insert_id,
        'date' => $date
    ];
}

function column_update() {
    global $explode_url;

    $data = json_decode(file_get_contents('php://input'), true);

    $column_id = filter_var($explode_url[1], FILTER_VALIDATE_INT);
    $date = filter_var($data['date'], FILTER_VALIDATE_INT);

    if ($column_id === false || $date === false) bad_request();

    multi_query("UPDATE mark_columns SET date = FROM_UNIXTIME($date) WHERE id=$column_id;
                CALL set_subject_last_edit_time_by_mark_column($column_id);");

    return [
        'columnId' => $column_id,
        'date' => $date
    ];
}

function column_delete() {
    global $explode_url;

    $column_id = filter_var($explode_url[1], FILTER_VALIDATE_INT);

    if ($column_id === false) bad_request();

    multi_query("CALL set_subject_last_edit_time_by_mark_column($column_id);
                DELETE FROM mark_columns WHERE id=$column_id;");

    return [
        'columnId' => $column_id
    ];
}

function subjects() {
    global $explode_url;

    $group_name = escape_string($explode_url[1]);

    $res = multi_query("SELECT @group_id := g.id, g.name, g.classroom_teacher_id, CONCAT(u.last_name, ' ', u.first_name, ' ', u.patronymic) as classroom_teacher_name FROM `groups` AS g
LEFT JOIN teachers t ON g.classroom_teacher_id = t.id
LEFT JOIN users u ON t.id = u.id
WHERE name = '$group_name';

SELECT s.id, s.name, s.teacher_id, CONCAT(u.last_name, ' ', u.first_name, ' ', u.patronymic) as teacher_name, UNIX_TIMESTAMP(s.last_edit_time), UNIX_TIMESTAMP(s.creation_time) FROM subjects AS s
LEFT JOIN teachers t ON s.teacher_id = t.id
LEFT JOIN users u ON t.id = u.id
WHERE group_id = @group_id
ORDER BY s.name;");

    if (empty($res[0])) resource_not_found();

    $response['group'] = $res[0][0];
    $response['subjects'] = $res[1];

    return $response;
}

function subject_create() {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['name']) || !isset($data['groupId']) || !array_key_exists('teacherId', $data)) bad_request();

    $name = escape_string($data['name']);
    $group_id = filter_var($data['groupId'], FILTER_VALIDATE_INT);
    $teacher_id = 'NULL';
    if ($data['teacherId'] !== null) $teacher_id = filter_var($data['teacherId'], FILTER_VALIDATE_INT);

    if (mb_len($name) < 2 || mb_len($name) > 100 || $group_id === false || $teacher_id === false) bad_request();

    $res = multi_query("INSERT INTO subjects SET name='$name', group_id=$group_id, teacher_id=$teacher_id;

SELECT s.id, s.name, s.teacher_id, CONCAT(u.last_name, ' ', u.first_name) as teacher_name, UNIX_TIMESTAMP(s.last_edit_time), UNIX_TIMESTAMP(s.creation_time) FROM subjects s
LEFT JOIN teachers t ON s.teacher_id = t.id
LEFT JOIN users u ON t.id = u.id
WHERE s.id = LAST_INSERT_ID();");

    $response['subject'] = $res[0][0];

    return $response;
}

function subject_edit() {
    global $explode_url;
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['name']) || !array_key_exists('teacherId', $data)) bad_request();

    $subject_id = filter_var($explode_url[1], FILTER_VALIDATE_INT);
    $name = escape_string($data['name']);
    $teacher_id = 'NULL';
    if ($data['teacherId'] !== null) $teacher_id = filter_var($data['teacherId'], FILTER_VALIDATE_INT);

    if (mb_len($name) < 2 || mb_len($name) > 100 || $subject_id === false || $teacher_id === false) bad_request();

    $res = multi_query("UPDATE subjects SET name='$name', teacher_id=$teacher_id WHERE id=$subject_id;
    
SELECT s.id, s.name, s.teacher_id, CONCAT(u.last_name, ' ', u.first_name) as teacher_name, UNIX_TIMESTAMP(s.last_edit_time), UNIX_TIMESTAMP(s.creation_time) FROM subjects s
LEFT JOIN teachers t ON s.teacher_id = t.id
LEFT JOIN users u ON t.id = u.id
WHERE s.id = $subject_id;");

    return [
        'subject' => $res[0][0]
    ];
}

function subject_delete() {
    global $explode_url;

    $subject_id = filter_var($explode_url[1], FILTER_VALIDATE_INT);
    if ($subject_id === false) bad_request();

    query("DELETE FROM subjects WHERE id=$subject_id");

    return [
        'subjectId' => $subject_id
    ];
}

function edit_profile() {
    global $user, $mysql;

    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['login']) || !isset($data['firstName']) || !isset($data['lastName']) || ($user['status'] & 2 && !isset($data['patronymic']))) bad_request();

    $login = escape_string($data['login']);
    $first_name = format_name(escape_string($data['firstName']));
    $last_name = format_name(escape_string($data['lastName']));
    $patronymic = isset($data['patronymic']) && $user['status'] & 2 ? format_name(escape_string($data['patronymic'])) : null;
    $password = $data['password'];
    $user_id = $user['id'];


    if (preg_match('/\s/', $login) || mb_len($login) < 5 || mb_len($login) > 20
        || mb_len($first_name) < 3 || mb_len($first_name) > 20
        || mb_len($last_name) < 3 || mb_len($last_name) > 20
        || $patronymic && (mb_len($patronymic) < 3 || mb_len($patronymic) > 20)
        || $password && (mb_len($password) < 5 || mb_len($password) > 50)) bad_request();

    $token_id = $user['token_id'];
    $patronymic = $patronymic ? ", patronymic='$patronymic'" : '';

    if ($password) $password = password_hash($password, PASSWORD_DEFAULT);
    $password = $password ? ", password='$password'" : '';

    $query = "UPDATE users SET login='$login', first_name='$first_name', last_name='$last_name' $patronymic $password WHERE id=$user_id;";
    if ($password !== '') $query = $query."DELETE FROM tokens WHERE user_id=$user_id AND id!=$token_id";

    multi_query($query, [1062]);

    if ($mysql->errno === 1062) error("Login already in use", 409);

    auth(0xFF);
    return user();
}

function teacher_edit() {
    global $explode_url, $mysql, $user;

    $data = json_decode(file_get_contents('php://input'), true);
    $id = filter_var($explode_url[1], FILTER_VALIDATE_INT);

    if ($id === false || !isset($data['login']) || !isset($data['firstName']) || !isset($data['lastName']) || !isset($data['patronymic'])) bad_request();

    $login = escape_string($data['login']);
    $first_name = format_name(escape_string($data['firstName']));
    $last_name = format_name(escape_string($data['lastName']));
    $patronymic = format_name(escape_string($data['patronymic']));
    $password = $data['password'];

    if (preg_match('/\s/', $login) || mb_len($login) < 5 || mb_len($login) > 20
        || mb_len($first_name) < 3 || mb_len($first_name) > 20
        || mb_len($last_name) < 3 || mb_len($last_name) > 20
        || mb_len($patronymic) < 3 || mb_len($patronymic) > 20
        || $password && (mb_len($password) < 5 || mb_len($password) > 50)) bad_request();

    if ($password) $password = password_hash($password, PASSWORD_DEFAULT);
    $password = $password ? ", password='$password'" : '';

    $query = "UPDATE users SET login='$login', first_name='$first_name', last_name='$last_name', patronymic='$patronymic' $password WHERE id=$id;";
    if ($password !== '') {
        $token_id = $user['token_id'];
        $query = $query."DELETE FROM tokens WHERE user_id=$id AND id!=$token_id;";
    }

    multi_query($query, [1062]);

    if ($mysql->errno === 1062) error("Login already in use", 409);

    $response['teacher'] = teachers($id)['teachers'][0];

    return $response;
}

function student_edit() {
    global $explode_url, $mysql, $user;

    $data = json_decode(file_get_contents('php://input'), true);
    $id = filter_var($explode_url[1], FILTER_VALIDATE_INT);

    if ($id === false || !isset($data['login']) || !isset($data['firstName']) || !isset($data['lastName'])
    || !isset($data['groupId']) || filter_var($data['groupId'],FILTER_VALIDATE_INT) === false) bad_request();

    $login = escape_string($data['login']);
    $first_name = format_name(escape_string($data['firstName']));
    $last_name = format_name(escape_string($data['lastName']));
    $group_id = filter_var($data['groupId'],FILTER_VALIDATE_INT);
    $password = $data['password'];

    if (preg_match('/\s/', $login) || mb_len($login) < 5 || mb_len($login) > 20
        || mb_len($first_name) < 3 || mb_len($first_name) > 20
        || mb_len($last_name) < 3 || mb_len($last_name) > 20
        || $password && (mb_len($password) < 5 || mb_len($password) > 50)) bad_request();

    if ($password) $password = password_hash($password, PASSWORD_DEFAULT);
    $password = $password ? ", password='$password'" : '';

    $query = "UPDATE users SET login='$login', first_name='$first_name', last_name='$last_name' $password WHERE id=$id;
                UPDATE students SET group_id = $group_id WHERE id = $id;";
    if ($password !== '') {
        $token_id = $user['token_id'];
        $query = $query."DELETE FROM tokens WHERE user_id=$id AND id!=$token_id;";
    }

    multi_query($query, [1062]);

    if ($mysql->errno === 1062) error("Login already in use", 409);

    $response['student'] = students($id)['students'][0];

    return $response;
}

function group_edit(): array {
    global $explode_url, $mysql;

    $data = json_decode(file_get_contents('php://input'), true);
    $id = filter_var($explode_url[1], FILTER_VALIDATE_INT);

    if ($id === false || !isset($data['name']) || !array_key_exists('classroomTeacherId', $data)) bad_request();

    $name = escape_string(mb_strtoupper($data['name']));
    $classroom_teacher_id = $data['classroomTeacherId'] === null ? 'NULL' : filter_var($data['classroomTeacherId'], FILTER_VALIDATE_INT);

    if (mb_len($name) < 3 || mb_len($name) > 15 || $classroom_teacher_id === false) bad_request();

    $res = query("UPDATE groups SET name='$name', classroom_teacher_id=$classroom_teacher_id WHERE id=$id", [1062]);

    if (!$res) error("Group name already in use", 409);

    $response['group'] = groups($id)['groups'][0];

    return $response;
}
