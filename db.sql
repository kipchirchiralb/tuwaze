-- =====================================================
-- SDG 16 App: TUWAZE (Eldoret)
-- MySQL Database Schema
-- =====================================================

-- Use InnoDB for FK support
SET ENGINE=InnoDB;

-- =====================================================
-- 1. USERS
-- =====================================================
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    email VARCHAR(150) UNIQUE,
    gender VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('citizen', 'official', 'moderator', 'legal_aid') NOT NULL,
    ward VARCHAR(100),
    is_anonymous_allowed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 2. COMMUNITY REPORTING
-- =====================================================

CREATE TABLE reports (
    report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    category ENUM('safety', 'corruption', 'infrastructure', 'dispute') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location_description VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status ENUM('submitted', 'in_review', 'resolved', 'rejected') DEFAULT 'submitted',
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE report_media (
    media_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type ENUM('image', 'video') NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_report
        FOREIGN KEY (report_id) REFERENCES reports(report_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE report_assignments (
    assignment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT NOT NULL,
    assigned_to_department VARCHAR(150) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_assignment_report
        FOREIGN KEY (report_id) REFERENCES reports(report_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- 3. ANONYMOUS TIP LINE
-- =====================================================

CREATE TABLE anonymous_tips (
    tip_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('new', 'in_progress', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE tip_messages (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tip_id BIGINT NOT NULL,
    sender_type ENUM('citizen', 'authority') NOT NULL,
    encrypted_message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tip_message
        FOREIGN KEY (tip_id) REFERENCES anonymous_tips(tip_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- 4. JUSTICE & LEGAL SUPPORT DIRECTORY
-- =====================================================

CREATE TABLE legal_services (
    service_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    service_type ENUM('legal_aid', 'police', 'court', 'NGO') NOT NULL,
    description TEXT,
    phone VARCHAR(50),
    email VARCHAR(150),
    physical_address VARCHAR(255),
    ward VARCHAR(100),
    operating_hours VARCHAR(150)
) ENGINE=InnoDB;

CREATE TABLE legal_documents (
    document_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    document_type ENUM(
        'constitution',
        'county_law',
        'police_form',
        'court_form',
        'rights_guide',
        'policy'
    ) NOT NULL,
    description TEXT,
    language ENUM('English', 'Kiswahili') NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    published_by VARCHAR(255),
    publish_date DATE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 5. COMMUNITY VOICE FORUM
-- =====================================================

CREATE TABLE forum_topics (
    topic_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    status ENUM('open', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_topic_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE forum_comments (
    comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_topic
        FOREIGN KEY (topic_id) REFERENCES forum_topics(topic_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_comment_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE forum_votes (
    vote_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    vote_type ENUM('upvote', 'downvote') NOT NULL,
    CONSTRAINT fk_vote_topic
        FOREIGN KEY (topic_id) REFERENCES forum_topics(topic_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_vote_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    UNIQUE (topic_id, user_id)
) ENGINE=InnoDB;

-- =====================================================
-- 6. GOVCONNECT (PUBLIC MEETINGS)
-- =====================================================

CREATE TABLE government_meetings (
    meeting_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_date DATETIME NOT NULL,
    location VARCHAR(255),
    ward VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE meeting_questions (
    question_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_meeting
        FOREIGN KEY (meeting_id) REFERENCES government_meetings(meeting_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_question_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- 7. TRANSPARENCY DASHBOARD
-- =====================================================

CREATE TABLE public_projects (
    project_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    department VARCHAR(150),
    ward VARCHAR(100),
    budget_allocated DECIMAL(15,2),
    start_date DATE,
    expected_end_date DATE,
    status VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE service_metrics (
    metric_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(150) NOT NULL,
    metric_type ENUM('avg_response_time', 'resolution_rate') NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
