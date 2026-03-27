# AI测试助手 - 部署指南

## ✅ 网站已完成

网站文件已创建在 `ai-test-helper` 目录下，包含以下文件：
- `index.html` - 主页面
- `styles.css` - 样式文件
- `script.js` - 交互脚本
- `README.md` - 项目说明

## 🚀 推送到GitHub

由于GitHub自2021年起不再支持密码认证，你需要使用以下方式之一：

### 方式一：使用GitHub CLI（推荐）

1. **安装GitHub CLI**（如果未安装）
   下载地址：https://cli.github.com

2. **在命令行执行以下命令**：

```bash
cd ai-test-helper
gh auth login
# 选择 GitHub.com
# 选择 HTTPS
# 登录你的GitHub账号

gh repo create ai-test-helper --public --source=. --push
```

### 方式二：使用Git Bash + Token

1. **创建Personal Access Token**
   - 登录 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 点击 "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 生成并复制Token

2. **使用Token推送**

```bash
cd ai-test-helper
git remote set-url origin https://YOUR_TOKEN@github.com/liuliu3198/ai-test-helper.git
git push -u origin main
```

### 方式三：手动上传

1. 打开 https://github.com/new
2. 仓库名称填写：`ai-test-helper`
3. 选择 Public
4. 不要勾选 "Add a README file"
5. 点击 "Create repository"
6. 按照页面显示的命令执行：
```bash
cd ai-test-helper
git remote add origin https://github.com/liuliu3198/ai-test-helper.git
git push -u origin main
```

## 🌐 启用GitHub Pages

1. 仓库创建后，进入 Settings → Pages
2. 在 "Build and deployment" 部分：
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 "main"
   - Folder: 选择 "/ (root)"
3. 点击 Save
4. 等待1-2分钟后访问 `https://liuliu3198.github.io/ai-test-helper`

## 📝 网站功能

- ✅ 首页 - 展示AI测试助手定位
- ✅ 关于 - 个人简介和技术栈
- ✅ 工具 - 6个在线可用的小工具
  - 测试用例生成器
  - 需求转XMind
  - 正则表达式生成
  - SQL查询生成
  - API文档生成
  - 测试报告模板
- ✅ 博客 - 展示相关文章
- ✅ 联系 - GitHub链接

## 🎨 自定义修改

修改 `index.html` 中的内容：
- 第47行：网站标题
- 第60行：个人简介
- 第130行：GitHub链接

---

有任何问题随时告诉我！
