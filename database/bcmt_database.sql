-- ========================================================
-- BCMT Admission & Examination Portal - MySQL Dump
-- Ready for Hostinger phpMyAdmin Direct Import
-- Generated for: https://github.com/developeraipk/Bcmt.git
-- ========================================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnic` varchar(13) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_cnic_index` (`cnic`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `role_user`;
CREATE TABLE `role_user` (
  `role_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`user_id`),
  KEY `role_user_user_id_foreign` (`user_id`),
  CONSTRAINT `role_user_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `permission_role`;
CREATE TABLE `permission_role` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `permission_role_role_id_foreign` (`role_id`),
  CONSTRAINT `permission_role_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permission_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `permission_user`;
CREATE TABLE `permission_user` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`user_id`),
  KEY `permission_user_user_id_foreign` (`user_id`),
  CONSTRAINT `permission_user_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permission_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `admission_sessions`;
CREATE TABLE `admission_sessions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `closing_date` date NOT NULL,
  `closing_time` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '23:59',
  `status` enum('draft','open','closed','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `admission_instructions` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `settings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admission_sessions_code_unique` (`code`),
  KEY `admission_sessions_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `programs`;
CREATE TABLE `programs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('bs_degree','pharmacy_b','medical_diploma') COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_years` smallint(5) unsigned NOT NULL,
  `qualification_required` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `affiliation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `programs_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `session_programs`;
CREATE TABLE `session_programs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `admission_session_id` bigint(20) unsigned NOT NULL,
  `program_id` bigint(20) unsigned NOT NULL,
  `total_seats` int(10) unsigned NOT NULL,
  `seats_allocated` int(10) unsigned NOT NULL DEFAULT 0,
  `is_open` tinyint(1) NOT NULL DEFAULT 1,
  `test_required` tinyint(1) NOT NULL DEFAULT 1,
  `application_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reservation_validity_days` smallint(5) unsigned NOT NULL DEFAULT 5,
  `settings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_programs_admission_session_id_program_id_unique` (`admission_session_id`,`program_id`),
  KEY `session_programs_program_id_foreign` (`program_id`),
  CONSTRAINT `session_programs_admission_session_id_foreign` FOREIGN KEY (`admission_session_id`) REFERENCES `admission_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `session_programs_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `applications`;
CREATE TABLE `applications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `application_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `admission_session_id` bigint(20) unsigned NOT NULL,
  `session_program_id` bigint(20) unsigned NOT NULL,
  `roll_number` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `normalized_cnic` varchar(13) COLLATE utf8mb4_unicode_ci NOT NULL,
  `identity_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `potential_duplicate_detected` tinyint(1) NOT NULL DEFAULT 0,
  `duplicate_risk_notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('submitted','processing','completed','withdrawn','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitted',
  `verification_status` enum('pending','under_review','correction_required','verified','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `exam_eligibility_status` enum('locked','eligible','not_eligible','exempted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'locked',
  `exam_attempt_status` enum('not_started','pin_verified','in_progress','completed','absent','disqualified') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_started',
  `result_status` enum('pending','calculated','published') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `merit_status` enum('pending','compiled','published') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `selection_status` enum('unprocessed','selected','waiting_list','not_selected','seat_offered','admission_confirmed','offer_lapsed','declined') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unprocessed',
  `internal_remarks` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correction_notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verified_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applications_application_number_unique` (`application_number`),
  UNIQUE KEY `applications_roll_number_unique` (`roll_number`),
  UNIQUE KEY `unique_session_cnic` (`admission_session_id`,`normalized_cnic`),
  UNIQUE KEY `unique_session_user` (`admission_session_id`,`user_id`),
  KEY `applications_user_id_foreign` (`user_id`),
  KEY `applications_session_program_id_foreign` (`session_program_id`),
  KEY `applications_verified_by_user_id_foreign` (`verified_by_user_id`),
  KEY `applications_normalized_cnic_index` (`normalized_cnic`),
  KEY `applications_identity_hash_index` (`identity_hash`),
  KEY `applications_potential_duplicate_detected_index` (`potential_duplicate_detected`),
  KEY `applications_status_index` (`status`),
  KEY `applications_verification_status_index` (`verification_status`),
  KEY `applications_exam_eligibility_status_index` (`exam_eligibility_status`),
  KEY `applications_exam_attempt_status_index` (`exam_attempt_status`),
  KEY `applications_result_status_index` (`result_status`),
  KEY `applications_merit_status_index` (`merit_status`),
  KEY `applications_selection_status_index` (`selection_status`),
  KEY `idx_apps_prog_eligibility` (`session_program_id`,`exam_eligibility_status`),
  KEY `idx_apps_eligibility_roll` (`exam_eligibility_status`,`roll_number`),
  CONSTRAINT `applications_admission_session_id_foreign` FOREIGN KEY (`admission_session_id`) REFERENCES `admission_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_session_program_id_foreign` FOREIGN KEY (`session_program_id`) REFERENCES `session_programs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_verified_by_user_id_foreign` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `applicant_profiles`;
CREATE TABLE `applicant_profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `application_id` bigint(20) unsigned NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `father_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dob` date NOT NULL,
  `gender` enum('male','female') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnic` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile_number` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `whatsapp_number` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nationality` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pakistani',
  `domicile_district` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permanent_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applicant_profiles_application_id_unique` (`application_id`),
  KEY `idx_profiles_full_name` (`full_name`),
  KEY `idx_profiles_father_name` (`father_name`),
  KEY `idx_profiles_cnic` (`cnic`),
  KEY `idx_profiles_mobile` (`mobile_number`),
  CONSTRAINT `applicant_profiles_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `academic_records`;
CREATE TABLE `academic_records` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `application_id` bigint(20) unsigned NOT NULL,
  `level` enum('matric','intermediate','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `qualification_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `board_university` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roll_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passing_year` smallint(5) unsigned NOT NULL,
  `total_marks` decimal(6,2) NOT NULL,
  `obtained_marks` decimal(6,2) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `academic_records_application_id_foreign` (`application_id`),
  CONSTRAINT `academic_records_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `application_documents`;
CREATE TABLE `application_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `application_id` bigint(20) unsigned NOT NULL,
  `document_type` enum('passport_photo','cnic_front','cnic_back','domicile','matric_certificate','inter_certificate','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size_kb` int(10) unsigned NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verification_status` enum('pending','verified','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verified_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `application_documents_application_id_foreign` (`application_id`),
  KEY `application_documents_verified_by_user_id_foreign` (`verified_by_user_id`),
  CONSTRAINT `application_documents_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `application_documents_verified_by_user_id_foreign` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `application_status_histories`;
CREATE TABLE `application_status_histories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `application_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `from_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `application_status_histories_application_id_foreign` (`application_id`),
  KEY `application_status_histories_user_id_foreign` (`user_id`),
  CONSTRAINT `application_status_histories_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `application_status_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `examinations`;
CREATE TABLE `examinations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `admission_session_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shift` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Morning',
  `scheduled_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_minutes` smallint(5) unsigned NOT NULL DEFAULT 60,
  `total_questions` smallint(5) unsigned NOT NULL DEFAULT 60,
  `total_marks` decimal(6,2) NOT NULL DEFAULT 60.00,
  `passing_percentage` decimal(5,2) NOT NULL DEFAULT 50.00,
  `randomize_questions` tinyint(1) NOT NULL DEFAULT 1,
  `randomize_options` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('draft','scheduled','active','concluded','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `activated_at` timestamp NULL DEFAULT NULL,
  `concluded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `examinations_exam_code_unique` (`exam_code`),
  KEY `examinations_admission_session_id_foreign` (`admission_session_id`),
  KEY `examinations_status_index` (`status`),
  CONSTRAINT `examinations_admission_session_id_foreign` FOREIGN KEY (`admission_session_id`) REFERENCES `admission_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `examination_pins`;
CREATE TABLE `examination_pins` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `examination_id` bigint(20) unsigned NOT NULL,
  `pin_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_pin` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` smallint(5) unsigned NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `valid_from` timestamp NULL DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `created_by_user_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `examination_pins_examination_id_foreign` (`examination_id`),
  KEY `examination_pins_created_by_user_id_foreign` (`created_by_user_id`),
  KEY `examination_pins_is_active_index` (`is_active`),
  CONSTRAINT `examination_pins_created_by_user_id_foreign` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_pins_examination_id_foreign` FOREIGN KEY (`examination_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `examination_access_tokens`;
CREATE TABLE `examination_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `examination_id` bigint(20) unsigned NOT NULL,
  `application_id` bigint(20) unsigned NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `examination_access_tokens_token_unique` (`token`),
  KEY `examination_access_tokens_examination_id_foreign` (`examination_id`),
  KEY `examination_access_tokens_application_id_foreign` (`application_id`),
  CONSTRAINT `examination_access_tokens_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_access_tokens_examination_id_foreign` FOREIGN KEY (`examination_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `difficulty` enum('easy','medium','hard') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `marks` decimal(4,2) NOT NULL DEFAULT 1.00,
  `negative_marks` decimal(4,2) NOT NULL DEFAULT 0.00,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `explanation` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `questions_subject_index` (`subject`),
  KEY `questions_difficulty_index` (`difficulty`),
  KEY `questions_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `question_options`;
CREATE TABLE `question_options` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `question_id` bigint(20) unsigned NOT NULL,
  `label` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `question_options_question_id_foreign` (`question_id`),
  CONSTRAINT `question_options_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `examination_questions`;
CREATE TABLE `examination_questions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `examination_id` bigint(20) unsigned NOT NULL,
  `question_id` bigint(20) unsigned NOT NULL,
  `order_number` smallint(5) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `examination_questions_examination_id_question_id_unique` (`examination_id`,`question_id`),
  KEY `examination_questions_question_id_foreign` (`question_id`),
  CONSTRAINT `examination_questions_examination_id_foreign` FOREIGN KEY (`examination_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_questions_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `examination_attendances`;
CREATE TABLE `examination_attendances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `examination_id` bigint(20) unsigned NOT NULL,
  `application_id` bigint(20) unsigned NOT NULL,
  `roll_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attendance_status` enum('present','absent','barred') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'absent',
  `verified_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `room_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seat_label` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `examination_attendances_examination_id_application_id_unique` (`examination_id`,`application_id`),
  KEY `examination_attendances_application_id_foreign` (`application_id`),
  KEY `examination_attendances_verified_by_user_id_foreign` (`verified_by_user_id`),
  KEY `idx_attendance_exam_status` (`examination_id`,`attendance_status`),
  CONSTRAINT `examination_attendances_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_attendances_examination_id_foreign` FOREIGN KEY (`examination_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_attendances_verified_by_user_id_foreign` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `examination_attempts`;
CREATE TABLE `examination_attempts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `examination_id` bigint(20) unsigned NOT NULL,
  `application_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `status` enum('in_progress','submitted','timed_out','cancelled','disqualified') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'in_progress',
  `started_at` timestamp NOT NULL,
  `expires_at` timestamp NOT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disqualification_reason` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disqualified_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `disqualified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `examination_attempts_examination_id_application_id_unique` (`examination_id`,`application_id`),
  KEY `examination_attempts_application_id_foreign` (`application_id`),
  KEY `examination_attempts_user_id_foreign` (`user_id`),
  KEY `examination_attempts_disqualified_by_user_id_foreign` (`disqualified_by_user_id`),
  KEY `idx_attempts_exam_status` (`examination_id`,`status`),
  CONSTRAINT `examination_attempts_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_attempts_disqualified_by_user_id_foreign` FOREIGN KEY (`disqualified_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `examination_attempts_examination_id_foreign` FOREIGN KEY (`examination_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_attempts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `attempt_answers`;
CREATE TABLE `attempt_answers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `examination_attempt_id` bigint(20) unsigned NOT NULL,
  `question_id` bigint(20) unsigned NOT NULL,
  `selected_option_id` bigint(20) unsigned DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `marks_awarded` decimal(4,2) NOT NULL DEFAULT 0.00,
  `answered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attempt_answers_examination_attempt_id_question_id_unique` (`examination_attempt_id`,`question_id`),
  KEY `attempt_answers_question_id_foreign` (`question_id`),
  KEY `attempt_answers_selected_option_id_foreign` (`selected_option_id`),
  CONSTRAINT `attempt_answers_examination_attempt_id_foreign` FOREIGN KEY (`examination_attempt_id`) REFERENCES `examination_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attempt_answers_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attempt_answers_selected_option_id_foreign` FOREIGN KEY (`selected_option_id`) REFERENCES `question_options` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `examination_results`;
CREATE TABLE `examination_results` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `examination_id` bigint(20) unsigned NOT NULL,
  `application_id` bigint(20) unsigned NOT NULL,
  `examination_attempt_id` bigint(20) unsigned NOT NULL,
  `total_questions` smallint(5) unsigned NOT NULL,
  `attempted_questions` smallint(5) unsigned NOT NULL,
  `correct_answers` smallint(5) unsigned NOT NULL,
  `incorrect_answers` smallint(5) unsigned NOT NULL,
  `unanswered` smallint(5) unsigned NOT NULL,
  `total_marks` decimal(6,2) NOT NULL,
  `obtained_marks` decimal(6,2) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `is_passed` tinyint(1) NOT NULL,
  `status` enum('calculated','under_review','published','disqualified','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'calculated',
  `calculated_at` timestamp NOT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `examination_results_examination_id_application_id_unique` (`examination_id`,`application_id`),
  UNIQUE KEY `examination_results_examination_attempt_id_unique` (`examination_attempt_id`),
  KEY `examination_results_application_id_foreign` (`application_id`),
  KEY `idx_results_exam_marks` (`examination_id`,`obtained_marks`),
  CONSTRAINT `examination_results_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_results_examination_attempt_id_foreign` FOREIGN KEY (`examination_attempt_id`) REFERENCES `examination_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_results_examination_id_foreign` FOREIGN KEY (`examination_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `result_adjustments`;
CREATE TABLE `result_adjustments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `examination_result_id` bigint(20) unsigned NOT NULL,
  `adjusted_by_user_id` bigint(20) unsigned NOT NULL,
  `previous_marks` decimal(6,2) NOT NULL,
  `new_marks` decimal(6,2) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `approved_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `result_adjustments_examination_result_id_foreign` (`examination_result_id`),
  KEY `result_adjustments_adjusted_by_user_id_foreign` (`adjusted_by_user_id`),
  KEY `result_adjustments_approved_by_user_id_foreign` (`approved_by_user_id`),
  CONSTRAINT `result_adjustments_adjusted_by_user_id_foreign` FOREIGN KEY (`adjusted_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `result_adjustments_approved_by_user_id_foreign` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `result_adjustments_examination_result_id_foreign` FOREIGN KEY (`examination_result_id`) REFERENCES `examination_results` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `merit_formulas`;
CREATE TABLE `merit_formulas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `merit_formulas_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `merit_formula_components`;
CREATE TABLE `merit_formula_components` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `merit_formula_id` bigint(20) unsigned NOT NULL,
  `criterion` enum('matric','intermediate','entry_test','interview','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `weightage_percentage` decimal(5,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `merit_formula_components_merit_formula_id_foreign` (`merit_formula_id`),
  CONSTRAINT `merit_formula_components_merit_formula_id_foreign` FOREIGN KEY (`merit_formula_id`) REFERENCES `merit_formulas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `merit_lists`;
CREATE TABLE `merit_lists` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `admission_session_id` bigint(20) unsigned NOT NULL,
  `session_program_id` bigint(20) unsigned NOT NULL,
  `merit_formula_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `list_number` smallint(5) unsigned NOT NULL DEFAULT 1,
  `status` enum('draft','under_review','approved','published','locked') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `published_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `approved_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `integrity_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `merit_lists_admission_session_id_foreign` (`admission_session_id`),
  KEY `merit_lists_session_program_id_foreign` (`session_program_id`),
  KEY `merit_lists_merit_formula_id_foreign` (`merit_formula_id`),
  KEY `merit_lists_published_by_user_id_foreign` (`published_by_user_id`),
  KEY `merit_lists_approved_by_user_id_foreign` (`approved_by_user_id`),
  KEY `merit_lists_status_index` (`status`),
  CONSTRAINT `merit_lists_admission_session_id_foreign` FOREIGN KEY (`admission_session_id`) REFERENCES `admission_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `merit_lists_approved_by_user_id_foreign` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `merit_lists_merit_formula_id_foreign` FOREIGN KEY (`merit_formula_id`) REFERENCES `merit_formulas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `merit_lists_published_by_user_id_foreign` FOREIGN KEY (`published_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `merit_lists_session_program_id_foreign` FOREIGN KEY (`session_program_id`) REFERENCES `session_programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `merit_list_items`;
CREATE TABLE `merit_list_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `merit_list_id` bigint(20) unsigned NOT NULL,
  `application_id` bigint(20) unsigned NOT NULL,
  `rank` int(10) unsigned NOT NULL,
  `matric_percentage` decimal(5,2) DEFAULT NULL,
  `inter_percentage` decimal(5,2) DEFAULT NULL,
  `test_percentage` decimal(5,2) DEFAULT NULL,
  `aggregate_percentage` decimal(5,2) NOT NULL,
  `status` enum('selected','waiting_list','not_selected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'selected',
  `remarks` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `merit_list_items_merit_list_id_application_id_unique` (`merit_list_id`,`application_id`),
  KEY `merit_list_items_application_id_foreign` (`application_id`),
  KEY `merit_list_items_status_index` (`status`),
  KEY `idx_merit_list_rank` (`merit_list_id`,`rank`),
  CONSTRAINT `merit_list_items_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `merit_list_items_merit_list_id_foreign` FOREIGN KEY (`merit_list_id`) REFERENCES `merit_lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `seat_allocations`;
CREATE TABLE `seat_allocations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `admission_session_id` bigint(20) unsigned NOT NULL,
  `session_program_id` bigint(20) unsigned NOT NULL,
  `application_id` bigint(20) unsigned NOT NULL,
  `merit_list_item_id` bigint(20) unsigned DEFAULT NULL,
  `seat_number` int(10) unsigned NOT NULL,
  `status` enum('offered','reserved','confirmed','released','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'offered',
  `offer_extended_at` timestamp NULL DEFAULT NULL,
  `reservation_expires_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `confirmed_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `released_at` timestamp NULL DEFAULT NULL,
  `release_reason` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allocated_by_user_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `seat_allocations_admission_session_id_foreign` (`admission_session_id`),
  KEY `seat_allocations_session_program_id_foreign` (`session_program_id`),
  KEY `seat_allocations_application_id_foreign` (`application_id`),
  KEY `seat_allocations_merit_list_item_id_foreign` (`merit_list_item_id`),
  KEY `seat_allocations_confirmed_by_user_id_foreign` (`confirmed_by_user_id`),
  KEY `seat_allocations_allocated_by_user_id_foreign` (`allocated_by_user_id`),
  KEY `idx_seats_program_status` (`session_program_id`,`status`),
  CONSTRAINT `seat_allocations_admission_session_id_foreign` FOREIGN KEY (`admission_session_id`) REFERENCES `admission_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `seat_allocations_allocated_by_user_id_foreign` FOREIGN KEY (`allocated_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `seat_allocations_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `seat_allocations_confirmed_by_user_id_foreign` FOREIGN KEY (`confirmed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `seat_allocations_merit_list_item_id_foreign` FOREIGN KEY (`merit_list_item_id`) REFERENCES `merit_list_items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `seat_allocations_session_program_id_foreign` FOREIGN KEY (`session_program_id`) REFERENCES `session_programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `group` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- SEED DATA
-- ========================================================
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_01_01_000010_create_roles_and_permissions_tables', 1),
(5, '2026_01_01_000020_create_admission_sessions_and_programs_tables', 1),
(6, '2026_01_01_000030_create_applications_and_documents_tables', 1),
(7, '2026_01_01_000040_create_examinations_and_pins_tables', 1),
(8, '2026_01_01_000050_create_examination_attempts_and_results_tables', 1),
(9, '2026_01_01_000060_create_merit_and_seat_allocations_tables', 1),
(10, '2026_01_01_000070_create_system_settings_and_audit_logs_tables', 1),
(11, '2026_11_03_050238_add_display_pin_and_shift', 1),
(12, '2026_11_03_073003_add_disqualified_to_exam_statuses', 1),
(13, '2026_11_04_000001_release_deleted_admission_session_codes', 1),
(14, '2026_11_04_103600_add_performance_and_scaling_indexes', 1),
(15, '2026_11_05_000001_add_closing_time_to_admission_sessions_table', 1);

INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'super_admin', 'Super Administrator', 'Complete institutional access across all modules.', NOW(), NOW()),
(2, 'management', 'Principal / College Management', 'Executive dashboards, reports, and high-level approvals.', NOW(), NOW()),
(3, 'hod', 'Head of Department (HOD)', 'Academic programs, exam settings, question bank, passing criteria, and merit approval.', NOW(), NOW()),
(4, 'admission_officer', 'Admission Officer', 'Application processing, document verification, and seat allocation assistance.', NOW(), NOW()),
(5, 'document_verifier', 'Document Verifier', 'Specialized document checking and correction requests.', NOW(), NOW()),
(6, 'exam_manager', 'Examination Manager', 'Question bank management, exam scheduling, and result preparation.', NOW(), NOW()),
(7, 'invigilator', 'Campus Invigilator', 'Physical room supervision and candidate attendance verification.', NOW(), NOW()),
(8, 'student', 'Student / Applicant', 'Personal application, documents, admit card, test taking, and scorecard.', NOW(), NOW());

INSERT INTO `permissions` (`id`, `name`, `group`, `display_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'view_applications', 'admission', 'View Admission Applications', NULL, NOW(), NOW()),
(2, 'verify_applications', 'admission', 'Verify Admission Applications and Documents', NULL, NOW(), NOW()),
(3, 'manage_eligibility', 'admission', 'Mark Candidates Eligible for Test', NULL, NOW(), NOW()),
(4, 'export_applications', 'admission', 'Export Application Reports and Lists', NULL, NOW(), NOW()),
(5, 'manage_programs', 'programs', 'Create and Edit Academic Programs', NULL, NOW(), NOW()),
(6, 'manage_sessions', 'programs', 'Configure Admission Sessions and Quotas', NULL, NOW(), NOW()),
(7, 'manage_exams', 'examination', 'Create and Configure Examinations', NULL, NOW(), NOW()),
(8, 'manage_pins', 'examination', 'Generate, Rotate and Manage Examination PINs', NULL, NOW(), NOW()),
(9, 'manage_questions', 'examination', 'Create and Edit Question Bank Questions', NULL, NOW(), NOW()),
(10, 'activate_exams', 'examination', 'Open and Close Active Examination Windows', NULL, NOW(), NOW()),
(11, 'manage_attendance', 'invigilation', 'Verify Physical Candidate Campus Attendance', NULL, NOW(), NOW()),
(12, 'monitor_exams', 'invigilation', 'Live Monitor Active Examination Rooms', NULL, NOW(), NOW()),
(13, 'calculate_results', 'results_merit', 'Calculate Examination Results', NULL, NOW(), NOW()),
(14, 'adjust_marks', 'results_merit', 'Make Audited Score Adjustments', NULL, NOW(), NOW()),
(15, 'publish_results', 'results_merit', 'Formally Publish Examination Results', NULL, NOW(), NOW()),
(16, 'configure_merit', 'results_merit', 'Define Dynamic Program Merit Formulas', NULL, NOW(), NOW()),
(17, 'publish_merit', 'results_merit', 'Approve and Publish Program Merit Lists', NULL, NOW(), NOW()),
(18, 'allocate_seats', 'seat_allocation', 'Reserve and Confirm Program Seats', NULL, NOW(), NOW()),
(19, 'release_seats', 'seat_allocation', 'Release Expired Reservations and Promote Waiting List', NULL, NOW(), NOW()),
(20, 'manage_settings', 'settings', 'Configure College Settings and WhatsApp Links', NULL, NOW(), NOW()),
(21, 'view_audit_logs', 'settings', 'View System Security and Audit Logs', NULL, NOW(), NOW());

INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(1, 2),
(4, 2),
(6, 2),
(10, 2),
(15, 2),
(17, 2),
(18, 2),
(21, 2),
(1, 3),
(7, 3),
(8, 3),
(9, 3),
(10, 3),
(13, 3),
(14, 3),
(15, 3),
(16, 3),
(17, 3),
(1, 4),
(2, 4),
(3, 4),
(4, 4),
(18, 4),
(19, 4),
(1, 5),
(2, 5),
(7, 6),
(8, 6),
(9, 6),
(10, 6),
(13, 6),
(11, 7),
(12, 7);


INSERT INTO `users` (`id`, `name`, `email`, `cnic`, `phone`, `avatar`, `email_verified_at`, `password`, `is_active`, `must_change_password`, `created_at`, `updated_at`) VALUES
(1, 'BCMT System Administrator', 'admin@bcmt.edu.pk', '1110100000001', '0928-622699', NULL, NOW(), '$2y$12$jS703b0K46aF0R39XmXg6eO2K6J0o8QcQoK.0sF0O8hD9J8bK7k8O', 1, 1, NOW(), NOW()),
(2, 'Prof. Dr. Academic HOD', 'hod@bcmt.edu.pk', '1110100000002', '0334-0580180', NULL, NOW(), '$2y$12$jS703b0K46aF0R39XmXg6eO2K6J0o8QcQoK.0sF0O8hD9J8bK7k8O', 1, 1, NOW(), NOW()),
(3, 'Admission Processing Officer', 'admission@bcmt.edu.pk', '1110100000003', '0928-622699', NULL, NOW(), '$2y$12$jS703b0K46aF0R39XmXg6eO2K6J0o8QcQoK.0sF0O8hD9J8bK7k8O', 1, 1, NOW(), NOW()),
(4, 'Campus Exam Invigilator', 'invigilator@bcmt.edu.pk', '1110100000004', '0334-0580180', NULL, NOW(), '$2y$12$jS703b0K46aF0R39XmXg6eO2K6J0o8QcQoK.0sF0O8hD9J8bK7k8O', 1, 1, NOW(), NOW());

INSERT INTO `role_user` (`role_id`, `user_id`) VALUES
(1, 1),
(3, 2),
(4, 3),
(7, 4);

INSERT INTO `programs` (`id`, `name`, `code`, `category`, `duration_years`, `qualification_required`, `affiliation`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BS Emergency Care Technology (ECT)', 'BSECT', 'bs_degree', 4, 'Intermediate Pass', 'Khyber Medical University (KMU)', 'Four-year degree program in Emergency Care and Health Technology affiliated with Khyber Medical University (KMU).', 1, NOW(), NOW()),
(2, 'BS Medical Laboratory Technology (MLT)', 'BSMLT', 'bs_degree', 4, 'Intermediate Pass', 'Khyber Medical University (KMU)', 'Four-year degree program in Medical Laboratory Technology affiliated with Khyber Medical University (KMU).', 1, NOW(), NOW()),
(3, 'Pharmacy Category B', 'PCB', 'pharmacy_b', 2, 'Matric Pass', 'Pharmacy Council of Pakistan', 'Two-year pharmacy diploma program accredited by the Pharmacy Council of Pakistan.', 1, NOW(), NOW()),
(4, 'Health Technology', 'HT', 'medical_diploma', 2, 'Matric Pass', 'KPK Medical Faculty (FPAHS)', 'Two-year diploma program in Health Technology affiliated with Khyber Pakhtunkhwa Medical Faculty.', 1, NOW(), NOW()),
(5, 'Pathology', 'PATH', 'medical_diploma', 2, 'Matric Pass', 'KPK Medical Faculty (FPAHS)', 'Two-year diploma program in Pathology Technology affiliated with Khyber Pakhtunkhwa Medical Faculty.', 1, NOW(), NOW()),
(6, 'Surgical', 'SURG', 'medical_diploma', 2, 'Matric Pass', 'KPK Medical Faculty (FPAHS)', 'Two-year diploma program in Surgical & Operation Theater Technology affiliated with KPK Medical Faculty.', 1, NOW(), NOW()),
(7, 'Anaesthesia', 'ANES', 'medical_diploma', 2, 'Matric Pass', 'KPK Medical Faculty (FPAHS)', 'Two-year diploma program in Anaesthesia Technology affiliated with Khyber Pakhtunkhwa Medical Faculty.', 1, NOW(), NOW()),
(8, 'Pharmacy Diploma', 'PHARMA', 'medical_diploma', 2, 'Matric Pass', 'KPK Medical Faculty (FPAHS)', 'Two-year pharmacy technician diploma program affiliated with Khyber Pakhtunkhwa Medical Faculty.', 1, NOW(), NOW()),
(9, 'Radiology', 'RADIO', 'medical_diploma', 2, 'Matric Pass', 'KPK Medical Faculty (FPAHS)', 'Two-year diploma program in Radiology & Medical Imaging Technology affiliated with KPK Medical Faculty.', 1, NOW(), NOW());


INSERT INTO `admission_sessions` (`id`, `name`, `code`, `start_date`, `closing_date`, `closing_time`, `status`, `is_active`, `admission_instructions`, `settings`, `created_at`, `updated_at`) VALUES
(1, 'Admission Session 2026-2027', '2026-2027', '2026-01-01', '2026-12-31', '23:59', 'open', 1, 'Welcome to Bannu College of Medical Technologies (BCMT). Please complete all 5 steps of the online admission form accurately. Male and female candidates compete for combined merit seats.', '{"allow_reupload_on_correction": true, "max_document_size_kb": 2048}', NOW(), NOW());

INSERT INTO `session_programs` (`id`, `admission_session_id`, `program_id`, `total_seats`, `seats_allocated`, `is_open`, `test_required`, `application_fee`, `reservation_validity_days`, `settings`, `created_at`, `updated_at`) VALUES
(NULL, 1, 1, 20, 0, 1, 1, 1000.00, 5, NULL, NOW(), NOW()),
(NULL, 1, 2, 30, 0, 1, 1, 1000.00, 5, NULL, NOW(), NOW()),
(NULL, 1, 3, 100, 0, 1, 1, 1000.00, 5, NULL, NOW(), NOW()),
(NULL, 1, 4, 20, 0, 1, 1, 1000.00, 5, NULL, NOW(), NOW()),
(NULL, 1, 5, 10, 0, 1, 1, 1000.00, 5, NULL, NOW(), NOW()),
(NULL, 1, 6, 5, 0, 1, 1, 1000.00, 5, NULL, NOW(), NOW()),
(NULL, 1, 7, 5, 0, 1, 1, 1000.00, 5, NULL, NOW(), NOW()),
(NULL, 1, 8, 5, 0, 1, 1, 1000.00, 5, NULL, NOW(), NOW()),
(NULL, 1, 9, 5, 0, 1, 1, 1000.00, 5, NULL, NOW(), NOW());

INSERT INTO `system_settings` (`id`, `key`, `value`, `group`, `description`, `created_at`, `updated_at`) VALUES
(NULL, 'college_name', 'Bannu College of Medical Technologies', 'general', 'Institutional College Name', NOW(), NOW()),
(NULL, 'college_short_name', 'BCMT', 'general', 'Institutional Acronym', NOW(), NOW()),
(NULL, 'tagline', 'The Home of Quality Education', 'general', 'Official College Tagline', NOW(), NOW()),
(NULL, 'campus_address', 'Circular Road near Hira School, Sokari Gate, Bannu, Khyber Pakhtunkhwa', 'general', 'Official Campus Physical Address', NOW(), NOW()),
(NULL, 'official_phone', '0928-622699', 'general', 'Campus Landline Support Phone', NOW(), NOW()),
(NULL, 'official_mobile', '0334-0580180', 'general', 'Campus Mobile Helpline', NOW(), NOW()),
(NULL, 'official_email', 'bcmts1122@gmail.com', 'general', 'Official Contact Email', NOW(), NOW()),
(NULL, 'official_website', 'https://bcmtkpk.wordpress.com', 'general', 'Official Web Portal', NOW(), NOW()),
(NULL, 'whatsapp_community_enabled', '1', 'general', 'WhatsApp Community Group Toggle', NOW(), NOW()),
(NULL, 'whatsapp_community_url', 'https://chat.whatsapp.com/invite/BCMTAdmission2026', 'general', 'WhatsApp Official Group Link', NOW(), NOW()),
(NULL, 'whatsapp_support_enabled', '1', 'general', 'WhatsApp Direct Chat Support Toggle', NOW(), NOW()),
(NULL, 'whatsapp_support_phone', '923340580180', 'general', 'WhatsApp Official Support Mobile', NOW(), NOW()),
(NULL, 'whatsapp_support_message', 'Hello BCMT Admission Support, I have an inquiry regarding admission applications.', 'general', 'Default WhatsApp Inquiry Message', NOW(), NOW()),
(NULL, 'admission_open_status', '1', 'general', 'Global Admission Application Intake Switch', NOW(), NOW()),
(NULL, 'admission_closed_notice', 'Online admissions for the current session are currently closed. Please contact the admission office for announcements.', 'general', 'Notice Displayed When Admissions Closed', NOW(), NOW()),
(NULL, 'exam_instructions', '1. Report to the assigned exam room 30 minutes before test commencement.\n2. Present your original CNIC/B-Form and printed BCMT Roll Number Slip.\n3. The room invigilator will verify your attendance.\n4. Enter the test-wise Common PIN announced by the invigilator.\n5. You will have 60 minutes to complete the test.', 'general', 'Candidate Computer-Based Test Guidelines', NOW(), NOW());

SET FOREIGN_KEY_CHECKS=1;