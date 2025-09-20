import type { Task } from '../types';
import { getTasksFromStorage, saveTasksToStorage, updateTaskInStorage } from '../lib/taskStorage';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 获取所有任务（带分页）
export async function getTasks(page: number = 1, limit: number = 5): Promise<{ tasks: Task[]; totalPages: number; totalTasks: number }> {
  await delay(300); // 模拟网络延迟
  
  const tasks = getTasksFromStorage();
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTasks = tasks.slice(startIndex, endIndex);
  const totalTasks = tasks.length;
  const totalPages = Math.ceil(totalTasks / limit);
  
  return {
    tasks: paginatedTasks,
    totalPages,
    totalTasks,
  };
}

// 获取单个任务
export async function getTask(id: string): Promise<Task | undefined> {
  await delay(300); // 模拟网络延迟
  const tasks = getTasksFromStorage();
  return tasks.find(task => task.id === id);
}

// 创建任务
export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'lastRun' | 'nextRun'>): Promise<Task> {
  await delay(300); // 模拟网络延迟
  
  const newTask: Task = {
    id: Math.random().toString(36).substr(2, 9),
    ...taskData,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const tasks = getTasksFromStorage();
  tasks.push(newTask);
  saveTasksToStorage(tasks);
  return newTask;
}

// 更新任务
export async function updateTask(id: string, taskData: Partial<Task>): Promise<Task | undefined> {
  await delay(300); // 模拟网络延迟
  
  const tasks = getTasksFromStorage();
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return undefined;
  
  tasks[index] = {
    ...tasks[index],
    ...taskData,
    updatedAt: new Date().toISOString(),
  };
  
  saveTasksToStorage(tasks);
  return tasks[index];
}

// 删除任务
export async function deleteTask(id: string): Promise<boolean> {
  await delay(300); // 模拟网络延迟
  
  const tasks = getTasksFromStorage();
  const initialLength = tasks.length;
  const filteredTasks = tasks.filter(task => task.id !== id);
  saveTasksToStorage(filteredTasks);
  
  return filteredTasks.length < initialLength;
}

// 切换任务状态
export async function toggleTaskStatus(id: string): Promise<Task | undefined> {
  await delay(300); // 模拟网络延迟
  
  const tasks = getTasksFromStorage();
  const task = tasks.find(task => task.id === id);
  if (!task) return undefined;
  
  task.status = task.status === 'active' ? 'paused' : 'active';
  task.updatedAt = new Date().toISOString();
  
  saveTasksToStorage(tasks);
  return task;
}

// 更新任务执行时间
export async function updateTaskExecutionTime(id: string, lastRun: string, nextRun: string): Promise<Task | undefined> {
  await delay(300); // 模拟网络延迟
  
  const tasks = getTasksFromStorage();
  const task = tasks.find(task => task.id === id);
  if (!task) return undefined;
  
  task.lastRun = lastRun;
  task.nextRun = nextRun;
  task.updatedAt = new Date().toISOString();
  
  saveTasksToStorage(tasks);
  return task;
}