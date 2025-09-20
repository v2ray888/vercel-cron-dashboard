import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { Badge } from '../components/ui/badge';
import { useToast } from '../components/ui/use-toast';
import { getTasks, deleteTask, toggleTaskStatus } from '../api/tasks';
import type { Task } from '../types';

export default function Dashboard() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 获取任务数据
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { tasks: fetchedTasks, totalPages } = await getTasks(currentPage, 5);
        setTasks(fetchedTasks);
        setTotalPages(totalPages);
      } catch (error) {
        toast({
          title: "获取任务失败",
          description: "无法获取任务列表，请稍后重试。",
          variant: "destructive",
        });
      }
    };

    fetchTasks();
  }, [currentPage, toast]);

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteTask(id);
      if (success) {
        setTasks(tasks.filter(task => task.id !== id));
        toast({
          title: "任务已删除",
          description: "定时任务已成功删除。",
        });
      } else {
        toast({
          title: "删除失败",
          description: "无法删除任务，请稍后重试。",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "删除任务时出现问题。",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updatedTask = await toggleTaskStatus(id);
      if (updatedTask) {
        setTasks(tasks.map(task => 
          task.id === id ? updatedTask : task
        ));
        
        toast({
          title: "任务状态已更新",
          description: "定时任务状态已成功切换。",
        });
      } else {
        toast({
          title: "更新失败",
          description: "无法更新任务状态，请稍后重试。",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "更新失败",
        description: "更新任务状态时出现问题。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">定时任务仪表板</h1>
          <p className="text-muted-foreground">
            管理您的定时任务
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/batch-tasks">
            <Button variant="outline">批量任务</Button>
          </Link>
          <Link to="/tasks/new">
            <Button>创建新任务</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>间隔</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>上次执行</TableHead>
              <TableHead>下次执行</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  {task.url}
                </TableCell>
                <TableCell>{task.interval} 分钟</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>
                  <Badge 
                    variant={task.status === 'active' ? 'default' : task.status === 'paused' ? 'secondary' : 'destructive'}
                  >
                    {task.status === 'active' ? '运行中' : task.status === 'paused' ? '已暂停' : '错误'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.lastRun ? new Date(task.lastRun).toLocaleString() : '从未'}
                </TableCell>
                <TableCell>
                  {task.nextRun ? new Date(task.nextRun).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/tasks/${task.id}/edit`}>
                      <Button variant="outline" size="sm">
                        编辑
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleStatus(task.id)}
                    >
                      {task.status === 'active' ? '暂停' : '启动'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                    >
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                size="default"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink 
                  href="#" 
                  size="default"
                  isActive={page === currentPage}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                size="default"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}