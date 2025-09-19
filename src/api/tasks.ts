import type { Task } from '../types';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟任务数据存储
let tasks: Task[] = [
  {
    id: '1',
    url: 'https://api.example.com/endpoint1',
    interval: 5,
    description: '示例任务1',
    status: 'active',
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 5 * 60000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    url: 'https://api.example.com/endpoint2',
    interval: 10,
    description: '示例任务2',
    status: 'paused',
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 10 * 60000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 获取所有任务（带分页）
export async function getTasks(page: number = 1, limit: number = 5): Promise<{ tasks: Task[]; totalPages: number; totalTasks: number }> {
  await delay(300); // 模拟网络延迟
  
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
  
  tasks.push(newTask);
  return newTask;
}

// 更新任务
export async function updateTask(id: string, taskData: Partial<Task>): Promise<Task | undefined> {
  await delay(300); // 模拟网络延迟
  
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return undefined;
  
  tasks[index] = {
    ...tasks[index],
    ...taskData,
    updatedAt: new Date().toISOString(),
  };
  
  return tasks[index];
}

// 删除任务
export async function deleteTask(id: string): Promise<boolean> {
  await delay(300); // 模拟网络延迟
  
  const initialLength = tasks.length;
  tasks = tasks.filter(task => task.id !== id);
  
  return tasks.length < initialLength;
}

// 切换任务状态
export async function toggleTaskStatus(id: string): Promise<Task | undefined> {
  await delay(300); // 模拟网络延迟
  
  const task = tasks.find(task => task.id === id);
  if (!task) return undefined;
  
  task.status = task.status === 'active' ? 'paused' : 'active';
  task.updatedAt = new Date().toISOString();
  
  return task;
}