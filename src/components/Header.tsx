import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Vercel Cron Dashboard
        </Link>
        <nav>
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/tasks/new" className="text-sm font-medium">
                创建任务
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                登出
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  登录
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  注册
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}