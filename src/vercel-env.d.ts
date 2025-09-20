// Vercel 环境变量类型定义
declare namespace NodeJS {
  interface ProcessEnv {
    readonly CRON_AUTH_TOKEN: string;
    readonly DATABASE_URL: string;
  }
}