-- Course Registration System — normalized schema (MySQL 8+)
-- Meeting types are in course_meetings (not duplicated course attributes per row).
-- Lab / tutorial / lecture differ only by meeting_type + times; course_id FK avoids repeating course metadata.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS waitlist;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS priority_scores;
DROP TABLE IF EXISTS priority_rules;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS prerequisites;
DROP TABLE IF EXISTS course_meetings;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS professors;
DROP TABLE IF EXISTS students;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE students (
  student_id VARCHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  dept VARCHAR(16) NOT NULL,
  year TINYINT NOT NULL,
  cpi DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE professors (
  prof_id VARCHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  dept VARCHAR(16) NOT NULL,
  prof_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE courses (
  course_id VARCHAR(32) NOT NULL PRIMARY KEY,
  course_name VARCHAR(255) NOT NULL,
  course_credit TINYINT NOT NULL,
  prof_id VARCHAR(32) NOT NULL,
  max_seats INT NOT NULL DEFAULT 0,
  offering_dept VARCHAR(16) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_prof FOREIGN KEY (prof_id) REFERENCES professors(prof_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- One row per actual calendar meeting (lecture / tutorial / lab); 3NF — no repeated course_name here.
CREATE TABLE course_meetings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  course_id VARCHAR(32) NOT NULL,
  meeting_type ENUM('LECTURE', 'TUTORIAL', 'LAB') NOT NULL,
  day_of_week TINYINT NOT NULL COMMENT '1=Monday .. 7=Sunday',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CONSTRAINT fk_meetings_course FOREIGN KEY (course_id) REFERENCES courses(course_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_time CHECK (start_time < end_time)
) ENGINE=InnoDB;

CREATE INDEX idx_meetings_course ON course_meetings(course_id);
CREATE INDEX idx_meetings_day_time ON course_meetings(day_of_week, start_time, end_time);

CREATE TABLE prerequisites (
  course_id VARCHAR(32) NOT NULL,
  prereq_course_id VARCHAR(32) NOT NULL,
  PRIMARY KEY (course_id, prereq_course_id),
  CONSTRAINT fk_pre_course FOREIGN KEY (course_id) REFERENCES courses(course_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_pre_prereq FOREIGN KEY (prereq_course_id) REFERENCES courses(course_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_pre_neq CHECK (course_id <> prereq_course_id)
) ENGINE=InnoDB;

CREATE TABLE requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(32) NOT NULL,
  course_id VARCHAR(32) NOT NULL,
  status ENUM('requested', 'accepted', 'rejected', 'waitlisted') NOT NULL DEFAULT 'requested',
  -- major/minor/elective drives priority weights with priority_rules
  request_intent ENUM('major', 'minor', 'elective') NOT NULL DEFAULT 'major',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_req_student FOREIGN KEY (student_id) REFERENCES students(student_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_req_course FOREIGN KEY (course_id) REFERENCES courses(course_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_student_course (student_id, course_id)
) ENGINE=InnoDB;

CREATE INDEX idx_requests_course_status ON requests(course_id, status);

-- Per-course weight knobs (CPI, year, first-come, dept match, major vs minor vs elective)
CREATE TABLE priority_rules (
  course_id VARCHAR(32) NOT NULL PRIMARY KEY,
  weight_cpi DECIMAL(8,4) NOT NULL DEFAULT 1.0,
  weight_year DECIMAL(8,4) NOT NULL DEFAULT 0.1,
  weight_first_come DECIMAL(8,4) NOT NULL DEFAULT 0.01,
  weight_dept DECIMAL(8,4) NOT NULL DEFAULT 0.5,
  weight_major DECIMAL(8,4) NOT NULL DEFAULT 1.0,
  weight_minor DECIMAL(8,4) NOT NULL DEFAULT 0.6,
  weight_elective DECIMAL(8,4) NOT NULL DEFAULT 0.4,
  CONSTRAINT fk_pr_rules_course FOREIGN KEY (course_id) REFERENCES courses(course_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE priority_scores (
  student_id VARCHAR(32) NOT NULL,
  course_id VARCHAR(32) NOT NULL,
  score DECIMAL(12,6) NOT NULL,
  computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, course_id),
  CONSTRAINT fk_ps_student FOREIGN KEY (student_id) REFERENCES students(student_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ps_course FOREIGN KEY (course_id) REFERENCES courses(course_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE enrollments (
  student_id VARCHAR(32) NOT NULL,
  course_id VARCHAR(32) NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, course_id),
  CONSTRAINT fk_enr_student FOREIGN KEY (student_id) REFERENCES students(student_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_enr_course FOREIGN KEY (course_id) REFERENCES courses(course_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE waitlist (
  student_id VARCHAR(32) NOT NULL,
  course_id VARCHAR(32) NOT NULL,
  position INT NOT NULL,
  PRIMARY KEY (student_id, course_id),
  CONSTRAINT fk_wl_student FOREIGN KEY (student_id) REFERENCES students(student_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_wl_course FOREIGN KEY (course_id) REFERENCES courses(course_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_course_position (course_id, position)
) ENGINE=InnoDB;

-- Optional: after a seat frees, promote first waitlisted student (see also Node promoteWaitlist)
DELIMITER $$
DROP TRIGGER IF EXISTS tr_enrollment_after_delete$$
CREATE TRIGGER tr_enrollment_after_delete
AFTER DELETE ON enrollments
FOR EACH ROW
BEGIN
  DECLARE v_student VARCHAR(32);
  SELECT student_id INTO v_student FROM waitlist
    WHERE course_id = OLD.course_id
    ORDER BY position ASC
    LIMIT 1;
  IF v_student IS NOT NULL THEN
    INSERT INTO enrollments (student_id, course_id) VALUES (v_student, OLD.course_id);
    DELETE FROM waitlist WHERE student_id = v_student AND course_id = OLD.course_id;
    -- Compact positions after removing the head of the queue
    UPDATE waitlist SET position = position - 1
      WHERE course_id = OLD.course_id;
  END IF;
END$$
DELIMITER ;
