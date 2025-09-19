import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 验证cron auth token
  const authHeader = req.headers.authorization;
  const cronAuth = process.env.CRON_AUTH_TOKEN;
  
  if (!authHeader || !cronAuth || authHeader !== `Bearer ${cronAuth}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  try {
    // 这里应该实现实际的定时任务逻辑
    // 例如：获取所有激活的任务并执行它们
    
    console.log('Running cron job to execute scheduled tasks...');
    
    // 模拟任务执行
    const tasks = [
      { id: '1', url: 'https://api.example.com/endpoint1' },
      { id: '2', url: 'https://api.example.com/endpoint2' },
    ];
    
    for (const task of tasks) {
      try {
        // 实际项目中，这里应该使用 fetch 或 axios 来调用任务URL
        console.log(`Executing task ${task.id} for URL: ${task.url}`);
        // await fetch(task.url);
      } catch (error) {
        console.error(`Failed to execute task ${task.id}:`, error);
      }
    }
    
    res.status(200).json({ 
      message: 'Cron job completed successfully',
      tasksExecuted: tasks.length
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    res.status(500).json({ error: 'Cron job failed' });
  }
}