import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { connectDatabase, initializeDatabase } from './lib/db.ts'

// 初始化数据库连接
connectDatabase().then(() => {
  console.log('数据库连接成功')
  // 初始化数据库表
  return initializeDatabase()
}).then(() => {
  console.log('数据库初始化完成')
}).catch((error) => {
  console.error('数据库初始化失败:', error)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)