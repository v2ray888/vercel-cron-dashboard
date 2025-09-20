import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import type { Task } from '../types';
import { getTasks } from '../api/tasks';
import { createBatchTask } from '../api/batchTasks';
import { useToast } from '../components/ui/use-toast';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

// 创建简单的 Card 组件替代
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

// 创建简单的 Checkbox 组件替代
const Checkbox = ({ 
  checked, 
  onCheckedChange,
  className
}: { 
  checked?: boolean; 
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className={`h-4 w-4 rounded border border-primary ${className}`}
  />
);

export default function BatchTasks() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [batchName, setBatchName] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 获取所有任务
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { tasks: fetchedTasks } = await getTasks(1, 100); // 获取所有任务
        setTasks(fetchedTasks);
      } catch (error) {
        toast({
          title: "获取任务失败",
          description: "无法获取任务列表，请稍后重试。",
          variant: "destructive",
        });
      }
    };

    fetchTasks();
  }, [toast]);

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.filter(t => t.status === 'active').length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.filter(t => t.status === 'active').map(t => t.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTasks.length === 0) {
      toast({
        title: "请选择任务",
        description: "请至少选择一个任务来创建批量任务。",
        variant: "destructive",
      });
      return;
    }

    if (!batchName.trim()) {
      toast({
        title: "请输入批量任务名称",
        description: "批量任务名称不能为空。",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      await createBatchTask({
        name: batchName,
        description: batchDescription,
        taskIds: selectedTasks,
      });

      toast({
        title: "批量任务创建成功",
        description: "您的批量任务已创建并激活。",
      });

      // 重置表单
      setBatchName('');
      setBatchDescription('');
      setSelectedTasks([]);
      
      // 返回到仪表板
      navigate('/');
    } catch (error) {
      toast({
        title: "创建失败",
        description: "创建批量任务时出现问题，请重试。",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const activeTasks = tasks.filter(task => task.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">批量任务管理</h1>
          <p className="text-muted-foreground">
            将多个任务合并为一个批量任务
          </p>
        </div>
        <Link to="/">
          <Button variant="outline">返回仪表板</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>创建批量任务</CardTitle>
          <CardDescription>
            选择要合并的任务并设置批量任务信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="batchName">批量任务名称</Label>
                <Input
                  id="batchName"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="输入批量任务名称"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="batchDescription">描述（可选）</Label>
                <Textarea
                  id="batchDescription"
                  value={batchDescription}
                  onChange={(e) => setBatchDescription(e.target.value)}
                  placeholder="描述这个批量任务的用途..."
                  rows={3}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">选择任务</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedTasks.length === activeTasks.length && activeTasks.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>间隔</TableHead>
                      <TableHead>描述</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeTasks.length > 0 ? (
                      activeTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTasks.includes(task.id)}
                              onCheckedChange={() => handleTaskSelect(task.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {task.url}
                          </TableCell>
                          <TableCell>{task.interval} 分钟</TableCell>
                          <TableCell>{task.description || '无描述'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          没有可用的激活任务
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                已选择 {selectedTasks.length} 个任务
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? '创建中...' : '创建批量任务'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}