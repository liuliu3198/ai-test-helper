const blogArticles = [
    {
        id: 1,
        title: "如何用ChatGPT生成高质量测试用例",
        date: "2024-01-15",
        excerpt: "分享使用LLM生成测试用例的提示词技巧和最佳实践，让测试用例编写效率提升10倍",
        content: `# 如何用ChatGPT生成高质量测试用例

## 前言

在软件测试工作中，编写测试用例是一项耗时且需要经验的工作。通过合理使用ChatGPT等AI工具，我们可以大幅提升测试用例编写的效率和质量。

## 核心提示词技巧

### 1. 角色设定
首先给AI设定一个角色，让它以专业的测试工程师身份来工作：

\`\`\`
你是一位资深的测试工程师，擅长编写全面的功能测试用例。
请根据以下需求生成详细的测试用例。
\`\`\`

### 2. 结构化输入
将需求拆分成清晰的结构：

- 功能描述
- 输入条件
- 预期输出
- 边界条件
- 异常情况

### 3. 生成的测试用例类型

#### 正常功能测试
验证功能在正常情况下的行为

#### 异常测试
验证系统在异常输入时的处理

#### 边界值测试
测试输入的边界条件

## 实战示例

输入：
> 用户登录功能
> - 用户名：6-20位字母数字
> - 密码：8-20位
> - 登录成功跳转首页
> - 错误5次锁定

输出：
| 测试项 | 优先级 | 测试步骤 |
|--------|--------|----------|
| 正常登录 | P0 | 输入正确账号密码 |
| 用户名为空 | P0 | 不输入用户名 |
| 密码错误 | P0 | 输入错误密码 |
| 边界测试 | P1 | 测试长度边界值 |

## 总结

AI是辅助工具，最终仍需人工审核和补充。坚持"AI生成+人工优化"的模式，效果最佳。`,
        icon: "🧪"
    },
    {
        id: 2,
        title: "AI辅助缺陷分析实战",
        date: "2024-01-10",
        excerpt: "利用AI快速分析日志，定位bug根因的完整案例分享",
        content: `# AI辅助缺陷分析实战

## 为什么需要AI辅助分析

传统的缺陷分析需要：
- 丰富的经验
- 大量时间阅读日志
- 熟悉系统架构

AI可以帮助我们快速：
- 理解错误堆栈
- 定位可能的问题原因
- 提供解决方案建议

## 实战案例

### 场景描述
用户在支付时出现"支付成功但订单未更新"的异常。

### AI分析提示词

\`\`\`
请分析以下错误日志和代码，帮我定位问题原因：

错误日志：
[ERROR] OrderService.updateOrder() - NullPointerException at line 45
\`\`\`

### AI分析结果

根据错误日志，AI会给出：
1. 可能的根因分析
2. 需要检查的代码位置
3. 建议的修复方案

## 使用技巧

1. 提供完整的错误信息
2. 包含相关代码片段
3. 说明业务场景

## 总结

AI分析可以节省50%以上的缺陷定位时间，但最终修复仍需开发人员确认。`,
        icon: "⚡"
    },
    {
        id: 3,
        title: "自动化测试脚本的AI生成指南",
        date: "2024-01-05",
        excerpt: "如何使用AI快速生成可维护的自动化测试脚本，从Selenium到Playwright",
        content: `# 自动化测试脚本的AI生成指南

## AI生成自动化脚本的优势

- 快速生成基础框架
- 减少重复性工作
- 提供最佳实践参考

## 支持的框架

### Selenium
\`\`\`python
from selenium import webdriver
def test_login():
    driver = webdriver.Chrome()
    driver.get("https://example.com")
\`\`\`

### Playwright
\`\`\`python
from playwright.sync_api import sync_playwright
def test_login():
    with sync_playwright() as p:
        browser = p.chromium.launch()
\`\`\`

## 生成提示词模板

\`\`\`
请用Python+Selenium编写登录测试用例：
1. 打开登录页面
2. 输入用户名密码
3. 点击登录按钮
4. 验证跳转首页
请包含异常处理和等待策略
\`\`\`

## 最佳实践

1. AI生成的代码需要人工审核
2. 添加适当的等待时间
3. 完善异常处理
4. 遵守Page Object模式

## 总结

AI是强大的辅助工具，但自动化测试的核心仍然是测试设计能力。`,
        icon: "🔄"
    },
    {
        id: 4,
        title: "API接口测试从入门到精通",
        date: "2024-01-01",
        excerpt: "全面介绍API接口测试的方法论、工具选择和最佳实践，包含Postman、JMeter实战技巧",
        content: `# API接口测试从入门到精通

## 什么是API接口测试

API（Application Programming Interface）是软件系统间交互的桥梁。接口测试是验证这些桥梁是否正常工作的重要手段。

## API测试的重要性

- 提前发现后端问题
- 提高团队协作效率
- 保证系统稳定性
- 支持持续集成

## 主流API测试工具

### 1. Postman
最流行的API测试工具，支持：
- 手动和自动化测试
- 环境变量管理
- 测试集合
- Mock服务器

### 2. JMeter
适合进行负载测试：
\`\`\`
线程组：100个用户
Ramp-up：10秒
循环次数：5次
\`\`\`

### 3. Apifox
新一代API管理平台：
- API设计
- 文档生成
- Mock数据
- 自动化测试

## RESTful API测试要点

### HTTP方法
- GET：获取资源
- POST：创建资源
- PUT：更新资源
- DELETE：删除资源

### 状态码
- 200：成功
- 201：已创建
- 400：请求错误
- 401：未授权
- 404：资源不存在
- 500：服务器错误

## 实战技巧

### 参数化测试
使用环境变量实现参数化：
\`\`\`javascript
pm.test("用户ID为" + pm.environment.get("userId"), function() {
    pm.response.to.have.status(200);
});
\`\`\`

### 断言库
- JSON Schema验证
- 响应时间检查
- Header验证
- Body内容验证

## 总结

API接口测试是质量保障的重要环节，选择合适的工具并遵循最佳实践，能够显著提升测试效率。`,
        icon: "🌐"
    },
    {
        id: 5,
        title: "什么是Skills？AI测试助手 Skills 功能详解",
        date: "2024-03-01",
        excerpt: "深入了解Skills技能系统，如何上传和管理知识文件，让AI更准确地理解你的测试需求",
        content: `# 什么是Skills？AI测试助手 Skills 功能详解

## Skills是什么

Skills（技能）是我们AI测试助手的核心功能之一。它允许用户上传和管理知识文件，让AI模型能够根据这些文件中的规范和示例来生成更准确的内容。

## 为什么需要Skills

### 1. 定制化输出
通过上传你的测试用例模板、编码规范或业务文档，AI可以按照你的标准生成内容。

### 2. 保证一致性
团队成员可以共享同一套Skills文件，确保AI生成的内容格式统一。

### 3. 知识积累
将经验丰富的测试工程师的知识沉淀下来，AI可以学习并复用。

## 什么是 Skills（技能）？​

简单来说，Skills 就像是给 Claude 准备的“插件包”或“工具箱”。它是一个集合，里面装了特定的操作指令（Instructions）、可执行脚本（Scripts）和相关素材（Resources）。​
当你给 Claude 下达任务时，它会动态加载这些“技能”，从而让它在处理某些特定、专业的工作时，表现得更像个“熟练工”。​
核心机制：按需加载（Progressive Disclosure）​
这是 Skills 最聪明的地方。它不像传统的“长提示词”那样一直占着位子，而是：​
•动态激活：Claude 会先判断你现在的任务需不需要某项技能。​
•节省空间：只有需要时才会加载相关信息，防止对话的上下文（Context Window）太早被撑爆。​
Skills 的三大类型​
1.官方内置技能（Anthropic Skills）：​
◦官方维护的，比如增强版的文档生成（Excel, Word, PPT, PDF）。所有用户都能用，Claude 会根据情况自动调用。​
2.自定义技能（Custom Skills）：​
◦这是最核心的功能。 你可以自己写 Markdown 指令（甚至带上脚本）来训练 Claude 适应你的工作流。​
◦场景举例：让 Claude 永远按照公司的视觉规范做 PPT，或者用公司特定的模板写日报、处理 JIRA 任务。​
3.合作伙伴技能（Partner Skills）：​
◦来自 Notion、Figma、Atlassian 等厂商。它们通常配合 MCP（模型上下文协议）使用，实现跨平台的深度集成。
技术细节（对开发者有用）​
•开放标准：Anthropic 把 Skills 的规范做成了开源标准（agentskills.io），这意味着你写的技能包，理论上将来也能在其他 AI 平台上复用。​
•低代码/全代码：简单的技能只要写 Markdown 文档就行；复杂的技能可以挂载 Python 脚本来实现高级自动化。
## 常见问题

### Q: 文件大小有限制吗？
A: 单个文件建议不超过1MB。

### Q: 支持中文文件名吗？
A: 支持，系统会自动处理中文路径。

### Q: 如何更新Skills文件？
A: 直接删除旧文件，上传新文件即可。

## 总结

Skills功能让AI测试助手更加智能和定制化。通过合理使用Skills，你可以大幅提升测试用例生成的效率和质量。`,
        icon: "🧠"
    }
];

const BLOG_PER_PAGE = 3;
let currentBlogPage = 1;

function renderBlogSection(page = 1) {
    const blogGrid = document.getElementById('blogGrid');
    const paginationContainer = document.getElementById('blogPagination');
    if (!blogGrid) return;
    
    const savedArticles = localStorage.getItem('aiTestHelper_articles');
    const articles = savedArticles ? JSON.parse(savedArticles) : blogArticles;
    
    const start = (page - 1) * BLOG_PER_PAGE;
    const end = start + BLOG_PER_PAGE;
    const pageArticles = articles.slice(start, end);
    const totalPages = Math.ceil(articles.length / BLOG_PER_PAGE);
    
    let html = '<div class="blog-grid">';
    
    pageArticles.forEach(article => {
        html += `
            <article class="blog-card" onclick="openBlogArticle(${article.id})">
                <div class="blog-image">${article.icon || '📝'}</div>
                <div class="blog-content">
                    <span class="blog-date">${article.date}</span>
                    <h3>${article.title}</h3>
                    <p>${article.excerpt}</p>
                    <span class="read-more">阅读全文 →</span>
                </div>
            </article>
        `;
    });
    
    html += '</div>';
    blogGrid.innerHTML = html;
    
    if (paginationContainer) {
        if (totalPages > 1) {
            paginationContainer.innerHTML = `
                <div class="pagination-wrapper">
                    <button onclick="renderBlogSection(${page - 1})" ${page === 1 ? 'disabled' : ''} class="page-btn ${page === 1 ? 'disabled' : ''}">← 上一页</button>
                    <span class="page-info">${page} / ${totalPages}</span>
                    <button onclick="renderBlogSection(${page + 1})" ${page === totalPages ? 'disabled' : ''} class="page-btn ${page === totalPages ? 'disabled' : ''}">下一页 →</button>
                </div>
            `;
        } else {
            paginationContainer.innerHTML = '';
        }
    }
    
    currentBlogPage = page;
}

function openBlogArticle(id) {
    const savedArticles = localStorage.getItem('aiTestHelper_articles');
    const articles = savedArticles ? JSON.parse(savedArticles) : blogArticles;
    const article = articles.find(a => a.id === id);
    if (!article) return;
    
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    
    container.innerHTML = `
        <div class="blog-article">
            <span class="blog-date">${article.date}</span>
            <h2>${article.title}</h2>
            <div class="blog-body">${markdownToHtml(article.content)}</div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function markdownToHtml(md) {
    return md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/\|(.*)\|/gim, (match) => {
            const cells = match.split('|').filter(c => c.trim());
            if (cells.some(c => c.includes('---'))) return '';
            return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
        })
        .replace(/(\n|^)-(.*)/gim, '<li>$2</li>')
        .replace(/<\/li>\n<li>/gim, '</li><li>')
        .replace(/<li>(.*)<\/li>/gim, '<ul><li>$1</li></ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[hplut])/gim, '<p>')
        .replace(/(?<![>])$/gim, '</p>')
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<[hplut])/g, '$1')
        .replace(/(<\/[hplut][^>]*>)<\/p>/g, '$1');
}

function getArticles() {
    const saved = localStorage.getItem('aiTestHelper_articles');
    if (saved) {
        return JSON.parse(saved);
    }
    return blogArticles;
}

function saveArticles(articles) {
    localStorage.setItem('aiTestHelper_articles', JSON.stringify(articles));
    renderBlogSection(currentBlogPage);
}

document.addEventListener('DOMContentLoaded', function() {
    renderBlogSection(1);
});
