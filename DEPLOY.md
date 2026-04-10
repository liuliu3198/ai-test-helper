# AI测试助手 - Vercel 前后端一键部署指南

## 方式一：Vercel 一键部署（推荐）

### 步骤1：推送代码到GitHub
```bash
cd c:\Users\PC\Documents\trae_projects\problem\ai-test-helper
git add .
git commit -m "feat: 优化部署配置"
git push origin main
```

### 步骤2：Vercel 部署
1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "Add New..." → "Project"
4. 选择 `ai-test-helper` 仓库
5. 配置设置：
   - **Framework Preselect**: Other
   - **Build Command**: 留空
   - **Output Directory**: 留空
6. 点击 "Deploy"

### 步骤3：配置环境变量（可选）
部署完成后：
1. 进入项目 Settings → Environment Variables
2. 添加变量：
   - `SILICON_API_KEY`: 你的API Key（从 siliconflow.cn 获取）
3. 重新部署

### 步骤4：访问网站
部署完成后，Vercel 会给你一个 URL，例如：`https://ai-test-helper.vercel.app`

---

## 方式二：分离部署（推荐用于生产）

### 前端：Vercel / GitHub Pages
- **Vercel**: 同方式一
- **GitHub Pages**: Settings → Pages → Deploy from main branch

### 后端：Railway / Render / Fly.io

#### Railway 部署步骤：
1. 访问 https://railway.app
2. 用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择 `ai-test-helper` 仓库
5. 配置环境变量：
   - `PORT`: `3001`
6. 点击 "Deploy"
7. 记录 Railway 给你的 URL（如 `https://ai-test-helper.railway.app`）

#### 修改前端API地址：
部署后端后，需要修改前端指向你的后端地址：
1. 访问你的网站
2. 点击导航栏 "后台"
3. 登录（账号: admin，密码: admin123）
4. 在"后端服务地址"填写你的 Railway URL
5. 保存

---

## 常见问题

### Q: 部署后工具不显示
A: 检查浏览器控制台是否有错误，确保API请求成功

### Q: AI生成功能不工作
A:
1. 确保已配置 API Key（硅基流动 siliconflow.cn）
2. 检查后端服务是否正常运行
3. 在后台测试 API 连接

### Q: 文件上传功能不工作
A: Vercel 免费版无持久化存储，建议使用 Railway（付费版）或外部存储

### Q: 如何更新网站
A: 推送代码到 GitHub 后，Vercel 会自动重新部署

---

## 免费额度
- **Vercel**: 无限流量，100GB存储，100GB带宽/月
- **Railway**: $5免费额度（约500小时运行）
- **硅基流动**: 免费模型额度
