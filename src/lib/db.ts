import { Client } from '@vercel/postgres';

// 数据库连接配置
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL 环境变量未设置');
}

// 创建数据库客户端
export const db = new Client({
  connectionString: DATABASE_URL,
});

// 连接数据库
export async function connectDatabase() {
  try {
    await db.connect();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

// 初始化数据库表
export async function initializeDatabase() {
  try {
    // 创建用户表
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建任务表
    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        interval INTEGER NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
        last_run TIMESTAMP,
        next_run TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建索引
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_next_run ON tasks(next_run)
    `);

    console.log('数据库表初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}