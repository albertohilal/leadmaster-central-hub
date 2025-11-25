import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MySQL Database Configuration
 * Creates a connection pool for efficient database operations
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'catalogo_habysupply',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Get a connection from the pool
 */
export async function getConnection() {
  return await pool.getConnection();
}

/**
 * Execute a query
 */
export async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
}

/**
 * Initialize database tables
 */
export async function initDatabase() {
  try {
    console.log('Creating database tables...');
    
    // Products table
    await query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(100) UNIQUE NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio_lista DECIMAL(10, 2),
        precio_efectivo DECIMAL(10, 2),
        pagina INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Images table
    await query(`
      CREATE TABLE IF NOT EXISTS imagenes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        ruta_imagen VARCHAR(500) NOT NULL,
        tipo ENUM('principal', 'accesorio') DEFAULT 'principal',
        orden INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
}

export default pool;
