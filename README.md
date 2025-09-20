# Vercel Cron Dashboard

一个基于Vercel的定时任务管理系统，允许用户创建和管理定时任务来定期访问指定的URL。

## 功能特性

- 用户注册和登录系统
- 创建、编辑、删除定时任务
- 管理任务状态（启动/暂停）
- 分页任务列表
- 响应式设计，支持移动端
- 批量任务管理（将多个任务合并为一个批量任务）

## 技术栈

- React 18 with TypeScript
- Vite 构建工具
- Tailwind CSS 样式框架
- React Router v6 路由管理
- Vercel Serverless Functions
- Radix UI 组件库

## 本地开发

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认情况下，应用将在 http://localhost:5173 上运行。

## 部署到Vercel

1. 将代码推送到GitHub仓库
2. 在Vercel官网创建新项目并连接到你的GitHub仓库
3. Vercel会自动检测并配置项目
4. 点击"Deploy"开始部署

### 环境变量配置

部署时需要设置以下环境变量：

- `CRON_AUTH_TOKEN` - 用于保护cron端点的安全令牌

## 定时任务配置

要启用定时任务，需要在Vercel项目设置中配置Cron Jobs：

1. 进入Vercel项目控制台
2. 点击"Settings" -> "Cron Jobs"
3. 添加新的Cron Job配置：
   - Endpoint: `/api/cron`
   - Schedule: `*/5 * * * *` (每5分钟执行一次)
   - Auth Token: 与环境变量中设置的`CRON_AUTH_TOKEN`相同

## 批量任务功能

### 功能说明
批量任务功能允许用户将多个独立的定时任务合并为一个批量任务，从而减少HTTP请求次数并提高执行效率。

### 使用方法
1. 在仪表板页面点击"批量任务"按钮
2. 选择要合并的激活任务
3. 输入批量任务名称和描述
4. 点击"创建批量任务"

### 执行机制
- 批量任务会按照设置的时间间隔执行
- 执行时会依次访问所有合并的任务URL
- 执行结果会分别记录每个URL的访问状态

## 项目结构

```
src/
├── api/              # API服务
├── components/       # React组件
│   └── ui/           # UI组件库
├── contexts/         # React上下文
├── lib/              # 工具函数
├── pages/            # 页面组件
├── types/            # TypeScript类型定义
└── App.tsx           # 主应用组件
```

## 开发指南

### 添加新组件

1. 在`src/components/`目录下创建新组件
2. 使用Tailwind CSS进行样式设计
3. 遵循现有的组件结构和命名约定

### 添加新页面

1. 在`src/pages/`目录下创建新页面组件
2. 在`src/App.tsx`中添加对应的路由

### API服务扩展

1. 在`src/api/`目录下添加新的API服务文件
2. 遵循现有的API服务模式

## 注意事项

1. 本项目使用localStorage存储用户认证信息，仅用于演示目的
2. 实际生产环境中应使用安全的认证机制
3. 定时任务的执行依赖于Vercel的Cron Jobs功能
4. 任务数据存储在内存中，重启后会丢失（实际项目中应使用数据库）

## 许可证

MIT