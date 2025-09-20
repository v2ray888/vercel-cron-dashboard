import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase, initializeDatabase } from '../src/lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许在开发环境中访问
  if (process.env.NODE_ENV === 'production') {
    res.status(404).send('Not found');
    return;
  }

  try {
    await connectDatabase();
    await initializeDatabase();
    
    res.status(200).json({ 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.status(500).json({ 
      error: 'Database initialization failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}