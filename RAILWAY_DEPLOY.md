# AI测试助手 - Railway部署指南

## 准备工作

### 1. 创建GitHub仓库
1. 访问 https://github.com/new
2. 仓库名称：`ai-test-helper`
3. 选择 Public
4. 点击 Create repository

### 2. 推送代码到GitHub

```bash
# 进入项目目录
cd ai-test-helper

# 初始化Git（如果未初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: AI测试助手初始化"

# 添加远程仓库（替换 YOUR_USERNAME 为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/ai-test-helper.git

# 推送到GitHub
git push -u origin main
```

## Railway部署步骤

### 1. 注册Railway
1. 访问 https://railway.app
2. 用GitHub账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择刚才创建的仓库 `ai-test-helper`

### 2. 配置后端服务
1. Railway会自动检测为Node.js项目
2. 点击 "Add Variables"
3. 添加环境变量：
   - `PORT`: `3001`
   - `SILICON_API_KEY`: 你的API Key（可选，后续可在后台配置）
4. 点击 "Deploy"

### 3. 获取后端API地址
部署完成后，Railway会给你一个URL，例如：`https://ai-test-helper-backend.railway.app`

### 4. 修改前端API地址
部署后需要修改 `script.js` 中的API地址：

```javascript
// 找到这一行（约第1349行）
const API_BASE_URL = 'http://localhost:3001';

// 改为Railway给的地址，例如：
const API_BASE_URL = 'https://ai-test-helper-backend.railway.app';
```

### 5. 部署前端到Vercel（推荐）

前端静态网站推荐用Vercel部署（免费且快）：

1. 访问 https://vercel.com
2. 用GitHub登录
3. 点击 "Add New..." → "Project"
4. 选择 `ai-test-helper` 仓库
5. 修改配置：
   - Root Directory: `ai-test-helper`（如果前端单独一个文件夹）
   - Build Command: 留空
   - Output Directory: 留空
6. 点击 Deploy

### 6. 访问网站
- 前端：Vercel给的URL，例如：`https://ai-test-helper.vercel.app`
- 后端：Railway给的URL

## 常见问题

### Q: 后端API调用失败
A: 检查前端API地址是否正确指向Railway的URL

### Q: 上传文件功能不工作
A: Railway免费版没有持久化存储，建议：
- 使用付费版
- 或使用外部存储如AWS S3

### Q: 如何更新网站
A: 推送代码到GitHub后，Railway和Vercel会自动重新部署

## 免费额度
- Railway: 每月$5免费额度（约500小时运行）
- Vercel: 无限流量，100GB存储
