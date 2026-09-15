# AI 画布式视频工具：从零开始交给编码 AI 的实施手册

caerov 的 AI 画布工作台：用户在画布上放置文本、图片、视频、音频和生成节点，把节点连成工作流，提交后由官方模型 API 异步生成结果，最后预览或导出视频。

目标是先做一条稳定的 MVP 链路：

```text
提示词 -> 文生图 -> 图生视频 -> 画布预览 -> MP4 导出
```

图像的文生图、图生图/编辑，视频的文生视频、图片/视频/音频等全能参考，以及音频能力都通过服务端 Provider 接口接入官方 API。项目不自部署模型，不在浏览器暴露模型密钥。

## 1. 先固定给编码 AI 的总规则

每次开始一个新阶段，都把下面这段作为上下文附在指令前面。它能防止 AI 擅自换技术栈、跳过验证或把供应商 SDK 写死在业务代码里。

```text
你是本项目的资深全栈 TypeScript 工程师。请在当前仓库内工作，先阅读现有文件和 package.json，再行动。

项目约束：
1. 全 TypeScript；前端 Next.js App Router，后端 NestJS + Fastify，数据库 PostgreSQL + Prisma，队列 Redis + BullMQ。
2. 使用 pnpm workspace monorepo，公共 DTO、Zod schema、类型和错误码放在 packages/shared。
3. 对象存储使用 S3 兼容接口；本地开发使用 MinIO 或 S3 mock。大文件不能写入数据库。
4. AI 模型只调用供应商官方 API/官方 SDK，不自部署模型，不在前端调用供应商 API，不把密钥提交到仓库。
5. 所有模型调用必须通过 Provider 适配层，业务层不能 import 具体供应商 SDK。
6. 生成任务必须异步、可重试、幂等、可取消，并保存 providerJobId、原始响应摘要、错误码和计费用量。
7. 不要一次性重构无关文件。每次只完成本指令范围，先运行检查再汇报。
8. 不确定的官方 API 参数、模型名或 SDK 方法时，查当前官方文档并在代码注释/README 中记录来源；不要凭记忆编造接口。
9. 先写测试或至少写可运行的验收脚本，再实现功能。完成后运行 lint、typecheck、unit test 和必要的 e2e。
10. 汇报格式固定为：已完成、修改文件、验证命令及结果、已知限制、下一步建议。
```

## 2. 给 AI 的第一条指令

把下面完整内容发给新建的编码 AI 任务。这一条只建立边界和脚手架，不要求生成业务功能。

```text
请从零建立 pnpm TypeScript monorepo。

先做以下事情：
1. 检查当前 Node、pnpm、Docker 是否可用，并记录版本。
2. 创建 apps/web（Next.js App Router）、apps/api（NestJS + Fastify）、apps/worker（BullMQ worker）。
3. 创建 packages/shared（Zod schemas、DTO、枚举、错误码）、packages/config（环境变量校验）、packages/eslint-config 和 packages/tsconfig。
4. 配置 pnpm-workspace.yaml、根级 scripts、TypeScript strict、ESLint、Prettier、Vitest、Playwright、Husky（如果环境允许）。
5. 添加 docker-compose.yml，仅包含 PostgreSQL、Redis、MinIO；不要添加 GPU 或模型容器。
6. 用 Prisma 建立初始 schema，但只创建 User、Project、CanvasDocument、Asset、GenerationTask 的空基础结构，字段定义先写清楚 TODO 和注释。
7. 添加 .env.example，包含数据库、Redis、S3、应用 URL、认证密钥和 AI provider 密钥占位符；不要写真实密钥。
8. 为 web、api、worker 添加健康检查：GET /health、worker 启动日志和首页占位页。
9. 写 README：启动依赖、安装、迁移、开发、测试、目录职责和禁止事项。

验收标准：
- pnpm install 成功。
- docker compose up -d 后，pnpm prisma migrate dev、pnpm lint、pnpm typecheck、pnpm test 能运行。
- pnpm dev 能同时启动 web、api、worker。
- web 能打开，api/health 返回 JSON，worker 能连接 Redis。
- 不实现登录、画布编辑器和真实 AI 调用。
完成后停止，不要继续实现下一阶段。
```

AI 完成后，人工检查目录和命令是否能运行。不要在脚手架不能启动时继续堆功能。

## 3. 推荐目录和模块边界

最终目录应接近下面结构，名称可以按 AI 的习惯微调，但职责不要混在一起：

```text
apps/
  web/                 # 页面、画布、查询缓存、SSE/WebSocket 客户端
  api/                 # 鉴权、项目、资产、任务 API；不执行耗时模型调用
  worker/              # BullMQ consumer、Provider 调用、FFmpeg 后处理
packages/
  shared/              # Zod schema、DTO、NodeDefinition、错误码、事件类型
  db/                  # Prisma client 和 repository
  providers/           # Image/Video/Audio Provider 接口及适配器
  workflow/            # 画布校验、DAG、节点执行计划
  storage/             # S3 presigned URL、缩略图和文件元数据
  config/              # 环境变量解析和运行时配置
infra/
  docker-compose.yml
  migrations/
```

`apps/api` 只能依赖 `packages/shared`、`packages/db`、`packages/storage`、`packages/workflow`；具体 AI SDK 只允许出现在 `packages/providers` 或 worker 的 provider 注册处。

## 4. 分阶段指令

以下每条都单独发送。AI 完成一条并通过验收后再发送下一条。每条指令都包含了应该要求 AI 返回的结果。

### 阶段 1：数据库、鉴权和项目

```text
在现有脚手架上实现基础账户和项目管理。

要求：
1. 使用当前推荐的邮箱登录方案；认证逻辑只能在服务端，session 使用 httpOnly cookie。
2. 完善 Prisma：User、Project、CanvasDocument、ProjectMember（先保留 owner/member 角色）。
3. 所有 API 输入用 packages/shared 的 Zod schema 校验，API 输出有统一 envelope 和错误码。
4. 实现创建、读取、重命名、软删除项目，以及保存/读取 canvas JSON 的 API。
5. canvas JSON 先定义 version、viewport、nodes、edges、metadata；保存时做 schema 校验和大小限制。
6. 写 repository unit tests 和 API e2e tests，覆盖未登录、越权、非法 JSON、软删除项目。

验收：新用户可以登录、创建项目、刷新页面后恢复项目和画布 JSON；不能读取其他用户项目。
```

### 阶段 2：画布 UI

```text
实现 web 的工作台页面和最小可用画布。

要求：
1. 使用 React Flow/XYFlow；状态用 Zustand，服务端数据用 TanStack Query。
2. 左侧工具栏包含 text、image-upload、text-to-image、image-edit、image-to-video、video-reference、audio-reference、merge、export 节点。
3. 节点必须有稳定尺寸、输入/输出 handles、选中态、错误态、运行态、完成态和删除操作。
4. 支持拖拽节点、连线、框选、缩放、平移、撤销/重做、自动保存和刷新恢复。
5. 把画布状态转换成 packages/shared 的 CanvasDocument，前端不直接拼接后端私有字段。
6. 上传节点先只完成文件选择和预览；真实上传走后续 presigned URL 阶段。
7. 使用 lucide 图标，按钮有 aria-label 和 tooltip；移动端至少能查看和选择节点。

验收：可以新建画布、放置并连接节点、刷新后状态不丢失；浏览器控制台没有 hydration、类型或未处理 promise 错误。
```

### 阶段 3：资产和对象存储

```text
实现统一资产服务，支持图片、视频、音频和缩略图。

要求：
1. Asset 表保存 id、ownerId、projectId、kind、status、mimeType、sizeBytes、width、height、durationMs、storageKey、previewKey、sha256、metadata、createdAt。
2. 服务端生成短时效 presigned upload URL；浏览器直传 S3/MinIO，API 不代理大文件。
3. 上传完成后由 API 校验对象存在、大小和 MIME；禁止仅信任前端扩展名。
4. worker 用 FFmpeg/媒体探测工具读取媒体元数据并生成封面/低清预览。
5. 资产引用使用 assetId，节点不得保存长期公开 URL；读取时生成短时效 signed URL。
6. 做文件大小、时长、分辨率和用户配额限制，并测试非法 MIME、超限和重复 sha256。

验收：上传一张图片、一个视频和一个音频后，画布节点能显示预览，数据库没有媒体二进制内容。
```

### 阶段 4：Provider 适配层

这一步先定义协议和 mock，不要立刻接真实 API。

```text
在 packages/providers 中建立供应商无关的模型接口，并提供 deterministic mock provider。

请先实现这些 TypeScript 类型：

type ReferenceInput = {
  assetId: string;
  kind: 'image' | 'video' | 'audio';
  role?: 'firstFrame' | 'lastFrame' | 'style' | 'character' | 'motion' | 'audio' | 'general';
};

type GenerateContext = {
  requestId: string;
  userId: string;
  idempotencyKey: string;
  signal: AbortSignal;
};

type GenerationOutput = {
  kind: 'image' | 'video' | 'audio';
  remoteUrl?: string;
  bytes?: Uint8Array;
  mimeType: string;
  width?: number;
  height?: number;
  durationMs?: number;
  providerJobId?: string;
  usage?: { inputUnits?: number; outputUnits?: number; estimatedCostUsd?: number };
  rawSummary?: Record<string, unknown>;
};

interface ImageProvider {
  textToImage(input: { prompt: string; negativePrompt?: string; width: number; height: number; model: string }, ctx: GenerateContext): Promise<GenerationOutput[]>;
  editImage(input: { prompt: string; source: ReferenceInput[]; width?: number; height?: number; model: string }, ctx: GenerateContext): Promise<GenerationOutput[]>;
}

interface VideoProvider {
  textToVideo(input: { prompt: string; durationMs: number; aspectRatio?: string; model: string; references?: ReferenceInput[] }, ctx: GenerateContext): Promise<GenerationOutput[]>;
  referenceToVideo(input: { prompt?: string; references: ReferenceInput[]; durationMs: number; model: string }, ctx: GenerateContext): Promise<GenerationOutput[]>;
}

interface AudioProvider {
  generate(input: { prompt?: string; text?: string; references?: ReferenceInput[]; durationMs?: number; model: string }, ctx: GenerateContext): Promise<GenerationOutput[]>;
}

要求：
1. 每个方法都支持超时、AbortSignal、幂等键和可重试错误分类。
2. 定义 ProviderError、RateLimitError、InvalidInputError、TemporaryProviderError 和 ContentPolicyError。
3. Provider 层输出统一 GenerationOutput；业务层不能读取供应商原始 JSON。
4. mock provider 生成固定测试文件并模拟 queued/running/succeeded/failed。
5. 在 README 写明以后接入某一家官方 API 时，只能新增 adapter 和配置，不得改业务 API。

验收：用 mock provider 跑通一个生成调用，单元测试覆盖成功、限流、内容策略拒绝、超时和重复 idempotencyKey。
```

### 阶段 5：接入第一家官方图像 API

```text
只接入一个当前官方图像 API，完成文生图和图生图/编辑。

执行规则：
1. 先阅读该供应商当前官方 API 文档和官方 TypeScript SDK 文档，在 docs/providers/<provider>.md 记录链接、模型、输入、输出、异步方式、价格和限制。
2. API key 只从服务端环境变量读取；不能传给 web，不能写日志。
3. 将 assetId 通过 storage service 转成供应商可读取的短时效 URL或按官方要求上传文件。
4. 适配 ImageProvider，不改业务 controller 和节点协议。
5. 将同步/异步供应商差异隐藏在 adapter 内；API 任务统一通过 worker 执行。
6. 记录 providerJobId、模型版本、输入摘要、输出资产、实际/估算用量；敏感 prompt 和原图 URL 不写普通日志。
7. 使用 nock/MSW 或供应商建议的测试方式模拟官方响应；CI 不调用真实 API。
8. 加上 feature flag IMAGE_PROVIDER=mock|<provider>，默认 mock。

验收：在开发环境配置 key 后，文生图和图像编辑能生成资产；没有 key 时应用仍可用 mock；错误可以重试且不会重复扣用量。
```

### 阶段 6：接入视频官方 API和全能参考

```text
接入一个当前官方视频 API，支持文生视频和全能参考输入。

要求：
1. 先查官方文档，确认其是否支持图片、视频、音频参考、首帧/尾帧、时长和比例；不支持的输入要在 schema 层返回明确错误。
2. 统一使用 VideoProvider.textToVideo 和 referenceToVideo；references 数组必须带 kind 和 role。
3. 参考素材先经 storage service 生成短时效 URL或按官方要求上传，不允许把永久对象 URL暴露给供应商。
4. 视频任务必须采用 queued -> running -> succeeded/failed/cancelled 状态；worker 轮询或接收官方 webhook 的细节放在 adapter 内。
5. 增加最大时长、分辨率、参考文件数量、文件体积和用户并发限制。
6. 下载供应商结果到对象存储后再返回 assetId；不要把供应商 URL 直接当作业务资产永久保存。
7. 对超时、限流、审核拒绝、供应商 5xx 和用户取消分别映射错误码。
8. 为 image、video、audio 三种参考各写一个 contract test，使用 mock provider 覆盖不支持组合。

验收：文本生成视频、图片参考生成视频、图片+视频+音频组合（供应商支持时）都能在画布看到任务进度和结果；不支持的组合会在提交前提示原因。
```

### 阶段 7：工作流 DAG 和任务队列

```text
把画布连接转换成可执行的 DAG，并通过 BullMQ 异步执行。

要求：
1. 在 packages/workflow 中校验节点类型、输入输出类型、环路、孤立必需输入和最大节点数。
2. 生成 execution plan：节点依赖、并行批次、每个节点的输入映射和版本号。
3. 每个节点执行拥有 executionId、taskId、idempotencyKey、attempt、startedAt、finishedAt。
4. 依赖已完成后再入队；无依赖的节点可并行。重试只针对临时错误，内容策略和非法输入不可重试。
5. 每次节点完成都把输出写成 Asset 引用，并发布 task.progress、task.completed、task.failed 事件。
6. 支持取消：取消主任务后不再调度下游节点，并向支持 AbortSignal 的 provider 发送取消。
7. worker 崩溃后可恢复；重复消费不会重复生成或重复计费。
8. 测试串行、并行、失败重试、取消、循环图、重复消息和 worker 重启。

验收：用 mock provider 跑通 text -> image -> video 工作流，任务可重试、可取消，刷新页面后仍能恢复状态。
```

### 阶段 8：实时进度、预览和导出

```text
把任务状态可靠地呈现在 web，并实现 MP4 导出。

要求：
1. API 提供任务查询；实时层使用 SSE（或现有 WebSocket），连接断开后通过最后事件 ID补发，不依赖实时连接保存状态。
2. 页面显示节点级 queued/running/progress/succeeded/failed/cancelled，并提供重试和取消按钮。
3. worker 使用 FFmpeg 完成拼接、裁剪、混音、字幕（先实现视频拼接和音频混合），输出 H.264/AAC MP4 和封面。
4. 导出也是一个队列任务，有独立的输入快照、输出 Asset 和失败日志。
5. 预览用低清代理，下载/导出用原始或指定质量；所有 URL 都是短时效 signed URL。
6. 测试 SSE 重连、事件顺序、重复事件、FFmpeg 非零退出码和导出取消。

验收：浏览器刷新或断网重连后进度正确；生成的视频可在 Chrome、Safari 播放并下载。
```

### 阶段 9：额度、审计和安全

```text
加入上线前必须有的用量和安全控制。

要求：
1. 增加 UsageLedger、QuotaPolicy、ProviderRequestLog（脱敏）和 AuditLog。
2. 任务入队前预估成本并锁定额度；成功、失败、取消分别按策略结算或释放；结算必须幂等。
3. 每用户并发数、每日额度、最大媒体参数、单项目资产数量都由服务端强制执行。
4. prompt、文件名、错误消息在日志中脱敏；密钥来自 secret manager/环境变量；生产环境禁止 debug 日志。
5. 增加 SSRF 防护、MIME 探测、压缩炸弹/超大文件保护、内容安全检查接口和速率限制。
6. 所有下载、预览、任务和项目 API 做 owner/member 权限检查。
7. 安全测试覆盖越权、重放 idempotencyKey、伪造回调、恶意文件名和超额并发。

验收：恶意用户不能越权拿到资产或消耗他人额度；重复请求不会重复计费。
```

### 阶段 10：部署和上线检查

```text
准备 staging 和 production 部署文档，不要直接执行不可逆生产操作。

要求：
1. web、api、worker 分别构建 Docker 镜像；worker 镜像包含经过许可的 FFmpeg。
2. 提供 staging 的 PostgreSQL、Redis、S3、域名、HTTPS、队列并发和环境变量清单。
3. 写 CI：install、lint、typecheck、unit、e2e（mock provider）、build、迁移检查。
4. 提供数据库备份/恢复、对象存储生命周期、队列死信、日志、指标、错误追踪和告警方案。
5. 明确 AI provider 配额、回调 URL、超时、重试、区域和数据保留策略。
6. 生产切换前列出人工检查项：真实 key、回调签名、CORS、cookie、域名、额度、隐私政策、内容审核和退款规则。

验收：可以在 staging 从注册到导出完整走通；没有任何真实密钥出现在 Git、前端 bundle 或日志中。
```

## 5. 节点协议建议

从第一版就把节点定义为可版本化数据。不要让前端直接依赖某个模型的参数名：

```ts
type CanvasNodeData =
  | { type: 'text'; text: string }
  | { type: 'text-to-image'; prompt: string; model: string; width: number; height: number }
  | { type: 'image-edit'; prompt: string; sourceAssetIds: string[]; model: string }
  | { type: 'text-to-video'; prompt: string; model: string; durationMs: number; aspectRatio: string }
  | { type: 'reference-to-video'; prompt?: string; references: ReferenceInput[]; model: string }
  | { type: 'audio-reference'; assetId: string }
  | { type: 'merge'; videoAssetIds: string[]; audioAssetId?: string }
  | { type: 'export'; format: 'mp4'; quality: 'preview' | 'standard' | 'high' };
```

每种节点必须有 `schemaVersion`。升级节点协议时写迁移函数，并保留旧画布读取能力。

## 6. 环境变量模板

```text
NODE_ENV=development
WEB_URL=http://localhost:3000
API_URL=http://localhost:4000
DATABASE_URL=postgresql://app:app@localhost:5432/canvas_video
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=canvas-video
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
SESSION_SECRET=replace-me
IMAGE_PROVIDER=mock
VIDEO_PROVIDER=mock
AUDIO_PROVIDER=mock
IMAGE_PROVIDER_API_KEY=
VIDEO_PROVIDER_API_KEY=
AUDIO_PROVIDER_API_KEY=
```

所有配置在进程启动时用 Zod 校验；缺少真实 provider key 时允许 `mock` 模式启动，生产环境则必须拒绝 `mock`。

## 7. AI 的日常工作循环

功能较大时，把这段加到每次指令末尾：

```text
执行流程：先列出将阅读的文件和实现计划；然后只修改本阶段需要的文件；实现后运行最小相关测试，再运行 lint 和 typecheck；如果失败，先修复而不是跳过；最后按“已完成、修改文件、验证、限制、下一步”汇报，并等待下一条指令。不要自行扩大范围。
```

如果 AI 开始直接写真实模型调用、把密钥放进前端、跳过队列、把大文件存数据库或修改无关模块，立即让它停止，并发送：

```text
停止当前扩展。请回到本阶段的验收标准，撤回未被要求的范围（保留用户已有改动），先补测试和类型，再继续。所有真实模型调用必须经过 packages/providers，默认使用 mock provider。
```

## 8. 何时接入真实模型

顺序建议是：

1. mock provider + 画布 + DAG + 队列完整跑通。
2. 只接一家官方图像 API，验证文生图和编辑。
3. 只接一家官方视频 API，验证文本、图片参考和可用的多模态参考。
4. 加入音频 provider 和 FFmpeg 混音。
5. 再增加第二家 provider、模型选择、备用路由和价格比较。

每接入一家供应商，都要求 AI 先更新 `docs/providers/`，并以官方文档为准确认模型名称、区域、文件格式、异步回调、配额、计费和数据保留政策。这样供应商变更时只需要替换 adapter，不会破坏画布、任务和资产系统。

## 9. MVP 完成定义

只有下面流程全部通过，才算第一版完成：

```text
注册/登录
  -> 创建项目
  -> 放置文本节点
  -> 文生图
  -> 图片编辑或图生图
  -> 图片参考生成视频
  -> 查看节点进度
  -> 刷新后状态恢复
  -> 生成封面和低清预览
  -> 合并音频（可先用上传音频）
  -> 导出可播放 MP4
```

真实 API 还要额外用 staging key 做一次人工验收：限流、审核拒绝、供应商超时、结果下载失败、重复提交、取消任务和额度结算都必须有可理解的 UI 状态。
