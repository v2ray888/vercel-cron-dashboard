import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确保两次输入的密码相同。",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const success = await register(name, email, password);
      
      if (success) {
        toast({
          title: "注册成功",
          description: "您的账户已创建，请登录。",
        });
        
        // 重定向到登录页面
        navigate('/login');
      } else {
        toast({
          title: "注册失败",
          description: "注册过程中出现问题，请重试。",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "注册失败",
        description: "注册过程中出现问题，请重试。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
          创建新账户
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name" className="block text-sm font-medium leading-6">
              姓名
            </Label>
            <div className="mt-2">
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="block text-sm font-medium leading-6">
              邮箱地址
            </Label>
            <div className="mt-2">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="block text-sm font-medium leading-6">
              密码
            </Label>
            <div className="mt-2">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="block text-sm font-medium leading-6">
              确认密码
            </Label>
            <div className="mt-2">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full">
              注册
            </Button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm">
          已有账户？{' '}
          <Link to="/login" className="font-semibold leading-6 text-primary hover:text-primary/80">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}