import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTasksFromStorage, updateTaskInStorage } from '../lib/taskStorage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 验证请求来自 Vercel Cron
  if (req.headers['x-vercel-cron-secret'] !== process.env.CRON_AUTH_TOKEN) {
    res.status(401).send('Not authorized :(');
    return;
  }

  try {
    // 获取所有激活的任务
    const tasks = getTasksFromStorage();
    const activeTasks = tasks.filter((task: any) => task.status === 'active');
    
    // 执行每个激活的任务
    const results = await Promise.all(
      activeTasks.map(async (task: any) => {
        try {
          // 检查是否到了执行时间
          const now = new Date();
          const nextRun = new Date(task.nextRun);
          
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
            updateTaskInStorage(task.id, {
              lastRun: now.toISOString(),
              nextRun: nextRunTime.toISOString()
            });
            
            console.log(`Batch task ${task.id} executed with results:`, batchResults);
            
            return {
              taskId: task.id,
              status: 'success',
              timestamp: now.toISOString(),
              batchResults
            };
          } else {
            // 普通任务处理
            if (now >= nextRun) {
              // 执行实际的 HTTP 请求
              const response = await fetch(task.url, { method: 'GET' });
              const status = response.ok ? 'success' : 'error';
              
              // 计算下次执行时间
              const nextRunTime = new Date(now.getTime() + task.interval * 60000);
              
              // 更新任务的执行时间
              updateTaskInStorage(task.id, {
                lastRun: now.toISOString(),
                nextRun: nextRunTime.toISOString()
              });
              
              console.log(`Task ${task.id} executed with status: ${status}`);
              
              return {
                taskId: task.id,
                status,
                timestamp: now.toISOString()
              };
            } else {
              // 还没到执行时间
              return {
                taskId: task.id,
                status: 'pending',
                timestamp: now.toISOString(),
                message: 'Not time to run yet'
              };
            }
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