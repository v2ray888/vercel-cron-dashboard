import type { Task } from '../types';
import { getTasksFromStorage, saveTasksToStorage } from '../lib/taskStorage';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 获取所有激活的任务
export async function getActiveTasks(): Promise<Task[]> {
  await delay(300); // 模拟网络延迟
  
  const tasks = getTasksFromStorage();
  return tasks.filter(task => task.status === 'active');
}

// 创建批量任务
export async function createBatchTask(batchTaskData: {
  name: string;
  description: string;
  taskIds: string[];
}): Promise<Task> {
  await delay(300); // 模拟网络延迟
  
  const tasks = getTasksFromStorage();
  
  // 获取要合并的任务
  const tasksToMerge = tasks.filter(task => 
    batchTaskData.taskIds.includes(task.id) && task.status === 'active'
  );
  
  if (tasksToMerge.length === 0) {
    throw new Error('没有找到要合并的激活任务');
  }
  
  // 创建批量任务的URL（这里我们创建一个特殊的URL来表示批量任务）
  const batchUrls = tasksToMerge.map(task => task.url).join(', ');
  
  const newBatchTask: Task = {
    id: `batch-${Math.random().toString(36).substr(2, 9)}`,
    url: `batch://${batchUrls}`,
    interval: Math.min(...tasksToMerge.map(task => task.interval)), // 使用最小间隔
    description: batchTaskData.description || `合并任务: ${batchTaskData.name}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  tasks.push(newBatchTask);
  saveTasksToStorage(tasks);
  
  return newBatchTask;
}

// 执行批量任务
export async function executeBatchTask(batchTaskId: string): Promise<{
  success: boolean;
  results: Array<{ taskId: string; status: string; error?: string }>;
}> {
  await delay(300); // 模拟网络延迟
  
  const tasks = getTasksFromStorage();
  const batchTask = tasks.find(task => task.id === batchTaskId);
  
  if (!batchTask) {
    throw new Error('批量任务未找到');
  }
  
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
  const now = new Date().toISOString();
  const nextRun = new Date(
    new Date().getTime() + batchTask.interval * 60000
  ).toISOString();
  
  const updatedTasks = tasks.map(task => {
    if (task.id === batchTaskId) {
      return {
        ...task,
        lastRun: now,
        nextRun: nextRun,
        updatedAt: now,
      };
    }
    return task;
  });
  
  saveTasksToStorage(updatedTasks);
  
  return {
    success: true,
    results
  };
}