import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import type { Task } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 验证请求来自 Vercel Cron
  if (req.headers['x-vercel-cron-secret'] !== process.env.CRON_AUTH_TOKEN) {
    res.status(401).send('Not authorized :(');
    return;
  }

  try {
    // 获取所有激活的任务
    const now = new Date();
    const result = await db.query(
      `SELECT * FROM tasks WHERE status = 'active' AND next_run <= $1`,
      [now]
    );
    
    const activeTasks: Task[] = result.rows.map((row: any) => ({
      id: row.id.toString(),
      url: row.url,
      interval: row.interval,
      description: row.description,
      status: row.status,
      lastRun: row.last_run ? row.last_run.toISOString() : undefined,
      nextRun: row.next_run ? row.next_run.toISOString() : undefined,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }));
    
    // 执行每个激活的任务
    const results = await Promise.all(
      activeTasks.map(async (task) => {
        try {
          // 如果是批量任务，特殊处理
          if (task.url.startsWith('batch://')) {
            // 执行批量任务
            const batchUrls = task.url.replace('batch://', '').split(', ');
            const batchResults = await Promise.all(
              batchUrls.map(async (url: string) => {
                try {
                  const response = await fetch(url, { method: 'GET' });
                  return {
                    url,
                    status: response.ok ? 'success' : 'error',
                  };
                } catch (error) {
                  return {
                    url,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                  };
                }
              })
            );
            
            // 计算下次执行时间
            const nextRunTime = new Date(now.getTime() + task.interval * 60000);
            
            // 更新任务的执行时间
            await db.query(
              `UPDATE tasks 
               SET last_run = $1, next_run = $2, updated_at = CURRENT_TIMESTAMP
               WHERE id = $3`,
              [now, nextRunTime, task.id]
            );
            
            console.log(`Batch task ${task.id} executed with results:`, batchResults);
            
            return {
              taskId: task.id,
              status: 'success',
              timestamp: now.toISOString(),
              batchResults
            };
          } else {
            // 普通任务处理
            // 执行实际的 HTTP 请求
            const response = await fetch(task.url, { method: 'GET' });
            const status = response.ok ? 'success' : 'error';
            
            // 计算下次执行时间
            const nextRunTime = new Date(now.getTime() + task.interval * 60000);
            
            // 更新任务的执行时间
            await db.query(
              `UPDATE tasks 
               SET last_run = $1, next_run = $2, updated_at = CURRENT_TIMESTAMP
               WHERE id = $3`,
              [now, nextRunTime, task.id]
            );
            
            console.log(`Task ${task.id} executed with status: ${status}`);
            
            return {
              taskId: task.id,
              status,
              timestamp: now.toISOString()
            };
          }
        } catch (error) {
          console.error(`Task ${task.id} failed:`, error);
          return {
            taskId: task.id,
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    res.status(200).json({
      message: 'Cron job completed',
      executedTasks: results.length,
      results
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    res.status(500).json({ 
      error: 'Cron job failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}