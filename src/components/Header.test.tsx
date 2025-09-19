import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';
import { AuthProvider } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Header', () => {
  it('应该渲染应用标题', () => {
    renderWithAuth(<Header />);
    expect(screen.getByText('Vercel Cron Dashboard')).toBeInTheDocument();
  });

  it('应该显示登录和注册按钮当用户未认证时', () => {
    renderWithAuth(<Header />);
    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();
  });
});