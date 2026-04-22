SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------
-- USERS (Admin, Professors, Students)
-- ----------------------
INSERT INTO users (username, email, phone, password_hash, role, is_active, last_login) VALUES
-- Admin
('admin', 'admin@iitk.ac.in', '9999999999', '$2b$10$admin_hash_placeholder', 'admin', TRUE, NULL),
-- Professors
('mehta', 'mehta@iitk.ac.in', '9876543210', '$2b$10$prof1_hash_placeholder', 'professor', TRUE, NULL),
('iyer', 'iyer@iitk.ac.in', '9876543211', '$2b$10$prof2_hash_placeholder', 'professor', TRUE, NULL),
('gupta', 'gupta@iitk.ac.in', '9876543212', '$2b$10$prof3_hash_placeholder', 'professor', TRUE, NULL),
-- Students
('amit_sharma', 'amit.sharma@iitk.ac.in', '9111111111', '$2b$10$student1_hash_placeholder', 'student', TRUE, NULL),
('neha_verma', 'neha.verma@iitk.ac.in', '9111111112', '$2b$10$student2_hash_placeholder', 'student', TRUE, NULL),
('ravi_kumar', 'ravi.kumar@iitk.ac.in', '9111111113', '$2b$10$student3_hash_placeholder', 'student', TRUE, NULL),
('priya_singh', 'priya.singh@iitk.ac.in', '9111111114', '$2b$10$student4_hash_placeholder', 'student', TRUE, NULL),
('arjun_das', 'arjun.das@iitk.ac.in', '9111111115', '$2b$10$student5_hash_placeholder', 'student', TRUE, NULL);

-- ----------------------
-- ACADEMICS (Current Semester)
-- ----------------------
INSERT INTO academics (type, year_start, year_end, sem_number, start_date, end_date, is_active) VALUES
('semester', 2025, 2026, 2, '2026-01-15', '2026-05-31', TRUE);

-- ----------------------
-- COURSES
-- ----------------------
INSERT INTO courses (course_code, course_name, credits, max_seats, professor_id, department) VALUES
('CS371', 'Design of Reinforced Concrete Structures', 9, 45, 2, 'CSE'),
('CS610', 'Programming for Performance', 9, 40, 2, 'CSE'),
('CE683', 'Humans, Environment and Sustainable Development', 9, 50, 3, 'CE');

-- ----------------------
-- COURSE PREREQUISITES
-- ----------------------
INSERT INTO course_prerequisites (course_id, prerequisite_course_id) VALUES
(2, 1);  -- CS610 requires CS371

-- ----------------------
-- PRIORITY RULES (Per-course weights)
-- ----------------------
INSERT INTO priority_rules (course_id, weight_cpi, weight_year, weight_first_come, weight_dept_match, weight_major_intent, weight_minor_intent, weight_elective_intent) VALUES
(1, 1.0, 0.1, 0.01, 0.5, 1.0, 0.6, 0.4),
(2, 1.0, 0.1, 0.01, 0.5, 1.0, 0.6, 0.4),
(3, 1.0, 0.1, 0.01, 0.5, 1.0, 0.6, 0.4);

-- ----------------------
-- ENROLLMENTS (Course Requests)
-- ----------------------
INSERT INTO enrollments (user_id, course_id, sem_number, intent, status, requested_at) VALUES
-- Student 1: Amit Sharma
(6, 1, 2, 'major', 'pending', NOW()),
(6, 2, 2, 'major', 'pending', NOW()),
-- Student 2: Neha Verma
(7, 1, 2, 'major', 'pending', NOW()),
(7, 2, 2, 'minor', 'pending', NOW()),
-- Student 3: Ravi Kumar
(8, 3, 2, 'major', 'pending', NOW()),
-- Student 4: Priya Singh
(9, 3, 2, 'elective', 'pending', NOW()),
-- Student 5: Arjun Das
(10, 1, 2, 'major', 'pending', NOW()),
(10, 2, 2, 'major', 'pending', NOW());

SET FOREIGN_KEY_CHECKS = 1;