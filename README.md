# AI测试助手

运用AI技能提效测试的个人网站

## 简介

这是一个关于AI在软件测试领域应用的个人网站，提供在线测试工具和博客文章。

## 功能特性

- 📝 智能测试用例生成器
- 🧠 需求转XMind思维导图
- 🔤 正则表达式生成器
- 🗄️ SQL查询生成器
- 🌐 API文档生成器
- 📧 测试报告模板生成
- 🔬 接口测试工具
- 🎲 测试数据生成
- 💻 代码转换器
- 🔐 编码转换工具
- ⏰ 时间戳转换

## 技术栈

- HTML5
- CSS3 (响应式设计)
- JavaScript (原生)
- Node.js + Express (后端)
- Vercel (部署)

## 快速部署

### Vercel 一键部署（前后端一起）

1. 将代码推送到 GitHub 仓库
2. 访问 https://vercel.com
3. 使用 GitHub 登录
4. 点击 "Add New..." → "Project"
5. 选择 `ai-test-helper` 仓库
6. 点击 "Deploy"

详细部署教程见 [DEPLOY.md](./DEPLOY.md)

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/liuliu3198/ai-test-helper.git
cd ai-test-helper

# 安装后端依赖
cd backend
npm install

# 启动后端服务
npm start

# 前端直接用浏览器打开 index.html 或使用静态服务器
npx serve ..
```

## 在线访问

- **Vercel**: https://ai-test-helper.vercel.app
- **GitHub Pages**: https://liuliu3198.github.io/ai-test-helper

## 配置AI功能

1. 注册 [硅基流动](https://siliconflow.cn) 账号
2. 创建 API Key
3. 进入网站后台 → LLM模型配置
4. 填写 API Key 并保存

## 许可证

MIT License
