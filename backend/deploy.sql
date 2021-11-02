# SET FOREIGN_KEY_CHECKS=0;
# DROP TABLE IF EXISTS users, tokens, teachers, students, `groups`, subjects, mark_columns, marks;
# SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status TINYINT UNSIGNED, # 0bit - admin, 1bit - teacher, 2bit - student
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    patronymic VARCHAR(20),
    creation_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token BINARY(64) NOT NULL UNIQUE,
    expiry_time DATETIME,
    CONSTRAINT token_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  CONSTRAINT teacher_id_fk FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  CONSTRAINT student_id_fk FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `groups` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(15) NOT NULL UNIQUE,
    classroom_teacher_id INT,
    creation_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT group_classroom_teacher_id_fk FOREIGN KEY (classroom_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE students ADD CONSTRAINT student_group_id_fk FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
	group_id INT NOT NULL,
	teacher_id INT,
	last_edit_time TIMESTAMP,
	creation_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE (name, group_id),
	CONSTRAINT subject_group_id_fk FOREIGN KEY(group_id) REFERENCES `groups`(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT subject_teacher_id_fk FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE mark_columns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
	date DATE NOT NULL,
    UNIQUE (subject_id, date),
	CONSTRAINT mark_subject_id_fk FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    column_id INT NOT NULL,
    student_id INT NOT NULL,
    mark VARCHAR(10) NOT NULL,
    UNIQUE (column_id, student_id),
    CONSTRAINT mark_column_id_fk FOREIGN KEY(column_id) REFERENCES mark_columns(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT mark_student_id_fk FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE PROCEDURE set_subject_last_edit_time_by_mark(IN mark_id INT)
BEGIN
    SELECT s.id INTO @subject_id FROM subjects s
    INNER JOIN mark_columns mc ON s.id = mc.subject_id
    INNER JOIN marks m on mc.id = m.column_id AND m.id=mark_id;

    UPDATE subjects s SET s.last_edit_time = CURRENT_TIMESTAMP WHERE s.id=@subject_id;
END;

CREATE PROCEDURE set_subject_last_edit_time_by_mark_column(IN mark_column_id INT)
BEGIN
    SELECT s.id INTO @subject_id FROM subjects s
    INNER JOIN mark_columns mc ON s.id = mc.subject_id AND mc.id=mark_column_id;

    UPDATE subjects s SET s.last_edit_time = CURRENT_TIMESTAMP WHERE s.id=@subject_id;
END;