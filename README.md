# 苏策通 Subsight

面向苏州中小制造企业、科技型企业与 OPC 创业者的政策补贴智能匹配与申报辅助平台。当前版本包含 React 前端、Express API 与本地 SQLite 数据库。政策内容仍为比赛演示数据，不调用政府接口，不代替企业提交申报。

## 运行方式

```powershell
cd "项目所在目录"
npm install
npm run dev
```

该命令会同时启动 Web 前端和 API 服务：

- Web：`http://127.0.0.1:5173`
- API：`http://127.0.0.1:3001`
- 数据库：`server/data/subsight.db`（首次运行自动创建）

演示账号：

- 邮箱：`demo@subsight.cn`
- 密码：`Demo123456`

生产构建：

```powershell
npm run build
npm run preview
```

## 已实现页面

- `/`：产品首页、价值说明、双循环架构与合规边界
- `/dashboard`：企业控制台；首次进入自动出现四步建档引导
- `/match`：自然语言政策匹配、动态分析过程、筛选与结果列表
- `/policy/:id`：政策详情、条件依据、材料清单、风险和倒计时
- `/profile`：企业标准资质档案、财务数据遮罩、合规与 Mock 核验
- `/applications`：申报中心
- `/workspace/:id`：字段映射、AI 文本生成、附件与导出工作台
- `/precheck`：五类材料预审与申报准备度
- `/submit`：材料下载、复制和跳转政府平台确认
- `/progress`：企业手动维护的申报进度时间轴
- `/calendar`：政策截止、内部节点与提醒日历

页面右下角提供全局“苏策通 AI”助手。核心操作均有 Loading、Toast、状态变化或确认弹窗反馈。

## 目录结构

```text
src/
  components/       公共布局、政策卡片、AI 助手、首次建档引导
  pages/            各业务页面
  data.ts           12 条 Mock 政策与默认企业数据
  types.ts          业务类型
  styles.css        全局视觉系统与响应式样式
  onboarding.css    建档引导样式
  App.tsx           路由配置
server/
  index.js          Express API、JWT 鉴权与业务接口
  db.js             SQLite 建表、初始化与种子数据
  data/             自动生成的数据库文件
```

## 数据保存

账号、企业档案、政策、收藏和申报项目保存在本地 SQLite 数据库。JWT 登录令牌与首次建档状态保存在浏览器 `localStorage`。数据仅在本机运行，不会上传至外部服务器。若要重新查看引导，可删除 `subsight-onboarded`。

## 后端接口

- `POST /api/auth/login`：账号登录
- `GET /api/auth/me`：当前用户
- `GET /api/policies`、`GET /api/policies/:id`：政策列表与详情
- `GET /api/enterprise`、`PUT /api/enterprise`：企业档案读取与保存
- `GET /api/applications`、`PATCH /api/applications/:id`：申报项目与进度
- `POST /api/favorites/:policyId`、`DELETE /api/favorites/:policyId`：政策收藏
- `GET /api/health`：服务与数据库健康检查

## 未来 API 接入位置

- `src/pages/Profile.tsx`
  - `verifyCompanyBasicInfo()`
  - `verifyCompanyQualification()`
  - `verifyComplianceStatus()`
- `src/data.ts`：可替换为政策知识库/RAG 查询层
- `src/pages/Match.tsx`：可接入百度千帆 Agent 的意图解析和匹配编排
- `src/pages/Workspace.tsx`：可接入生成式模型与材料模板服务
- `src/pages/Submit.tsx`：仅保留官方平台跳转，不应实现代提交

接入真实服务时建议统一建立 `src/services/`，通过环境变量配置服务地址，并保留当前 Mock fallback 供比赛与离线演示使用。

## GitHub Pages 演示模式

生产构建会自动使用 `/Subsight/` 基础路径，并生成 `404.html` 作为单页路由回退。由于 GitHub Pages 不能运行 Express 与 SQLite，`github.io` 域名下自动启用静态演示登录；演示账号保持不变，政策和企业档案使用内置 Mock 数据。本地运行仍使用真实 Express API 和 SQLite。

## 合规说明

平台结果、金额信息与风险提示仅供企业参考，不构成政府审批意见，也不代表企业必然获得补贴。最终申报资格、审核结果与资金金额以主管部门正式通知为准。
