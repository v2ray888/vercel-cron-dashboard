import { db } from './db';
import type { Task } from '../types';

// localStorage 键名
export const TASKS_STORAGE_KEY = 'cron-dashboard-tasks';

// 从存储中获取任务数据
export async function getTasksFromStorage(userId: number): Promise<Task[]> {
  // 在服务器环境中使用数据库
  try {
    const result = await db.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
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
    console.error('从数据库获取任务数据失败:', error);
    return [];
  }
}

// 将任务数据保存到存储
export async function saveTasksToStorage(tasks: Task[], userId: number): Promise<void> {
  // 在服务器环境中使用数据库
  try {
    // 先删除用户的所有任务
    await db.query('DELETE FROM tasks WHERE user_id = $1', [userId]);
    
    // 批量插入新任务
    for (const task of tasks) {
      await db.query(
        `INSERT INTO tasks (user_id, url, interval, description, status, last_run, next_run, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId,
          task.url,
          task.interval,
          task.description,
          task.status,
          task.lastRun ? new Date(task.lastRun) : null,
          task.nextRun ? new Date(task.nextRun) : null,
          new Date(task.createdAt),
          new Date(task.updatedAt)
        ]
      );
    }
  } catch (error) {
    console.error('保存任务数据到数据库失败:', error);
  }
}

// 更新单个任务
export async function updateTaskInStorage(taskId: string, updateData: Partial<Task>, userId: number): Promise<void> {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;
    
    // 构建更新语句
    if (updateData.url !== undefined) {
      updates.push(`url = $${index}`);
      values.push(updateData.url);
      index++;
    }
    
    if (updateData.interval !== undefined) {
      updates.push(`interval = $${index}`);
      values.push(updateData.interval);
      index++;
    }
    
    if (updateData.description !== undefined) {
      updates.push(`description = $${index}`);
      values.push(updateData.description);
      index++;
    }
    
    if (updateData.status !== undefined) {
      updates.push(`status = $${index}`);
      values.push(updateData.status);
      index++;
    }
    
    if (updateData.lastRun !== undefined) {
      updates.push(`last_run = $${index}`);
      values.push(updateData.lastRun ? new Date(updateData.lastRun) : null);
      index++;
    }
    
    if (updateData.nextRun !== undefined) {
      updates.push(`next_run = $${index}`);
      values.push(updateData.nextRun ? new Date(updateData.nextRun) : null);
      index++;
    }
    
    // 总是更新 updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    if (updates.length === 0) {
      return;
    }
    
    values.push(taskId, userId);
    
    await db.query(
      `UPDATE tasks SET ${updates.join(', ')} 
       WHERE id = $${index} AND user_id = $${index + 1}`,
      values
    );
  } catch (error) {
    console.error('更新任务失败:', error);
  }
}