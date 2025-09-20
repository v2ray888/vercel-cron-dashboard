import { db } from './db';

async function initDatabase() {
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

// 如果直接运行此脚本，则执行初始化
if (require.main === module) {
  initDatabase().catch(console.error);
}

export default initDatabase;