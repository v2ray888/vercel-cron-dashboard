import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import BatchTasks from './BatchTasks';
import { AuthProvider } from '../contexts/AuthContext';
import * as tasksApi from '../api/tasks';
import * as batchTasksApi from '../api/batchTasks';

// Mock API functions
vi.mock('../api/tasks', () => ({
  getTasks: vi.fn(),
}));

vi.mock('../api/batchTasks', () => ({
  getActiveTasks: vi.fn(),
  createBatchTask: vi.fn(),
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('BatchTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染批量任务页面标题', () => {
    renderWithProviders(<BatchTasks />);
    expect(screen.getByText('批量任务管理')).toBeInTheDocument();
  });

  it('应该显示任务列表', async () => {
    // Mock API response
    (tasksApi.getTasks as ReturnType<typeof vi.fn>).mockResolvedValue({
      tasks: [
        {
          id: '1',
          url: 'https://api.example.com/endpoint1',
          interval: 5,
          description: '示例任务1',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          url: 'https://api.example.com/endpoint2',
          interval: 10,
          description: '示例任务2',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      totalPages: 1,
      totalTasks: 2,
    });

    renderWithProviders(<BatchTasks />);
    
    // 等待任务加载
    await waitFor(() => {
      expect(screen.getByText('https://api.example.com/endpoint1')).toBeInTheDocument();
      expect(screen.getByText('https://api.example.com/endpoint2')).toBeInTheDocument();
    });
  });

  it('应该允许创建批量任务', async () => {
    // Mock API responses
    (tasksApi.getTasks as ReturnType<typeof vi.fn>).mockResolvedValue({
      tasks: [
        {
          id: '1',
          url: 'https://api.example.com/endpoint1',
          interval: 5,
          description: '示例任务1',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      totalPages: 1,
      totalTasks: 1,
    });

    (batchTasksApi.createBatchTask as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'batch-1',
      url: 'batch://https://api.example.com/endpoint1',
      interval: 5,
      description: '合并任务: 测试批量任务',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    renderWithProviders(<BatchTasks />);
    
    // 等待任务加载
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      // 第二个checkbox是任务的checkbox（第一个是全选checkbox）
      fireEvent.click(checkboxes[1]);
    });

    // 填写表单
    const nameInput = screen.getByLabelText('批量任务名称');
    fireEvent.change(nameInput, { target: { value: '测试批量任务' } });

    const submitButton = screen.getByText('创建批量任务');
    fireEvent.click(submitButton);

    // 验证创建函数被调用
    await waitFor(() => {
      expect(batchTasksApi.createBatchTask).toHaveBeenCalledWith({
        name: '测试批量任务',
        description: '',
        taskIds: ['1'],
      });
    });
  });
});