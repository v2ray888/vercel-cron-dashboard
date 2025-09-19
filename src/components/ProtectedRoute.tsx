import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      // 如果用户未认证，重定向到登录页面
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // 如果仍在加载用户状态或用户已认证，渲染子组件
  // 否则不渲染任何内容（等待重定向）
  return !isLoading && user ? <>{children}</> : null;
}