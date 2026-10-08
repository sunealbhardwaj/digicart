-- ========================================================
-- ApexDigital Marketplace Database Schema
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- Hostinger Database: u328293805_7R01z
-- Hostinger User: u328293805_mn6Ce
-- ========================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(120) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `features` TEXT DEFAULT NULL, -- JSON string or comma-separated
  `regular_price` DECIMAL(10, 2) NOT NULL DEFAULT 1999.00,
  `sale_price` DECIMAL(10, 2) NOT NULL DEFAULT 149.00,
  `badges` TEXT DEFAULT NULL, -- JSON string or comma-separated
  `delivery_link` VARCHAR(500) NOT NULL DEFAULT '',
  `file_size` VARCHAR(50) DEFAULT '10.0 GB',
  `file_format` VARCHAR(100) DEFAULT 'ZIP / PSD',
  `rating` DECIMAL(3, 1) DEFAULT 4.9,
  `review_count` INT DEFAULT 120,
  `sales_count` INT DEFAULT 500,
  `mockup_theme` VARCHAR(50) DEFAULT 'amber',
  `image_url` TEXT DEFAULT NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `items` TEXT NOT NULL, -- JSON string of cart items
  `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `applied_coupon` VARCHAR(64) DEFAULT NULL,
  `currency` VARCHAR(10) DEFAULT 'INR',
  `payment_method` VARCHAR(100) DEFAULT 'UPI / GPay',
  `status` VARCHAR(50) DEFAULT 'DELIVERED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create Coupons Table
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `code` VARCHAR(64) NOT NULL UNIQUE,
  `discount_percentage` INT NOT NULL DEFAULT 20,
  `min_spend` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Store Settings Table
CREATE TABLE IF NOT EXISTS `store_settings` (
  `id` INT NOT NULL PRIMARY KEY DEFAULT 1,
  `announcement_text` VARCHAR(500) NOT NULL DEFAULT '⚡ Flash Sale: Flat ₹149 All Mega Bundles Today Only! Limited Time Access.',
  `announcement_active` TINYINT(1) DEFAULT 1,
  `countdown_active` TINYINT(1) DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Seed Initial Settings & Coupons
-- ========================================================
INSERT INTO `store_settings` (`id`, `announcement_text`, `announcement_active`, `countdown_active`)
VALUES (1, '⚡ Flash Sale: Flat ₹149 All Mega Bundles Today Only! Limited Time Access.', 1, 1)
ON DUPLICATE KEY UPDATE `announcement_text` = VALUES(`announcement_text`);

INSERT IGNORE INTO `coupons` (`id`, `code`, `discount_percentage`, `min_spend`, `is_active`) VALUES
('coup-01', 'CREATOR70', 20, 0.00, 1),
('coup-02', 'MEGA80', 30, 299.00, 1),
('coup-03', 'FLAT149', 15, 0.00, 1);
