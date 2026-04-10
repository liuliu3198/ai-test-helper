const ADMIN_CONFIG = {
    username: 'admin',
    password: 'admin123'
};

function getBackendUrl() {
    if (window.location.protocol === 'file:') {
        return 'http://localhost:3001';
    }
    return window.location.origin + '/api';
}

let isLoggedIn = false;

function checkAdminLogin() {
    const loginStatus = localStorage.getItem('aiTestHelper_adminLogin');
    return loginStatus === 'true';
}

function adminLogin(username, password) {
    if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
        localStorage.setItem('aiTestHelper_adminLogin', 'true');
        return true;
    }
    return false;
}

function adminLogout() {
    localStorage.removeItem('aiTestHelper_adminLogin');
    isLoggedIn = false;
    showLoginPage();
}

function openAdminPanel() {
    if (!checkAdminLogin()) {
        showLoginPage();
        return;
    }
    
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    
    const aboutData = getAboutData();
    
    container.innerHTML = `
        <div class="admin-panel">
            <div class="admin-header">
                <h2>🛠️ 内容管理后台</h2>
                <button class="admin-btn-danger" onclick="adminLogout()">退出登录</button>
            </div>
            
            <div class="admin-section">
                <h3>📝 博客文章管理</h3>
                <div class="article-list" id="articleList">
                    ${renderArticleList()}
                </div>
                <button class="admin-btn-primary" style="margin-top: 1rem;" onclick="showAddArticleForm()">➕ 添加新文章</button>
            </div>
            
            <div class="admin-section">
                <h3>📋 关于我信息</h3>
                <div class="admin-form">
                    <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">个人简介</label>
                    <textarea id="editAboutContent" placeholder="输入个人简介（每段一行）" rows="6">${aboutData.content}</textarea>
                    
                    <label style="font-weight: 600; margin: 1rem 0 0.5rem; display: block;">技术栈（用逗号分隔）</label>
                    <input type="text" id="editAboutSkills" placeholder="Python, Selenium, Playwright, Appium" value="${aboutData.skills.join(', ')}">
                    
                    <button class="admin-btn-secondary" style="margin-top: 1rem;" onclick="saveAbout()">保存</button>
                </div>
            </div>
            
            <div class="admin-section">
                <h3>🛠️ LLM模型配置</h3>
                <div class="admin-form" id="llmConfigForm">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <span>状态：</span>
                        <span id="llmStatus" style="color: var(--secondary-color); font-weight: 600;">加载中...</span>
                    </div>
                    <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">API Provider</label>
                    <select id="llmProvider" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem;">
                        <option value="siliconflow">SiliconFlow</option>
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="custom">自定义</option>
                    </select>
                    <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">API Key</label>
                    <input type="password" id="llmApiKey" placeholder="输入API Key" style="width: 100%;">
                    <label style="font-weight: 600; margin: 1rem 0 0.5rem; display: block;">Base URL</label>
                    <input type="text" id="llmBaseUrl" placeholder="https://api.siliconflow.cn/v1" style="width: 100%;">
                    <label style="font-weight: 600; margin: 1rem 0 0.5rem; display: block;">Model</label>
                    <input type="text" id="llmModel" placeholder="Qwen/Qwen2.5-7B-Instruct" style="width: 100%;">
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button class="admin-btn-primary" onclick="saveLLMConfig()">保存LLM配置</button>
                        <button class="admin-btn-primary" style="background: var(--secondary-color);" onclick="testLLMConfig()">🔗 测试连接</button>
                    </div>
                    <div id="llmTestResult" style="margin-top: 1rem; padding: 1rem; border-radius: 8px; display: none;"></div>
                </div>
            </div>
            
            <div class="admin-section">
                <h3>🛠️ 在线工具配置</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">配置在线工具的显示和Skills关联</p>
                <div class="online-tools-config" id="onlineToolsConfig">
                    <p style="color: var(--text-secondary);">加载中...</p>
                </div>
                <button class="admin-btn-primary" style="margin-top: 1rem;" onclick="saveOnlineToolsConfig()">保存工具配置</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    loadLLMConfig();
    loadOnlineToolsConfig();
}

function showLoginPage() {
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    
    container.innerHTML = `
        <div class="login-form">
            <h2>🔐 管理员登录</h2>
            <div id="loginError" class="login-error"></div>
            <input type="text" id="adminUsername" placeholder="用户名">
            <input type="password" id="adminPassword" placeholder="密码">
            <button onclick="handleLogin()">登录</button>
            <p style="text-align: center; margin-top: 1rem; color: var(--text-secondary); font-size: 0.85rem;">
                默认账号: admin / admin123
            </p>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function handleLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (adminLogin(username, password)) {
        const modal = document.getElementById('toolModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            openAdminPanel();
        }, 100);
    } else {
        errorDiv.textContent = '用户名或密码错误';
    }
}

function renderArticleList() {
    const articles = getArticles();
    return articles.map(article => `
        <div class="article-item">
            <div class="article-item-info">
                <h4>${article.title}</h4>
                <span>${article.date}</span>
            </div>
            <div class="article-item-actions">
                <button class="admin-btn-secondary" onclick="editArticle(${article.id})">编辑</button>
                <button class="admin-btn-danger" onclick="deleteArticle(${article.id})">删除</button>
            </div>
        </div>
    `).join('');
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
    renderBlogSection();
}

function showAddArticleForm() {
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    
    container.innerHTML = `
        <div class="admin-panel">
            <div class="admin-header">
                <h2>➕ 添加新文章</h2>
                <button class="admin-btn-secondary" onclick="openAdminPanel()">返回</button>
            </div>
            <div class="admin-form">
                <input type="text" id="articleTitle" placeholder="文章标题">
                <input type="text" id="articleDate" placeholder="日期 (YYYY-MM-DD)" value="${new Date().toISOString().split('T')[0]}">
                <input type="text" id="articleIcon" placeholder="图标 (如 🧪)" value="📝">
                <input type="text" id="articleExcerpt" placeholder="文章摘要">
                <textarea id="articleContent" placeholder="文章内容 (支持Markdown格式)"></textarea>
                <div style="display: flex; gap: 1rem;">
                    <button class="admin-btn-primary" onclick="saveNewArticle()">保存文章</button>
                    <button class="admin-btn-secondary" onclick="openAdminPanel()">取消</button>
                </div>
            </div>
        </div>
    `;
}

function saveNewArticle() {
    const title = document.getElementById('articleTitle').value;
    const date = document.getElementById('articleDate').value;
    const icon = document.getElementById('articleIcon').value;
    const excerpt = document.getElementById('articleExcerpt').value;
    const content = document.getElementById('articleContent').value;
    
    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }
    
    const articles = getArticles();
    const newArticle = {
        id: Date.now(),
        title,
        date,
        icon,
        excerpt,
        content
    };
    
    articles.unshift(newArticle);
    saveArticles(articles);
    openAdminPanel();
}

function editArticle(id) {
    const articles = getArticles();
    const article = articles.find(a => a.id === id);
    if (!article) return;
    
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    
    container.innerHTML = `
        <div class="admin-panel">
            <div class="admin-header">
                <h2>✏️ 编辑文章</h2>
                <button class="admin-btn-secondary" onclick="openAdminPanel()">返回</button>
            </div>
            <div class="admin-form">
                <input type="text" id="editArticleTitle" placeholder="文章标题" value="${article.title}">
                <input type="text" id="editArticleDate" placeholder="日期" value="${article.date}">
                <input type="text" id="editArticleIcon" placeholder="图标" value="${article.icon}">
                <input type="text" id="editArticleExcerpt" placeholder="文章摘要" value="${article.excerpt}">
                <textarea id="editArticleContent" placeholder="文章内容">${article.content}</textarea>
                <div style="display: flex; gap: 1rem;">
                    <button class="admin-btn-primary" onclick="updateArticle(${id})">保存修改</button>
                    <button class="admin-btn-secondary" onclick="openAdminPanel()">取消</button>
                </div>
            </div>
        </div>
    `;
}

function updateArticle(id) {
    const articles = getArticles();
    const index = articles.findIndex(a => a.id === id);
    
    if (index === -1) return;
    
    articles[index] = {
        ...articles[index],
        title: document.getElementById('editArticleTitle').value,
        date: document.getElementById('editArticleDate').value,
        icon: document.getElementById('editArticleIcon').value,
        excerpt: document.getElementById('editArticleExcerpt').value,
        content: document.getElementById('editArticleContent').value
    };
    
    saveArticles(articles);
    openAdminPanel();
}

function deleteArticle(id) {
    if (!confirm('确定要删除这篇文章吗？')) return;
    
    let articles = getArticles();
    articles = articles.filter(a => a.id !== id);
    saveArticles(articles);
    
    const articleList = document.getElementById('articleList');
    if (articleList) {
        articleList.innerHTML = renderArticleList();
    }
}

function saveAbout() {
    const contentEl = document.getElementById('editAboutContent');
    const skillsEl = document.getElementById('editAboutSkills');
    
    if (!contentEl || !skillsEl) {
        alert('页面元素未找到，请刷新页面重试');
        return;
    }
    
    const content = contentEl.value;
    const skillsStr = skillsEl.value;
    const skills = skillsStr.split(',').map(s => s.trim()).filter(s => s);
    
    const aboutData = {
        content,
        skills
    };
    
    localStorage.setItem('aiTestHelper_about', JSON.stringify(aboutData));
    
    const modal = document.getElementById('toolModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Refresh the about section and blog section after saving
    if (typeof renderAboutSection === 'function') {
        renderAboutSection();
    }
    if (typeof renderBlogSection === 'function') {
        renderBlogSection();
    }
    
    alert('保存成功！');
}

function getAboutData() {
    const saved = localStorage.getItem('aiTestHelper_about');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return getDefaultAboutData();
        }
    }
    return getDefaultAboutData();
}

function getDefaultAboutData() {
    return {
        content: `你好！我是AI测试助手的创建者，专注于探索AI在软件测试领域的应用。

在软件测试行业工作多年，我深刻体会到传统测试方法的局限性。通过不断学习和实践，我发现AI技术可以极大地提升测试效率，让测试工程师有更多时间专注于高价值的测试策略和创新工作。

这个网站汇集了我在AI测试领域的经验和工具，希望能够帮助更多的测试工程师提升工作效率。`,
        skills: ['Python', 'Selenium', 'Playwright', 'Appium', 'LLM', 'Prompt Engineering', 'API Testing', 'CI/CD']
    };
}

async function loadLLMConfig() {
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/llm/config`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('llmProvider').value = data.config.provider || 'siliconflow';
            document.getElementById('llmApiKey').value = data.config.apiKey || '';
            document.getElementById('llmBaseUrl').value = data.config.baseUrl || 'https://api.siliconflow.cn/v1';
            document.getElementById('llmModel').value = data.config.model || 'Qwen/Qwen2.5-7B-Instruct';
            document.getElementById('llmStatus').textContent = data.config.apiKey ? '✅ 已配置' : '❌ 未配置';
            document.getElementById('llmStatus').style.color = data.config.apiKey ? 'var(--secondary-color)' : '#ef4444';
        }
    } catch (error) {
        document.getElementById('llmStatus').textContent = '❌ 连接失败';
        document.getElementById('llmStatus').style.color = '#ef4444';
    }
}

async function testLLMConfig() {
    const apiKey = document.getElementById('llmApiKey').value.trim();
    const baseUrl = document.getElementById('llmBaseUrl').value.trim();
    const model = document.getElementById('llmModel').value.trim();
    const resultDiv = document.getElementById('llmTestResult');
    
    if (!apiKey || !baseUrl || !model) {
        resultDiv.style.display = 'block';
        resultDiv.style.background = '#fee2e2';
        resultDiv.textContent = '❌ 请先填写API Key、Base URL和Model';
        return;
    }
    
    resultDiv.style.display = 'block';
    resultDiv.style.background = '#fef3c7';
    resultDiv.textContent = '🔄 正在测试连接...';
    
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/llm/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey, baseUrl, model })
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultDiv.style.background = '#d1fae5';
            resultDiv.innerHTML = `✅ 连接成功！<br><br>模型回复：<br><div style="margin-top: 0.5rem; padding: 0.75rem; background: white; border-radius: 4px; font-style: italic;">${data.content}</div>`;
            document.getElementById('llmStatus').textContent = '✅ 已配置';
            document.getElementById('llmStatus').style.color = 'var(--secondary-color)';
        } else {
            resultDiv.style.background = '#fee2e2';
            resultDiv.textContent = '❌ 连接失败: ' + data.error;
            document.getElementById('llmStatus').textContent = '❌ 连接失败';
            document.getElementById('llmStatus').style.color = '#ef4444';
        }
    } catch (error) {
        resultDiv.style.background = '#fee2e2';
        resultDiv.textContent = '❌ 连接失败: ' + error.message;
        document.getElementById('llmStatus').textContent = '❌ 连接失败';
        document.getElementById('llmStatus').style.color = '#ef4444';
    }
}

async function saveLLMConfig() {
    const apiKey = document.getElementById('llmApiKey').value.trim();
    const baseUrl = document.getElementById('llmBaseUrl').value.trim();
    const model = document.getElementById('llmModel').value.trim();
    const llmStatus = document.getElementById('llmStatus');
    
    if (!apiKey) {
        llmStatus.textContent = '❌ 请填写API Key';
        llmStatus.style.color = '#ef4444';
        alert('请填写API Key，这是必填项！');
        return;
    }
    
    if (!baseUrl) {
        alert('请填写Base URL！');
        return;
    }
    
    if (!model) {
        alert('请填写Model！');
        return;
    }
    
    const config = {
        provider: document.getElementById('llmProvider').value,
        apiKey: apiKey,
        baseUrl: baseUrl,
        model: model
    };
    
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/llm/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        const data = await response.json();
        
        if (data.success) {
            llmStatus.textContent = '✅ 已配置';
            llmStatus.style.color = 'var(--secondary-color)';
            alert('LLM配置已保存！');
            loadLLMConfig();
        } else {
            llmStatus.textContent = '❌ 保存失败';
            llmStatus.style.color = '#ef4444';
            alert('保存失败: ' + data.error);
        }
    } catch (error) {
        llmStatus.textContent = '❌ 保存失败';
        llmStatus.style.color = '#ef4444';
        alert('保存失败: ' + error.message);
    }
}

function toggleToolOptions(toolKey) {
    const toolCheckbox = document.getElementById(`tool_${toolKey}`);
    const coreCheckbox = document.getElementById(`core_${toolKey}`);
    const fileInput = document.getElementById(`file_${toolKey}`);
    const toolCard = toolCheckbox.closest('div[style*="border-radius"]');
    
    if (toolCheckbox.checked) {
        coreCheckbox.disabled = false;
        fileInput.disabled = false;
        toolCard.style.opacity = '1';
        coreCheckbox.closest('label').style.opacity = '1';
        coreCheckbox.closest('label').style.cursor = 'pointer';
        toolCard.querySelector('div:last-child').style.opacity = '1';
        toolCard.querySelector('label').style.background = 'var(--primary-color)';
        toolCard.querySelector('label').style.cursor = 'pointer';
    } else {
        coreCheckbox.disabled = true;
        coreCheckbox.checked = false;
        fileInput.disabled = true;
        toolCard.style.opacity = '0.6';
        coreCheckbox.closest('label').style.opacity = '0.5';
        coreCheckbox.closest('label').style.cursor = 'not-allowed';
        toolCard.querySelector('div:last-child').style.opacity = '0.5';
        toolCard.querySelector('label').style.background = '#ccc';
        toolCard.querySelector('label').style.cursor = 'not-allowed';
    }
}

async function loadOnlineToolsConfig() {
    try {
        const backendUrl = getBackendUrl();
        const [toolsRes, filesRes] = await Promise.all([
            fetch(`${backendUrl}/api/online-tools`),
            fetch(`${backendUrl}/api/tools/files`)
        ]);
        
        const toolsData = await toolsRes.json();
        const filesData = await filesRes.json();
        
        const tools = [
            { key: 'testcase', name: '测试用例生成器', icon: '📋', desc: '基于需求文档自动生成测试用例' },
            { key: 'xmind', name: '需求转XMind', icon: '🧠', desc: '将文字需求转换为思维导图结构' },
            { key: 'regexp', name: '正则表达式生成', icon: '🔤', desc: '描述你想要匹配的内容，AI帮你写正则' },
            { key: 'sql', name: 'SQL查询生成', icon: '🗄️', desc: '用自然语言描述你想查询的数据' },
            { key: 'api', name: 'API文档生成', icon: '🌐', desc: '根据接口描述生成API文档' },
            { key: 'email', name: '测试报告模板', icon: '📧', desc: '快速生成专业的测试报告' },
            { key: 'apitest', name: '接口测试工具', icon: '🔬', desc: '在线发送HTTP请求，测试API接口' },
            { key: 'faker', name: '测试数据生成', icon: '🎲', desc: '生成各种类型的测试数据' },
            { key: 'json', name: 'JSON格式化', icon: '📄', desc: '格式化、校验、压缩JSON数据' },
            { key: 'coder', name: '代码转换器', icon: '💻', desc: '代码格式互转，如JSON转Java实体类' },
            { key: 'encoder', name: '编码转换工具', icon: '🔐', desc: 'URL编码、Base64、MD5等编码转换' },
            { key: 'timestamp', name: '时间戳转换', icon: '⏰', desc: '时间戳与日期格式互转' }
        ];
        
        const configTools = toolsData.tools || tools.map(t => ({ ...t, enabled: true, showInCore: false, skills: [] }));
        const skillsFiles = filesData.success ? filesData.skillsFiles : {};
        
        const container = document.getElementById('onlineToolsConfig');
        
        container.innerHTML = tools.map(tool => {
            const config = configTools.find(t => t.key === tool.key) || { enabled: true, showInCore: false, skills: [] };
            const toolFiles = skillsFiles[tool.key] || [];
            const isDisabled = !config.enabled;
            
            return `
                <div style="background: white; border: 2px solid var(--border-color); border-radius: 12px; margin-bottom: 1rem; overflow: hidden; opacity: ${isDisabled ? '0.6' : '1'};">
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--border-color);">
                        <input type="checkbox" id="tool_${tool.key}" ${config.enabled ? 'checked' : ''} style="width: 20px; height: 20px;" onchange="toggleToolOptions('${tool.key}')">
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${tool.icon} ${tool.name}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">${tool.desc}</div>
                        </div>
                        <span style="font-size: 0.8rem; color: ${config.enabled ? 'var(--secondary-color)' : '#999'};">${config.enabled ? '✓ 已启用' : '○ 已禁用'}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: var(--bg-color); border-bottom: 1px solid var(--border-color);">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; opacity: ${isDisabled ? '0.5' : '1'};">
                            <input type="checkbox" id="core_${tool.key}" ${config.showInCore ? 'checked' : ''} ${isDisabled ? 'disabled' : ''} style="width: 18px; height: 18px;">
                            <span style="font-size: 0.85rem;">⭐ 展示在核心能力</span>
                        </label>
                    </div>
                    <div style="padding: 1rem; opacity: ${isDisabled ? '0.5' : '1'};">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                            <span style="font-weight: 600; font-size: 0.9rem;">📁 Skills知识文件</span>
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">(${toolFiles.length}个文件)</span>
                        </div>
                        <div id="toolFiles_${tool.key}">
                            ${toolFiles.length > 0 ? toolFiles.map(f => `
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: var(--bg-color); border-radius: 6px; margin-bottom: 0.5rem;">
                                    <span style="font-size: 0.85rem;">📄 ${f.originalName || f.name}</span>
                                    ${!isDisabled ? `<button onclick="deleteToolSkillFile('${tool.key}', '${f.filename || f.name}')" style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">删除</button>` : ''}
                                </div>
                            `).join('') : '<p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">暂无上传文件</p>'}
                        </div>
                        <label style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: ${isDisabled ? '#ccc' : 'var(--primary-color)'}; color: white; border-radius: 6px; cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; font-size: 0.85rem; margin-top: 0.5rem;">
                            <span>⬆️ 上传Skills文件</span>
                            <input type="file" id="file_${tool.key}" style="display: none;" onchange="uploadToolSkillFile('${tool.key}', '${tool.name}', this)" ${isDisabled ? 'disabled' : ''} webkitdirectory multiple>
                        </label>
                        <span id="uploadStatus_${tool.key}" style="margin-left: 0.5rem; font-size: 0.8rem;"></span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        document.getElementById('onlineToolsConfig').innerHTML = '<p style="color: #ef4444;">加载失败: ' + error.message + '</p>';
    }
}

async function uploadToolSkillFile(toolKey, toolName, input) {
    const files = input.files;
    if (!files || files.length === 0) return;
    
    const statusEl = document.getElementById(`uploadStatus_${toolKey}`);
    statusEl.textContent = '上传中...';
    statusEl.style.color = 'var(--primary-color)';
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    formData.append('toolKey', toolKey);
    formData.append('toolName', toolName);
    
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/tools/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            const count = data.filenames ? data.filenames.length : files.length;
            statusEl.textContent = `✅ 上传成功 (${count}个文件)`;
            statusEl.style.color = 'var(--secondary-color)';
            loadOnlineToolsConfig();
        } else {
            statusEl.textContent = '❌ ' + data.error;
            statusEl.style.color = '#ef4444';
        }
    } catch (error) {
        statusEl.textContent = '❌ 上传失败';
        statusEl.style.color = '#ef4444';
    }
    
    input.value = '';
}

async function deleteToolSkillFile(toolKey, filename) {
    if (!confirm('此操作不可撤销，确定要删除该文件吗？')) return;
    
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/tools/files/${toolKey}/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            loadOnlineToolsConfig();
        } else {
            alert('删除失败: ' + data.error);
        }
    } catch (error) {
        alert('删除失败: ' + error.message);
    }
}

async function saveOnlineToolsConfig() {
    const toolCheckboxes = document.querySelectorAll('#onlineToolsConfig input[id^="tool_"]');
    const coreCheckboxes = document.querySelectorAll('#onlineToolsConfig input[id^="core_"]');
    
    const tools = [];
    
    toolCheckboxes.forEach((checkbox, index) => {
        const toolKey = checkbox.id.replace('tool_', '');
        const isCoreChecked = document.getElementById(`core_${toolKey}`).checked;
        
        tools.push({
            key: toolKey,
            enabled: checkbox.checked,
            showInCore: isCoreChecked
        });
    });
    
    const coreTools = tools.filter(t => t.showInCore).map(t => t.key);
    
    try {
        const backendUrl = getBackendUrl();
        const [toolsRes, coreRes] = await Promise.all([
            fetch(`${backendUrl}/api/online-tools`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tools })
            }),
            fetch(`${backendUrl}/api/core-features`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: coreTools })
            })
        ]);
        
        const toolsData = await toolsRes.json();
        const coreData = await coreRes.json();
        
        if (toolsData.success && coreData.success) {
            alert('在线工具配置已保存！');
            loadOnlineToolsConfig();
        } else {
            alert('保存失败');
        }
    } catch (error) {
        alert('保存失败: ' + error.message);
    }
}

async function loadSkillsConfig() {
    try {
        const backendUrl = getBackendUrl();
        const [configRes, filesRes, coreRes] = await Promise.all([
            fetch(`${backendUrl}/api/skills/config`),
            fetch(`${backendUrl}/api/skills/files`),
            fetch(`${backendUrl}/api/core-features`)
        ]);
        
        const configData = await configRes.json();
        const filesData = await filesRes.json();
        const coreData = await coreRes.json();
        
        if (configData.success) {
            const container = document.getElementById('skillsConfig');
            const skillsFiles = filesData.success ? filesData.skillsFiles : {};
            const coreFeatures = coreData.features || [];
            
            container.innerHTML = configData.skills.map(skill => {
                const skillFiles = skillsFiles[skill.id]?.files || [];
                const isInCore = coreFeatures.includes(skill.id.toString());
                return `
                    <div style="background: white; border: 2px solid var(--border-color); border-radius: 12px; margin-bottom: 1rem; overflow: hidden;">
                        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--border-color);">
                            <input type="checkbox" id="skill_${skill.id}" ${skill.enabled ? 'checked' : ''} style="width: 20px; height: 20px;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">${skill.name}</div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">${skill.description}</div>
                            </div>
                            <span style="font-size: 0.8rem; color: ${skill.enabled ? 'var(--secondary-color)' : '#999'};">${skill.enabled ? '✓ 已启用' : '○ 已禁用'}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: var(--bg-color); border-bottom: 1px solid var(--border-color);">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="core_${skill.id}" ${isInCore ? 'checked' : ''} style="width: 18px; height: 18px;">
                                <span style="font-size: 0.85rem;">⭐ 展示在核心能力</span>
                            </label>
                        </div>
                        <div style="padding: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                                <span style="font-weight: 600; font-size: 0.9rem;">📁 知识文件</span>
                                <span style="font-size: 0.8rem; color: var(--text-secondary);">(${skillFiles.length}个文件)</span>
                            </div>
                            <div id="skillFiles_${skill.id}">
                                ${skillFiles.length > 0 ? skillFiles.map(f => `
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: var(--bg-color); border-radius: 6px; margin-bottom: 0.5rem;">
                                        <span style="font-size: 0.85rem;">📄 ${f.originalName}</span>
                                        <button onclick="deleteSkillFile(${skill.id}, '${f.filename}')" style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">删除</button>
                                    </div>
                                `).join('') : '<p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">暂无上传文件</p>'}
                            </div>
                            <label style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border-radius: 6px; cursor: pointer; font-size: 0.85rem; margin-top: 0.5rem;">
                                <span>⬆️ 上传文件</span>
                                <input type="file" id="file_${skill.id}" style="display: none;" onchange="uploadSkillFile(${skill.id}, '${skill.name}', this)">
                            </label>
                            <span id="uploadStatus_${skill.id}" style="margin-left: 0.5rem; font-size: 0.8rem;"></span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        document.getElementById('skillsConfig').innerHTML = '<p style="color: #ef4444;">加载失败: ' + error.message + '</p>';
    }
}

async function uploadSkillFile(skillId, skillName, input) {
    const file = input.files[0];
    if (!file) return;
    
    const statusEl = document.getElementById(`uploadStatus_${skillId}`);
    statusEl.textContent = '上传中...';
    statusEl.style.color = 'var(--primary-color)';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('skillId', skillId);
    formData.append('skillName', skillName);
    
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/skills/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            statusEl.textContent = '✅ 上传成功';
            statusEl.style.color = 'var(--secondary-color)';
            loadSkillsConfig();
        } else {
            statusEl.textContent = '❌ ' + data.error;
            statusEl.style.color = '#ef4444';
        }
    } catch (error) {
        statusEl.textContent = '❌ 上传失败';
        statusEl.style.color = '#ef4444';
    }
    
    input.value = '';
}

async function deleteSkillFile(skillId, filename) {
    if (!confirm('确定要删除这个文件吗？')) return;
    
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/skills/files/${skillId}/${filename}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadSkillsConfig();
        } else {
            alert('删除失败: ' + data.error);
        }
    } catch (error) {
        alert('删除失败: ' + error.message);
    }
}

async function saveSkillsConfig() {
    const skillCheckboxes = document.querySelectorAll('#skillsConfig input[id^="skill_"]');
    const coreCheckboxes = document.querySelectorAll('#skillsConfig input[id^="core_"]');
    
    const skills = [];
    const coreFeatures = [];
    
    skillCheckboxes.forEach((checkbox, index) => {
        const skillId = index + 1;
        skills.push({
            id: skillId,
            name: ['需求分析', '测试设计', '自动化测试', '缺陷分析', '性能测试', '安全测试'][index] || `技能${index+1}`,
            description: ['分析需求文档，提取测试点', '设计测试用例和测试策略', '编写自动化测试脚本', '分析缺陷原因和影响', '进行性能测试和调优', '进行安全测试和漏洞扫描'][index] || '',
            enabled: checkbox.checked
        });
    });
    
    coreCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            coreFeatures.push(checkbox.id.replace('core_', ''));
        }
    });
    
    try {
        const backendUrl = getBackendUrl();
        const [skillsRes, coreRes] = await Promise.all([
            fetch(`${backendUrl}/api/skills/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(skills)
            }),
            fetch(`${backendUrl}/api/core-features`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: coreFeatures })
            })
        ]);
        
        const skillsData = await skillsRes.json();
        const coreData = await coreRes.json();
        
        if (skillsData.success && coreData.success) {
            alert('技能配置和核心能力展示配置已保存！');
        } else {
            alert('保存失败');
        }
    } catch (error) {
        alert('保存失败: ' + error.message);
    }
}
