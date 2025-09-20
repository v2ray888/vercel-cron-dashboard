import { db } from '../lib/db';
import type { Task } from '../types';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 获取所有任务（带分页）
export async function getTasks(page: number = 1, limit: number = 5, userId: number): Promise<{ tasks: Task[]; totalPages: number; totalTasks: number }> {
  await delay(300); // 模拟网络延迟
  
  try {
    // 获取任务总数
    const countResult = await db.query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = $1',
      [userId]
    );
    
    const totalTasks = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalTasks / limit);
    
    // 获取分页任务
    const offset = (page - 1) * limit;
    const result = await db.query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    const tasks = result.rows.map(row => ({
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
    
    return {
      tasks,
      totalPages,
      totalTasks,
    };
  } catch (error) {
    console.error('获取任务失败:', error);
    throw new Error('无法获取任务列表');
  }
}

// 获取单个任务
export async function getTask(id: string, userId: number): Promise<Task | undefined> {
  await delay(300); // 模拟网络延迟
  
  try {
    const result = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    const row = result.rows[0];
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
    console.error('获取任务失败:', error);
    throw new Error('无法获取任务详情');
  }
}

// 创建任务
export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'lastRun' | 'nextRun'>, userId: number): Promise<Task> {
  await delay(300); // 模拟网络延迟
  
  try {
    const result = await db.query(
      `INSERT INTO tasks (user_id, url, interval, description, status, next_run) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        userId,
        taskData.url,
        taskData.interval,
        taskData.description,
        'active',
        new Date(Date.now() + taskData.interval * 60000).toISOString()
      ]
    );
    
    const row = result.rows[0];
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
    console.error('创建任务失败:', error);
    throw new Error('无法创建任务');
  }
}

// 更新任务
export async function updateTask(id: string, taskData: Partial<Task>, userId: number): Promise<Task | undefined> {
  await delay(300); // 模拟网络延迟
  
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;
    
    // 构建更新语句
    if (taskData.url !== undefined) {
      updates.push(`url = $${index}`);
      values.push(taskData.url);
      index++;
    }
    
    if (taskData.interval !== undefined) {
      updates.push(`interval = $${index}`);
      values.push(taskData.interval);
      index++;
    }
    
    if (taskData.description !== undefined) {
      updates.push(`description = $${index}`);
      values.push(taskData.description);
      index++;
    }
    
    if (taskData.status !== undefined) {
      updates.push(`status = $${index}`);
      values.push(taskData.status);
      index++;
    }
    
    if (taskData.lastRun !== undefined) {
      updates.push(`last_run = $${index}`);
      values.push(taskData.lastRun ? new Date(taskData.lastRun) : null);
      index++;
    }
    
    if (taskData.nextRun !== undefined) {
      updates.push(`next_run = $${index}`);
      values.push(taskData.nextRun ? new Date(taskData.nextRun) : null);
      index++;
    }
    
    // 总是更新 updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    if (updates.length === 0) {
      // 如果没有要更新的字段，直接返回任务
      return getTask(id, userId);
    }
    
    values.push(id, userId);
    
    const result = await db.query(
      `UPDATE tasks SET ${updates.join(', ')} 
       WHERE id = $${index} AND user_id = $${index + 1} 
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    const row = result.rows[0];
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
    console.error('更新任务失败:', error);
    throw new Error('无法更新任务');
  }
}

// 删除任务
export async function deleteTask(id: string, userId: number): Promise<boolean> {
  await delay(300); // 模拟网络延迟
  
  try {
    const result = await db.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('删除任务失败:', error);
    throw new Error('无法删除任务');
  }
}

// 切换任务状态
export async function toggleTaskStatus(id: string, userId: number): Promise<Task | undefined> {
  await delay(300); // 模拟网络延迟
  
  try {
    const result = await db.query(
      `UPDATE tasks 
       SET status = CASE 
         WHEN status = 'active' THEN 'paused' 
         ELSE 'active' 
       END,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    const row = result.rows[0];
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
    console.error('切换任务状态失败:', error);
    throw new Error('无法切换任务状态');
  }
}

// 获取所有激活的任务（用于Cron执行）
export async function getActiveTasks(): Promise<Task[]> {
  await delay(300); // 模拟网络延迟
  
  try {
    const now = new Date();
    const result = await db.query(
      `SELECT * FROM tasks WHERE status = 'active' AND next_run <= $1`,
      [now]
    );
    
    return result.rows.map(row => ({
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

// 更新任务执行时间
export async function updateTaskExecutionTime(id: string, lastRun: string, nextRun: string): Promise<Task | undefined> {
  await delay(300); // 模拟网络延迟
  
  try {
    const result = await db.query(
      `UPDATE tasks 
       SET last_run = $1, next_run = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [new Date(lastRun), new Date(nextRun), id]
    );
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    const row = result.rows[0];
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
    console.error('更新任务执行时间失败:', error);
    throw new Error('无法更新任务执行时间');
  }
}