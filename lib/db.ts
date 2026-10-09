import mysql, { Pool } from 'mysql2/promise';
import { Product, Order, Coupon, StoreSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_SETTINGS } from './initialData';

let pool: Pool | null = null;
let tablesInitialized = false;

export interface DbStatus {
  connected: boolean;
  database: string;
  user: string;
  host: string;
  port: number;
  tablesReady: boolean;
  error?: string;
  advice?: string;
}

export function getDbConfig() {
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'u328293805_7R01z',
    user: process.env.MYSQL_USER || 'u328293805_mn6Ce',
    password: process.env.MYSQL_PASSWORD || '',
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 5000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

/**
 * Determine if MySQL is properly configured with an external/remote host and password.
 * When running in cloud containers without a local MySQL server or without a password,
 * we gracefully return false so we don't attempt connecting to 127.0.0.1:3306 (which yields ECONNREFUSED).
 */
export function isDbConfigured(): boolean {
  const host = process.env.MYSQL_HOST;
  const password = process.env.MYSQL_PASSWORD;

  // If host is absent, or points to localhost/127.0.0.1 in cloud environment,
  // or password is empty, MySQL is not available.
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return false;
  }
  if (!password || password.trim() === '') {
    return false;
  }
  return true;
}

export function getPool(): Pool | null {
  if (!isDbConfigured()) {
    return null;
  }
  if (pool) return pool;

  const config = getDbConfig();
  try {
    pool = mysql.createPool(config);
    return pool;
  } catch {
    return null;
  }
}

// Auto-create required tables if not already present
export async function ensureTablesExist(): Promise<boolean> {
  if (tablesInitialized) return true;
  if (!isDbConfigured()) return false;

  const p = getPool();
  if (!p) return false;

  try {
    const conn = await p.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`products\` (
          \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
          \`name\` VARCHAR(255) NOT NULL,
          \`slug\` VARCHAR(255) DEFAULT NULL,
          \`category\` VARCHAR(120) NOT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`features\` TEXT DEFAULT NULL,
          \`regular_price\` DECIMAL(10, 2) NOT NULL DEFAULT 1999.00,
          \`sale_price\` DECIMAL(10, 2) NOT NULL DEFAULT 149.00,
          \`badges\` TEXT DEFAULT NULL,
          \`delivery_link\` VARCHAR(500) NOT NULL DEFAULT '',
          \`file_size\` VARCHAR(50) DEFAULT '10.0 GB',
          \`file_format\` VARCHAR(100) DEFAULT 'ZIP / PSD',
          \`rating\` DECIMAL(3, 1) DEFAULT 4.9,
          \`review_count\` INT DEFAULT 120,
          \`sales_count\` INT DEFAULT 500,
          \`mockup_theme\` VARCHAR(50) DEFAULT 'amber',
          \`image_url\` TEXT DEFAULT NULL,
          \`meta_keywords\` TEXT DEFAULT NULL,
          \`is_featured\` TINYINT(1) DEFAULT 0,
          \`is_active\` TINYINT(1) DEFAULT 1,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`orders\` (
          \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
          \`customer_name\` VARCHAR(255) NOT NULL,
          \`customer_email\` VARCHAR(255) NOT NULL,
          \`items\` TEXT NOT NULL,
          \`subtotal\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          \`discount_amount\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          \`total\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          \`applied_coupon\` VARCHAR(64) DEFAULT NULL,
          \`currency\` VARCHAR(10) DEFAULT 'INR',
          \`payment_method\` VARCHAR(100) DEFAULT 'UPI / GPay',
          \`status\` VARCHAR(50) DEFAULT 'DELIVERED',
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`coupons\` (
          \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
          \`code\` VARCHAR(64) NOT NULL UNIQUE,
          \`discount_percentage\` INT NOT NULL DEFAULT 20,
          \`min_spend\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          \`is_active\` TINYINT(1) DEFAULT 1,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`store_settings\` (
          \`id\` INT NOT NULL PRIMARY KEY DEFAULT 1,
          \`announcement_text\` VARCHAR(500) NOT NULL DEFAULT '⚡ Flash Sale: Flat ₹149 All Mega Bundles Today Only!',
          \`announcement_active\` TINYINT(1) DEFAULT 1,
          \`countdown_active\` TINYINT(1) DEFAULT 1,
          \`maintenance_mode\` TINYINT(1) DEFAULT 1,
          \`maintenance_message\` TEXT DEFAULT NULL,
          \`maintenance_estimated_end_time\` VARCHAR(255) DEFAULT NULL,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Ensure maintenance mode columns exist on existing store_settings table
      try {
        await conn.query('ALTER TABLE `store_settings` ADD COLUMN `maintenance_mode` TINYINT(1) DEFAULT 1');
      } catch {
        // column already exists
      }
      try {
        await conn.query('ALTER TABLE `store_settings` ADD COLUMN `maintenance_message` TEXT DEFAULT NULL');
      } catch {
        // column already exists
      }
      try {
        await conn.query('ALTER TABLE `store_settings` ADD COLUMN `maintenance_estimated_end_time` VARCHAR(255) DEFAULT NULL');
      } catch {
        // column already exists
      }

      // Ensure meta_keywords column exists on existing products table
      try {
        await conn.query('ALTER TABLE `products` ADD COLUMN `meta_keywords` TEXT DEFAULT NULL');
      } catch {
        // column already exists
      }

      // Check if products table is empty, seed if empty
      const [rows]: [any[], any] = await conn.query('SELECT COUNT(*) as cnt FROM `products`');
      if (rows && rows[0] && rows[0].cnt === 0) {
        for (const prod of INITIAL_PRODUCTS) {
          await conn.query(
            `INSERT IGNORE INTO \`products\` (
              id, name, slug, category, description, features, regular_price, sale_price, badges,
              delivery_link, file_size, file_format, rating, review_count, sales_count,
              mockup_theme, image_url, is_featured, is_active, meta_keywords
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              prod.id,
              prod.name,
              prod.slug,
              prod.category,
              prod.description,
              JSON.stringify(prod.features),
              prod.regularPrice,
              prod.salePrice,
              JSON.stringify(prod.badges),
              prod.deliveryLink,
              prod.fileSize,
              prod.fileFormat,
              prod.rating,
              prod.reviewCount,
              prod.salesCount,
              prod.mockupTheme,
              prod.imageUrl || '',
              prod.isFeatured ? 1 : 0,
              prod.isActive ? 1 : 0,
              JSON.stringify(prod.metaKeywords || []),
            ]
          );
        }
      }

      // Check store settings
      const [settingsRows]: [any[], any] = await conn.query('SELECT COUNT(*) as cnt FROM `store_settings`');
      if (settingsRows && settingsRows[0] && settingsRows[0].cnt === 0) {
        await conn.query(
          `INSERT INTO \`store_settings\` (id, announcement_text, announcement_active, countdown_active)
           VALUES (1, ?, 1, 1)`,
          [INITIAL_SETTINGS.announcementText]
        );
      }

      // Check coupons
      const [couponRows]: [any[], any] = await conn.query('SELECT COUNT(*) as cnt FROM `coupons`');
      if (couponRows && couponRows[0] && couponRows[0].cnt === 0) {
        for (const coup of INITIAL_COUPONS) {
          await conn.query(
            `INSERT IGNORE INTO \`coupons\` (id, code, discount_percentage, min_spend, is_active)
             VALUES (?, ?, ?, ?, ?)`,
            [coup.id, coup.code, coup.discountPercentage, coup.minSpend || 0, coup.isActive ? 1 : 0]
          );
        }
      }

      tablesInitialized = true;
      return true;
    } finally {
      conn.release();
    }
  } catch {
    return false;
  }
}

// Diagnostic connection test
export async function testDbConnection(): Promise<DbStatus> {
  const config = getDbConfig();

  if (!isDbConfigured()) {
    const reason = !config.password
      ? 'MYSQL_PASSWORD is not configured.'
      : `MYSQL_HOST is currently '${config.host}' (localhost). External MySQL requires a remote host IP or domain.`;

    return {
      connected: false,
      database: config.database,
      user: config.user,
      host: config.host,
      port: config.port,
      tablesReady: false,
      error: `Remote MySQL not configured (${reason})`,
      advice:
        'Store is running seamlessly with high-speed in-memory & local storage persistence. To connect Hostinger MySQL, set MYSQL_HOST (Remote MySQL IP/domain) and MYSQL_PASSWORD in environment settings.',
    };
  }

  const p = getPool();
  if (!p) {
    return {
      connected: false,
      database: config.database,
      user: config.user,
      host: config.host,
      port: config.port,
      tablesReady: false,
      error: 'Could not create connection pool.',
      advice: 'Verify MySQL connection credentials.',
    };
  }

  try {
    const conn = await p.getConnection();
    try {
      await conn.query('SELECT 1 + 1 as solution');
      const tablesOk = await ensureTablesExist();
      return {
        connected: true,
        database: config.database,
        user: config.user,
        host: config.host,
        port: config.port,
        tablesReady: tablesOk,
      };
    } finally {
      conn.release();
    }
  } catch (err: any) {
    let advice = 'Check that your remote MySQL server is running and accessible.';
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      advice = `Password or user '${config.user}' is incorrect for database '${config.database}'. In Hostinger hPanel, verify MySQL User password.`;
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      advice = `Hostinger / Remote MySQL firewall is blocking connections to '${config.host}'. In Hostinger hPanel -> Databases -> Remote MySQL, allow '%' or this server IP.`;
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      advice = `Database '${config.database}' was not found. Please verify the database exists in your hosting panel.`;
    }

    return {
      connected: false,
      database: config.database,
      user: config.user,
      host: config.host,
      port: config.port,
      tablesReady: false,
      error: err.message || String(err),
      advice,
    };
  }
}

// Fetch products from MySQL
export async function getDbProducts(): Promise<Product[] | null> {
  if (!isDbConfigured()) return null;
  const p = getPool();
  if (!p) return null;

  try {
    await ensureTablesExist();
    const [rows]: [any[], any] = await p.query(
      'SELECT * FROM `products` ORDER BY `created_at` DESC'
    );
    if (!rows || rows.length === 0) return null;

    return rows.map((r) => {
      let features: string[] = [];
      let badges: string[] = [];
      let metaKeywords: string[] = [];
      try {
        features = typeof r.features === 'string' ? JSON.parse(r.features) : r.features || [];
      } catch {
        features = r.features ? r.features.split('\n') : [];
      }
      try {
        badges = typeof r.badges === 'string' ? JSON.parse(r.badges) : r.badges || [];
      } catch {
        badges = r.badges ? r.badges.split(',') : [];
      }
      try {
        metaKeywords =
          typeof r.meta_keywords === 'string'
            ? JSON.parse(r.meta_keywords)
            : r.meta_keywords || [];
      } catch {
        metaKeywords = r.meta_keywords
          ? r.meta_keywords
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];
      }

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        category: r.category,
        description: r.description || '',
        features,
        regularPrice: Number(r.regular_price) || 1999,
        salePrice: Number(r.sale_price) || 149,
        badges,
        deliveryLink: r.delivery_link || '',
        fileSize: r.file_size || '10.0 GB',
        fileFormat: r.file_format || 'ZIP',
        rating: Number(r.rating) || 4.9,
        reviewCount: Number(r.review_count) || 100,
        salesCount: Number(r.sales_count) || 200,
        mockupTheme: r.mockup_theme || 'amber',
        imageUrl: r.image_url || '',
        metaKeywords: Array.isArray(metaKeywords) ? metaKeywords : [],
        isFeatured: Boolean(r.is_featured),
        isActive: Boolean(r.is_active),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    });
  } catch {
    return null;
  }
}

// Save or Update Product in MySQL
export async function saveDbProduct(product: Product): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const p = getPool();
  if (!p) return false;

  try {
    await ensureTablesExist();
    await p.query(
      `INSERT INTO \`products\` (
        id, name, slug, category, description, features, regular_price, sale_price, badges,
        delivery_link, file_size, file_format, rating, review_count, sales_count,
        mockup_theme, image_url, is_featured, is_active, meta_keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        slug = VALUES(slug),
        category = VALUES(category),
        description = VALUES(description),
        features = VALUES(features),
        regular_price = VALUES(regular_price),
        sale_price = VALUES(sale_price),
        badges = VALUES(badges),
        delivery_link = VALUES(delivery_link),
        file_size = VALUES(file_size),
        file_format = VALUES(file_format),
        rating = VALUES(rating),
        review_count = VALUES(review_count),
        sales_count = VALUES(sales_count),
        mockup_theme = VALUES(mockup_theme),
        image_url = VALUES(image_url),
        is_featured = VALUES(is_featured),
        is_active = VALUES(is_active),
        meta_keywords = VALUES(meta_keywords)`,
      [
        product.id,
        product.name,
        product.slug || '',
        product.category,
        product.description,
        JSON.stringify(product.features),
        product.regularPrice,
        product.salePrice,
        JSON.stringify(product.badges),
        product.deliveryLink,
        product.fileSize,
        product.fileFormat,
        product.rating,
        product.reviewCount,
        product.salesCount,
        product.mockupTheme,
        product.imageUrl || '',
        product.isFeatured ? 1 : 0,
        product.isActive ? 1 : 0,
        JSON.stringify(product.metaKeywords || []),
      ]
    );
    return true;
  } catch {
    return false;
  }
}

// Delete Product in MySQL
export async function deleteDbProduct(productId: string): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const p = getPool();
  if (!p) return false;

  try {
    await p.query('DELETE FROM `products` WHERE `id` = ?', [productId]);
    return true;
  } catch {
    return false;
  }
}

// Orders in MySQL
export async function getDbOrders(): Promise<Order[] | null> {
  if (!isDbConfigured()) return null;
  const p = getPool();
  if (!p) return null;

  try {
    await ensureTablesExist();
    const [rows]: [any[], any] = await p.query(
      'SELECT * FROM `orders` ORDER BY `created_at` DESC'
    );
    if (!rows) return null;

    return rows.map((r) => {
      let items: any[] = [];
      try {
        items = typeof r.items === 'string' ? JSON.parse(r.items) : r.items || [];
      } catch {
        items = [];
      }
      return {
        id: r.id,
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        items,
        subtotal: Number(r.subtotal) || 0,
        discountAmount: Number(r.discount_amount) || 0,
        total: Number(r.total) || 0,
        appliedCoupon: r.applied_coupon,
        currency: r.currency || 'INR',
        paymentMethod: r.payment_method || 'UPI / GPay',
        status: r.status || 'DELIVERED',
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });
  } catch {
    return null;
  }
}

export async function saveDbOrder(order: Order): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const p = getPool();
  if (!p) return false;

  try {
    await ensureTablesExist();
    await p.query(
      `INSERT INTO \`orders\` (
        id, customer_name, customer_email, items, subtotal, discount_amount, total,
        applied_coupon, currency, payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.customerName,
        order.customerEmail,
        JSON.stringify(order.items),
        order.subtotal,
        order.discountAmount,
        order.total,
        order.appliedCoupon || null,
        order.currency || 'INR',
        order.paymentMethod,
        order.status,
      ]
    );
    return true;
  } catch {
    return false;
  }
}

// Settings in MySQL
export async function getDbSettings(): Promise<StoreSettings | null> {
  if (!isDbConfigured()) return null;
  const p = getPool();
  if (!p) return null;

  try {
    await ensureTablesExist();
    const [rows]: [any[], any] = await p.query(
      'SELECT * FROM `store_settings` WHERE `id` = 1 LIMIT 1'
    );
    if (!rows || rows.length === 0) return null;

    const r = rows[0];
    return {
      ...INITIAL_SETTINGS,
      announcementText: r.announcement_text,
      announcementActive: Boolean(r.announcement_active),
      countdownActive: Boolean(r.countdown_active),
      maintenanceMode: r.maintenance_mode !== undefined && r.maintenance_mode !== null ? Boolean(r.maintenance_mode) : true,
      maintenanceMessage: r.maintenance_message || INITIAL_SETTINGS.maintenanceMessage,
      maintenanceEstimatedEndTime: r.maintenance_estimated_end_time || INITIAL_SETTINGS.maintenanceEstimatedEndTime,
    };
  } catch {
    return null;
  }
}

export async function saveDbSettings(settings: StoreSettings): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const p = getPool();
  if (!p) return false;

  try {
    await ensureTablesExist();
    await p.query(
      `INSERT INTO \`store_settings\` (id, announcement_text, announcement_active, countdown_active, maintenance_mode, maintenance_message, maintenance_estimated_end_time)
       VALUES (1, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         announcement_text = VALUES(announcement_text),
         announcement_active = VALUES(announcement_active),
         countdown_active = VALUES(countdown_active),
         maintenance_mode = VALUES(maintenance_mode),
         maintenance_message = VALUES(maintenance_message),
         maintenance_estimated_end_time = VALUES(maintenance_estimated_end_time)`,
      [
        settings.announcementText,
        settings.announcementActive ? 1 : 0,
        settings.countdownActive ? 1 : 0,
        settings.maintenanceMode ? 1 : 0,
        settings.maintenanceMessage || null,
        settings.maintenanceEstimatedEndTime || null,
      ]
    );
    return true;
  } catch {
    return false;
  }
}
