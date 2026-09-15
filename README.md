# Caerov

Caerov 是一个基于 pnpm 和 TypeScript 的 monorepo 脚手架，面向 AI 画布视频工作区。本阶段只搭建运行时、服务边界、本地基础设施、健康检查和初始数据模型，暂不实现登录、画布编辑器或真实 AI 调用。

## 前置依赖

- Node.js 22 或更高版本（本机已验证：`v24.11.1`）
- pnpm 10 或更高版本（本机已验证：`10.33.0`）
- Docker Engine（本机已验证：`29.6.2`）
- Docker Compose（本机已验证：`v5.3.1`）

## 快速开始

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm prisma generate
pnpm prisma migrate dev
```

PowerShell 如果没有可用的 `cp` 别名，请使用：

```powershell
Copy-Item .env.example .env
```

`.env` 只用于本地环境，不能提交到版本库。`.env.example` 中的密钥均为占位值，请按实际环境修改；不要写入真实凭据。

根目录的 `docker-compose.yml` 是兼容入口，实际 Compose 定义位于 `infra/docker-compose.yml`。根目录的 `pnpm prisma ...` 命令会转发到 `packages/db` 的 Prisma CLI。

## 本地依赖

```bash
docker compose up -d
```

Compose 只启动以下服务：

- PostgreSQL：容器内端口 `5432`，默认映射到主机 `15432`
- Redis：主机端口 `6379`
- MinIO：S3 API 端口 `9000`，管理控制台端口 `9001`

PostgreSQL 默认使用主机端口 `15432`，用于避开 Windows 本机可能已经运行的 PostgreSQL。如果确认 `5432` 空闲，可以在 `.env` 中设置 `POSTGRES_HOST_PORT=5432`，并同步调整 `DATABASE_URL`。

MinIO 地址为 `http://localhost:9000`，控制台地址为 `http://localhost:9001`。实现上传功能前，请先在 MinIO 中创建 `canvas-video` bucket。

## 开发

```bash
pnpm dev
```

Turbo 会同时启动三个长运行服务：

- Web：`http://localhost:3000`；健康检查：`GET http://localhost:3000/health`
- API：`http://localhost:4000`；健康检查：`GET http://localhost:4000/health`
- Worker：连接 Redis 并监听 `generation` 队列；就绪信息写入终端日志

Worker 使用 `packages/config` 中的 Zod schema 校验运行环境，API 在自身入口校验启动所需的端口和 CORS 配置。示例配置使用 mock provider，不包含真实凭据。当前 Web 首页是占位页，健康接口返回 JSON，Worker 只建立 Redis 连接并处理占位任务。

## 数据库迁移

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

Prisma schema 位于 `packages/db/prisma/schema.prisma`，迁移文件位于 `infra/migrations`，路径由 `packages/db/prisma.config.ts` 统一声明。当前 schema 只包含五个空基础结构：`User`、`Project`、`CanvasDocument`、`Asset` 和 `GenerationTask`。字段旁已写明后续 TODO；不要在本阶段扩展业务模型或实现数据访问流程。

## 测试与质量检查

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm format:check
```

根级脚本说明：

| 命令                | 作用                          |
| ------------------- | ----------------------------- |
| `pnpm dev`          | 并行启动 Web、API 和 Worker   |
| `pnpm build`        | 构建所有可构建的 workspace 包 |
| `pnpm lint`         | 执行 ESLint                   |
| `pnpm typecheck`    | 执行严格 TypeScript 类型检查  |
| `pnpm test`         | 执行 Vitest 单元测试          |
| `pnpm test:e2e`     | 执行 Playwright 端到端测试    |
| `pnpm format`       | 使用 Prettier 格式化文件      |
| `pnpm format:check` | 检查 Prettier 格式            |
| `pnpm prisma ...`   | 调用 `packages/db` 的 Prisma  |

`pnpm test` 中的 Vitest 测试不依赖 Docker。Playwright 会自动启动 Web 开发服务器；数据库迁移和 Worker 就绪检查需要先启动 Compose 服务。

Husky 的 pre-commit hook 会运行 lint 和类型检查。如果当前目录还不是 Git 仓库，安装会自动跳过；初始化 Git 后执行一次 `pnpm prepare` 即可启用。

## 目录职责

```text
apps/
  web/                 # 页面、画布界面、查询缓存、SSE/WebSocket 客户端
  api/                 # 鉴权、项目、资产、任务 API；不执行耗时模型调用
  worker/              # BullMQ consumer、Provider 调用、FFmpeg 后处理
packages/
  shared/              # Zod schema、DTO、NodeDefinition、错误码、事件类型
  db/                  # Prisma client 和 repository
  providers/           # Image/Video/Audio Provider 接口及适配器
  workflow/            # 画布校验、DAG、节点执行计划
  storage/             # S3 presigned URL、缩略图和文件元数据
  config/              # 环境变量解析和运行时配置
  eslint-config/       # 共享 ESLint flat config
  tsconfig/            # 严格模式的共享 TypeScript 配置
infra/
  docker-compose.yml   # PostgreSQL、Redis、MinIO
  migrations/          # Prisma 迁移文件
```

### 依赖边界

- `apps/api` 的内部 workspace 依赖仅限 `@caerov/shared`、`@caerov/db`、`@caerov/storage` 和 `@caerov/workflow`。
- `apps/api` 不依赖 `@caerov/providers`，也不执行 Provider 或模型调用。
- `apps/worker` 负责注册 Provider、消费 BullMQ 任务和承载后续 FFmpeg 后处理。
- 具体 AI SDK 只能放在 `packages/providers` 或 Worker 的 Provider 注册处；当前没有安装或调用真实 AI SDK。
- `packages/db` 只负责 Prisma client 和 repository，不放 HTTP、Provider 或画布执行逻辑。

## 当前阶段禁止事项

- 不实现登录、认证流程、画布编辑器或真实 provider 调用。
- 不向浏览器暴露 AI provider 密钥，也不从浏览器直接调用 provider。
- 不把媒体二进制存入 PostgreSQL；媒体应使用 S3 兼容对象存储。
- 不在 API 进程中执行昂贵的生成任务；生成任务应进入 Worker 队列。
- 不添加自托管模型、GPU 或模型服务容器。
- 不提交 `.env` 文件或真实凭据。
