# Vercel Cron Dashboard

一个基于 Vercel 的定时任务管理系统，支持用户注册登录、创建定时任务、批量任务管理等功能。

## 功能特性

- 用户注册和登录
- 创建定时任务（每几分钟访问指定 URL）
- 任务管理（启动/暂停/删除）
- 批量任务管理（将多个任务合并为一个）
- 精美的 UI 界面
- 响应式设计
- 数据持久化存储（使用 Vercel Postgres）

## 技术栈

- React 18 + TypeScript
- Vite 构建工具
- Tailwind CSS 样式框架
- Radix UI 组件库
- React Router v6
- Vercel Serverless Functions
- Vercel Postgres 数据库

## 部署到 Vercel

1. 在 Vercel 上创建新项目并连接到你的 Git 仓库
2. 在 Vercel 项目设置中添加环境变量：
   - `CRON_AUTH_TOKEN`: 用于验证 Cron 作业的密钥
   - `DATABASE_URL`: Vercel Postgres 数据库连接字符串
3. 部署项目

## 本地开发

1. 克隆项目：
   ```bash
   git clone <your-repo-url>
   cd vercel-cron-dashboard
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 创建 `.env.local` 文件并添加环境变量：
   ```env
   CRON_AUTH_TOKEN=your-cron-auth-token
   DATABASE_URL=your-database-url
   ```

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 数据库设置

1. 在 Vercel 项目中启用 Postgres 数据库
2. 获取数据库连接字符串并设置 `DATABASE_URL` 环境变量
3. 数据库表会自动创建

## 使用 Vercel Cron

在 `vercel.json` 中配置 Cron 作业：

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "* * * * *"
    }
  ]
}
```

这将每分钟执行一次 Cron 作业，检查并执行到期的任务。

## 项目结构

```
src/
├── api/           # API 路由
├── components/    # React 组件
├── contexts/      # React Context
├── lib/           # 工具库和数据库连接
├── pages/         # 页面组件
├── types/         # TypeScript 类型定义
└── App.tsx        # 主应用组件
```

## 注意事项

- 任务执行依赖于 Vercel Cron，确保已正确配置
- 数据库连接信息需要在环境变量中正确设置
- 生产环境中应使用安全的密码哈希算法（如 bcrypt）