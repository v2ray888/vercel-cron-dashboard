import { db } from '../lib/db';
import type { Task } from '../types';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 获取所有激活的任务
export async function getActiveTasks(userId: number): Promise<Task[]> {
  await delay(300); // 模拟网络延迟
  
  try {
    const now = new Date();
    const result = await db.query(
      `SELECT * FROM tasks WHERE user_id = $1 AND status = 'active' AND next_run <= $2`,
      [userId, now]
    );
    
    return result.rows.map((row: any) => ({
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
  } catch (error) {
    console.error('获取激活任务失败:', error);
    throw new Error('无法获取激活任务');
  }
}

// 创建批量任务
export async function createBatchTask(batchTaskData: {
  name: string;
  description: string;
  taskIds: string[];
}, userId: number): Promise<Task> {
  await delay(300); // 模拟网络延迟
  
  try {
    // 获取要合并的任务
    const taskIds = batchTaskData.taskIds.map(id => parseInt(id, 10));
    const result = await db.query(
      `SELECT * FROM tasks WHERE id = ANY($1) AND user_id = $2 AND status = 'active'`,
      [taskIds, userId]
    );
    
    const tasksToMerge = result.rows.map((row: any) => ({
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
    
    if (tasksToMerge.length === 0) {
      throw new Error('没有找到要合并的激活任务');
    }
    
    // 创建批量任务的URL（这里我们创建一个特殊的URL来表示批量任务）
    const batchUrls = tasksToMerge.map(task => task.url).join(', ');
    
    const nextRunTime = new Date(Date.now() + Math.min(...tasksToMerge.map(task => task.interval)) * 60000);
    
    const result2 = await db.query(
      `INSERT INTO tasks (user_id, url, interval, description, status, next_run) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        userId,
        `batch://${batchUrls}`,
        Math.min(...tasksToMerge.map(task => task.interval)), // 使用最小间隔
        batchTaskData.description || `合并任务: ${batchTaskData.name}`,
        'active',
        nextRunTime
      ]
    );
    
    const row: any = result2.rows[0];
    return {
      id: row.id.toString(),
      url: row.url,
      interval: row.interval,
      description: row.description,
      status: row.status,
      lastRun: row.last_run ? row.last_run.toISOString() : undefined,
      nextRun: row.next_run ? row.next_run.toISOString() : undefined,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  } catch (error) {
    console.error('创建批量任务失败:', error);
    throw new Error('无法创建批量任务');
  }
}

// 执行批量任务
export async function executeBatchTask(batchTaskId: string, userId: number): Promise<{
  success: boolean;
  results: Array<{ taskId: string; status: string; error?: string }>;
}> {
  await delay(300); // 模拟网络延迟
  
  try {
    const result = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [batchTaskId, userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('批量任务未找到');
    }
    
    const row: any = result.rows[0];
    const batchTask: Task = {
      id: row.id.toString(),
      url: row.url,
      interval: row.interval,
      description: row.description,
      status: row.status,
      lastRun: row.last_run ? row.last_run.toISOString() : undefined,
      nextRun: row.next_run ? row.next_run.toISOString() : undefined,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
    
    // 从URL中提取原始任务URL
    const batchUrls = batchTask.url.replace('batch://', '').split(', ');
    
    // 执行所有URL
    const results = await Promise.all(
      batchUrls.map(async (url: string) => {
        try {
          const response = await fetch(url, { method: 'GET' });
          return {
            taskId: url,
            status: response.ok ? 'success' : 'error',
          };
        } catch (error) {
          return {
            taskId: url,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );
    
    // 更新批量任务的执行时间
    const now = new Date();
    const nextRun = new Date(
      now.getTime() + batchTask.interval * 60000
    );
    
    await db.query(
      `UPDATE tasks 
       SET last_run = $1, next_run = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4`,
      [now, nextRun, batchTaskId, userId]
    );
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('执行批量任务失败:', error);
    throw new Error('无法执行批量任务');
  }
}