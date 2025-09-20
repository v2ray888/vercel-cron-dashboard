import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { getTask, createTask, updateTask } from '../api/tasks';
import { useAuth } from '../contexts/AuthContext';

export default function TaskForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState(5);
  const [description, setDescription] = useState('');

  // 在编辑模式下获取任务数据
  useEffect(() => {
    if (isEditing && id) {
      const fetchTask = async () => {
        try {
          if (!user) return;
          const userId = parseInt(user.id, 10);
          const task = await getTask(id, userId);
          if (task) {
            setUrl(task.url);
            setInterval(task.interval);
            setDescription(task.description);
          }
        } catch (error) {
          toast({
            title: "获取任务失败",
            description: "无法获取任务详情，请稍后重试。",
            variant: "destructive",
          });
        }
      };

      fetchTask();
    }
  }, [id, isEditing, toast, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "未登录",
        description: "请先登录再创建任务。",
        variant: "destructive",
      });
      return;
    }
    
    const userId = parseInt(user.id, 10);
    
    try {
      if (isEditing && id) {
        // 更新任务的API调用
        const updatedTask = await updateTask(id, {
          url,
          interval,
          description,
        }, userId);
        
        if (updatedTask) {
          toast({
            title: "任务更新成功",
            description: "您的定时任务已更新。",
          });
        } else {
          toast({
            title: "更新失败",
            description: "无法更新任务，请稍后重试。",
            variant: "destructive",
          });
          return;
        }
      } else {
        // 创建任务的API调用
        await createTask({
          url,
          interval,
          description,
        }, userId);
        
        toast({
          title: "任务创建成功",
          description: "您的定时任务已创建。",
        });
      }
      
      // 重定向到仪表板
      navigate('/');
    } catch (error) {
      toast({
        title: "操作失败",
        description: "处理任务时出现问题，请重试。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {isEditing ? '编辑定时任务' : '创建定时任务'}
        </h1>
        <p className="text-muted-foreground">
          设置一个定时任务，定期访问指定的URL
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="url" className="block text-sm font-medium">
            目标URL
          </Label>
          <div className="mt-2">
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://example.com/api/endpoint"
              required
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            请输入完整的URL，包括http://或https://
          </p>
        </div>

        <div>
          <Label htmlFor="interval" className="block text-sm font-medium">
            执行间隔（分钟）
          </Label>
          <div className="mt-2">
            <Input
              id="interval"
              name="interval"
              type="number"
              min="1"
              max="1440"
              required
              value={interval}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterval(Number(e.target.value))}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            任务执行的时间间隔，范围1-1440分钟（24小时）
          </p>
        </div>

        <div>
          <Label htmlFor="description" className="block text-sm font-medium">
            任务描述（可选）
          </Label>
          <div className="mt-2">
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="描述这个定时任务的用途..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">
            {isEditing ? '更新任务' : '创建任务'}
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
    </div>
  );
}