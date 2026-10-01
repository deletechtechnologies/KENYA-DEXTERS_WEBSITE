CREATE DATABASE IF NOT EXISTS dexters_db;
USE dexters_db;

CREATE TABLE IF NOT EXISTS care_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    location VARCHAR(150) NOT NULL,
    who_needs_care VARCHAR(100) NOT NULL,
    main_need TEXT NOT NULL,
    service_required VARCHAR(150) DEFAULT NULL,
    start_date DATE DEFAULT NULL,
    care_arrangement VARCHAR(100) DEFAULT NULL,
    additional_info TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;