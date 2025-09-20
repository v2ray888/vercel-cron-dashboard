import { Client } from '@vercel/postgres';

// 数据库连接配置
const DATABASE_URL = 'postgresql://neondb_owner:npg_CZsJErhX6WL9@ep-purple-night-add06zxm-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('Testing database connection...');

const client = new Client({
  connectionString: DATABASE_URL,
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Database connected successfully!');
    
    // 测试查询
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    await client.end();
    console.log('Database connection test completed.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testConnection();