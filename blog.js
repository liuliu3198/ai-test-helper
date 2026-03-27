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
