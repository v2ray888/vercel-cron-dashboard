import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { db } from '../lib/db';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中的用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 查询用户
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return false; // 用户不存在
      }
      
      const userRow: any = result.rows[0];
      
      // 简单的密码验证（实际应用中应该使用哈希验证）
      // 注意：这仅用于演示，实际应用中应该使用 bcrypt 等安全的哈希算法
      if (userRow.password_hash !== password) {
        return false; // 密码错误
      }
      
      const user: User = {
        id: userRow.id.toString(),
        name: userRow.name,
        email: userRow.email,
      };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // 检查用户是否已存在
      const existingUser = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        return false; // 用户已存在
      }
      
      // 创建新用户
      const result = await db.query(
        `INSERT INTO users (name, email, password_hash) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [name, email, password] // 注意：这仅用于演示，实际应用中应该使用 bcrypt 等安全的哈希算法
      );
      
      const userRow: any = result.rows[0];
      const user: User = {
        id: userRow.id.toString(),
        name: userRow.name,
        email: userRow.email,
      };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('注册失败:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}