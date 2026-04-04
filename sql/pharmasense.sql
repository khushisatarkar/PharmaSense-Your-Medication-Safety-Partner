CREATE DATABASE IF NOT EXISTS pharmasense;
USE pharmasense;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    age INT,
    gender VARCHAR(10),
    height INT,
    weight INT,
    conditions TEXT,
    allergies TEXT,
    current_meds TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users 
(full_name, email, password, age, gender, height, weight, conditions, allergies, current_meds, created_at)
VALUES
('Khushi Satarkar', 'khushisatarkar24@gmail.com', '$2y$10$p6aqLQAyoSpcUGPcLTGSGuQciXvHowzZCJNVrK7H4c/...', 21, 'Female', 173, 52, 'hyperacidity', 'NSAID', NULL, '2026-03-16 20:46:27'),

('Rajnandini Mulay', 'mulayrajnandini@gmail.com', '$2y$10$NEmnyK4gwZz6XSbt/AW7VOqA/TxKcHme88WxMqEpEvV...', 24, 'Female', 168, 60, 'migraine,pcos', NULL, 'Neurobion Forte', '2026-03-16 20:49:46'),

('Ekta Salgar', 'ektasalgar@gmail.com', '$2y$10$5kwIk0GyYnrNwui0tyCcguAjV9jXrgTu/9t1rmw8cAs...', 22, 'Female', 160, 60, 'hypertension,pcos', 'tree nuts', NULL, '2026-03-16 22:11:20');


CREATE TABLE user_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(20),
    input_data TEXT,
    result VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO user_history 
(user_id, type, input_data, result, created_at)
VALUES
(2, 'safety', '{"medicine":"crocin","age":"24","dosageAmount":"500"}', 'Safe', '2026-03-29 19:56:18'),

(2, 'drug', '["crocin","corex"]', 'Safe', '2026-03-29 20:06:20'),

(2, 'drug', '["augmentin","corex"]', 'Safe', '2026-03-29 20:06:57'),

(1, 'drug', '["crocin","corex"]', 'Safe', '2026-03-30 10:18:11'),

(1, 'safety', '{"medicine":"crocin","age":"21","dosageAmount":"500"}', 'Not Safe', '2026-03-30 10:19:12'),

(1, 'drug', '["crocin","augmentin"]', 'Safe', '2026-04-02 11:35:02'),

(1, 'safety', '{"medicine":"crocin","age":"21","dosageAmount":"500"}', 'Not Safe', '2026-04-02 13:17:33'),

(1, 'safety', '{"medicine":"augmentin","age":"21","dosageAmount":"500"}', 'Not Safe', '2026-04-02 13:17:51');