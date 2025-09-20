// 用于在 Vercel 函数和前端之间共享的任务存储逻辑

// localStorage 键名
export const TASKS_STORAGE_KEY = 'cron-dashboard-tasks';

// 从存储中获取任务数据（在 Vercel 函数中需要使用文件系统或其他存储）
export function getTasksFromStorage(): any[] {
  // 在服务器环境中，我们不能使用 localStorage
  // 这里需要替换为实际的持久化存储，如数据库或文件系统
  // 目前我们返回空数组，表示需要实现真实的存储
  if (typeof window !== 'undefined') {
    // 在浏览器环境中
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('从 localStorage 获取任务数据失败:', error);
      return [];
    }
  } else {
    // 在服务器环境中（Vercel 函数）
    // 这里需要实现真实的存储逻辑
    console.warn('服务器环境中需要实现真实的任务存储');
    return [];
  }
}

// 将任务数据保存到存储（在 Vercel 函数中需要使用文件系统或其他存储）
export function saveTasksToStorage(tasks: any[]): void {
  if (typeof window !== 'undefined') {
    // 在浏览器环境中
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('保存任务数据到 localStorage 失败:', error);
    }
  } else {
    // 在服务器环境中（Vercel 函数）
    // 这里需要实现真实的存储逻辑
    console.warn('服务器环境中需要实现真实的任务存储');
  }
}

// 更新单个任务
export function updateTaskInStorage(taskId: string, updateData: any): void {
  const tasks = getTasksFromStorage();
  const index = tasks.findIndex((task: any) => task.id === taskId);
  
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updateData, updatedAt: new Date().toISOString() };
    saveTasksToStorage(tasks);
  }
}