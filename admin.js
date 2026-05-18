const ADMIN_CONFIG = {
    username: 'admin',
    password: 'admin123'
};

function getBackendUrl() {
    const currentHost = window.location.hostname;
    const isLocal = currentHost === 'localhost' || currentHost === '127.0.0.1' || window.location.protocol === 'file:';
    
    if (isLocal) {
        return 'http://localhost:3001';
    }
    
    return window.location.origin;
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
                    <select id="llmProvider" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem;" onchange="updateBaseUrlByProvider()">
                        <option value="siliconflow">SiliconFlow (硅基流动)</option>
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="azure">Azure OpenAI</option>
                        <option value="google">Google Gemini</option>
                        <option value="baidu">百度文心一言</option>
                        <option value="ali">阿里云通义千问</option>
                        <option value="tencent">腾讯混元大模型</option>
                        <option value="bytedance">火山引擎 (豆包)</option>
                        <option value="custom">自定义</option>
                    </select>
                    <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">API Key</label>
                    <div style="position: relative; width: 100%;">
                        <input type="password" id="llmApiKey" placeholder="输入API Key" style="width: 100%; padding-right: 40px;">
                        <button type="button" onclick="toggleApiKeyVisibility()" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; color: var(--text-secondary);">
                            👁️
                        </button>
                    </div>
                    <label style="font-weight: 600; margin: 1rem 0 0.5rem; display: block;">Base URL</label>
                    <input type="text" id="llmBaseUrl" placeholder="https://api.siliconflow.cn/v1" style="width: 100%;">
                    <label style="font-weight: 600; margin: 1rem 0 0.5rem; display: block;">Model</label>
                    <input type="text" id="llmModel" list="modelList" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem;" placeholder="选择或输入模型名称">
                    <datalist id="modelList"></datalist>
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
            <h2>🔐 登录 / 注册</h2>
            
            <div id="loginError" class="login-error"></div>
            
            <div id="loginTab_password" class="login-tab-content active">
                <input type="text" id="adminUsername" placeholder="用户名 / 手机号 / 邮箱">
                <input type="password" id="adminPassword" placeholder="密码">
                <button onclick="handleLogin()">登录</button>
                <div class="login-form-footer">
                    <p class="login-hint">默认账号: admin / admin123</p>
                    <p class="login-register">
                        还没有账号？<a href="javascript:void(0)" onclick="showRegisterForm()" style="color: var(--primary-color);">立即注册</a>
                    </p>
                </div>
            </div>
            
            <div id="loginTab_wework" class="login-tab-content">
                <div style="text-align: center; padding: 2rem 0;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🏢</div>
                    <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">使用企业微信扫码登录</p>
                    <div style="background: #f5f5f5; padding: 2rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="color: var(--text-secondary); font-size: 0.85rem;">请使用企业微信扫描下方二维码</p>
                        <div style="margin-top: 1rem; padding: 1rem; background: white; border: 2px dashed var(--border-color); border-radius: 4px;">
                            <p style="color: var(--text-secondary);">📱 企业微信二维码</p>
                            <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem;">（请配置企业微信自建应用）</p>
                        </div>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">扫码后将自动登录，无需注册</p>
                </div>
            </div>
            
            <div id="loginTab_phone" class="login-tab-content">
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <select id="phonePrefix" style="padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: white;">
                        <option value="+86">+86</option>
                        <option value="+852">+852</option>
                        <option value="+853">+853</option>
                        <option value="+886">+886</option>
                    </select>
                    <input type="tel" id="phoneNumber" placeholder="手机号" style="flex: 1;">
                </div>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <input type="text" id="phoneCode" placeholder="验证码" style="flex: 1;">
                    <button onclick="sendPhoneCode()" id="sendCodeBtn" style="padding: 0.75rem; white-space: nowrap;">发送验证码</button>
                </div>
                <button onclick="handlePhoneLogin()" style="width: 100%; padding: 0.875rem;">登录 / 注册</button>
                <p class="login-hint" style="margin-top: 1rem;">未注册手机号将自动创建账号</p>
            </div>
            
            <div id="loginTab_email" class="login-tab-content">
                <input type="email" id="emailAddress" placeholder="邮箱地址">
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <input type="text" id="emailCode" placeholder="验证码" style="flex: 1;">
                    <button onclick="sendEmailCode()" id="sendEmailCodeBtn" style="padding: 0.75rem; white-space: nowrap;">发送验证码</button>
                </div>
                <button onclick="handleEmailLogin()" style="width: 100%; padding: 0.875rem;">登录 / 注册</button>
                <p class="login-hint" style="margin-top: 1rem;">未注册邮箱将自动创建账号</p>
            </div>
            
            <div id="registerForm" class="login-tab-content" style="display: none;">
                <div style="margin-bottom: 1rem;">
                    <select id="registerType" onchange="updateRegisterFields()" style="width: 100%; padding: 0.875rem; border: 2px solid var(--border-color); border-radius: 8px; font-size: 1rem; margin-bottom: 1rem;">
                        <option value="username">用户名注册</option>
                        <option value="phone">手机号注册</option>
                        <option value="email">邮箱注册</option>
                    </select>
                </div>
                <div id="registerUsernameField">
                    <input type="text" id="registerUsername" placeholder="用户名">
                    <input type="password" id="registerPassword" placeholder="密码">
                    <input type="password" id="registerPasswordConfirm" placeholder="确认密码">
                </div>
                <div id="registerPhoneField" style="display: none;">
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <select id="registerPhonePrefix" style="padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: white;">
                            <option value="+86">+86</option>
                            <option value="+852">+852</option>
                            <option value="+853">+853</option>
                            <option value="+886">+886</option>
                        </select>
                        <input type="tel" id="registerPhoneNumber" placeholder="手机号" style="flex: 1;">
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <input type="text" id="registerPhoneCode" placeholder="验证码" style="flex: 1;">
                        <button onclick="sendRegisterPhoneCode()" id="sendRegisterCodeBtn" style="padding: 0.75rem; white-space: nowrap;">发送验证码</button>
                    </div>
                </div>
                <div id="registerEmailField" style="display: none;">
                    <input type="email" id="registerEmailAddress" placeholder="邮箱地址">
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <input type="text" id="registerEmailCode" placeholder="验证码" style="flex: 1;">
                        <button onclick="sendRegisterEmailCode()" id="sendRegisterEmailCodeBtn" style="padding: 0.75rem; white-space: nowrap;">发送验证码</button>
                    </div>
                </div>
                <button onclick="handleRegister()" style="width: 100%; padding: 0.875rem;">注册</button>
                <p class="login-register" style="margin-top: 1rem;">
                    已有账号？<a href="javascript:void(0)" onclick="showLoginForm()" style="color: var(--primary-color);">立即登录</a>
                </p>
            </div>
            
            <div class="login-divider">
                <span>其他登录方式</span>
            </div>
            
            <div class="social-login">
                <div onclick="switchLoginTab('wework')" class="social-login-item">
                    <span>🏢</span>
                    <span>企业微信</span>
                </div>
                <div onclick="switchLoginTab('phone')" class="social-login-item">
                    <span>📱</span>
                    <span>手机号</span>
                </div>
                <div onclick="switchLoginTab('email')" class="social-login-item">
                    <span>📧</span>
                    <span>邮箱</span>
                </div>
                <div onclick="showWechatLogin()" class="social-login-item">
                    <span>💬</span>
                    <span>微信</span>
                </div>
                <div onclick="showQQLogin()" class="social-login-item">
                    <span>🐧</span>
                    <span>QQ</span>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function handleLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!username || !password) {
        errorDiv.textContent = '请输入用户名和密码';
        return;
    }
    
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

function switchLoginTab(tabName) {
    const tabs = document.querySelectorAll('.login-tab');
    const contents = document.querySelectorAll('.login-tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    const activeTab = document.querySelector(`[onclick="switchLoginTab('${tabName}')"]`);
    const activeContent = document.getElementById(`loginTab_${tabName}`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

function sendPhoneCode() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    const phonePrefix = document.getElementById('phonePrefix').value;
    const errorDiv = document.getElementById('loginError');
    const sendBtn = document.getElementById('sendCodeBtn');
    
    if (!phoneNumber) {
        errorDiv.textContent = '请输入手机号';
        return;
    }
    
    const fullPhone = phonePrefix + phoneNumber;
    
    errorDiv.textContent = '正在发送验证码...';
    sendBtn.disabled = true;
    
    setTimeout(() => {
        alert('验证码已发送至 ' + fullPhone + '\n演示模式：验证码为 123456');
        errorDiv.textContent = '';
        
        let countdown = 60;
        const timer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(timer);
                sendBtn.textContent = '发送验证码';
                sendBtn.disabled = false;
            } else {
                sendBtn.textContent = `${countdown}秒后重试`;
            }
        }, 1000);
    }, 1000);
}

function handlePhoneLogin() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    const phoneCode = document.getElementById('phoneCode').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!phoneNumber) {
        errorDiv.textContent = '请输入手机号';
        return;
    }
    
    if (!phoneCode) {
        errorDiv.textContent = '请输入验证码';
        return;
    }
    
    if (phoneCode === '123456') {
        errorDiv.textContent = '';
        
        const modal = document.getElementById('toolModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            alert('登录成功！\n手机号：' + document.getElementById('phonePrefix').value + phoneNumber + '\n\n提示：演示模式，请配置真实短信服务');
            openAdminPanel();
        }, 100);
    } else {
        errorDiv.textContent = '验证码错误（演示验证码：123456）';
    }
}

function sendEmailCode() {
    const emailAddress = document.getElementById('emailAddress').value;
    const errorDiv = document.getElementById('loginError');
    const sendBtn = document.getElementById('sendEmailCodeBtn');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailAddress || !emailRegex.test(emailAddress)) {
        errorDiv.textContent = '请输入有效的邮箱地址';
        return;
    }
    
    errorDiv.textContent = '正在发送验证码...';
    sendBtn.disabled = true;
    
    setTimeout(() => {
        alert('验证码已发送至 ' + emailAddress + '\n演示模式：验证码为 123456');
        errorDiv.textContent = '';
        
        let countdown = 60;
        const timer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(timer);
                sendBtn.textContent = '发送验证码';
                sendBtn.disabled = false;
            } else {
                sendBtn.textContent = `${countdown}秒后重试`;
            }
        }, 1000);
    }, 1000);
}

function handleEmailLogin() {
    const emailAddress = document.getElementById('emailAddress').value;
    const emailCode = document.getElementById('emailCode').value;
    const errorDiv = document.getElementById('loginError');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailAddress || !emailRegex.test(emailAddress)) {
        errorDiv.textContent = '请输入有效的邮箱地址';
        return;
    }
    
    if (!emailCode) {
        errorDiv.textContent = '请输入验证码';
        return;
    }
    
    if (emailCode === '123456') {
        errorDiv.textContent = '';
        
        const modal = document.getElementById('toolModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            alert('登录成功！\n邮箱：' + emailAddress + '\n\n提示：演示模式，请配置真实邮件服务');
            openAdminPanel();
        }, 100);
    } else {
        errorDiv.textContent = '验证码错误（演示验证码：123456）';
    }
}

function showWechatLogin() {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = '';
    switchLoginTab('wework');
}

function showQQLogin() {
    const errorDiv = document.getElementById('loginError');
    alert('提示：\n\n微信和QQ登录需要配置相应的OAuth应用\n\n请联系管理员配置：\n- 微信开放平台账号\n- QQ互联应用\n\n或使用其他登录方式：\n- 账号密码登录\n- 手机号登录\n- 邮箱登录');
}

function showRegisterForm() {
    const loginTab = document.getElementById('loginTab_password');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    
    loginError.textContent = '';
    loginTab.style.display = 'none';
    registerForm.style.display = 'block';
}

function showLoginForm() {
    const loginTab = document.getElementById('loginTab_password');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    
    loginError.textContent = '';
    registerForm.style.display = 'none';
    loginTab.style.display = 'block';
}

function updateRegisterFields() {
    const registerType = document.getElementById('registerType').value;
    const usernameField = document.getElementById('registerUsernameField');
    const phoneField = document.getElementById('registerPhoneField');
    const emailField = document.getElementById('registerEmailField');
    
    usernameField.style.display = registerType === 'username' ? 'block' : 'none';
    phoneField.style.display = registerType === 'phone' ? 'block' : 'none';
    emailField.style.display = registerType === 'email' ? 'block' : 'none';
}

function sendRegisterPhoneCode() {
    const phoneNumber = document.getElementById('registerPhoneNumber').value;
    const phonePrefix = document.getElementById('registerPhonePrefix').value;
    const errorDiv = document.getElementById('loginError');
    const sendBtn = document.getElementById('sendRegisterCodeBtn');
    
    if (!phoneNumber) {
        errorDiv.textContent = '请输入手机号';
        return;
    }
    
    const fullPhone = phonePrefix + phoneNumber;
    
    errorDiv.textContent = '正在发送验证码...';
    sendBtn.disabled = true;
    
    setTimeout(() => {
        alert('验证码已发送至 ' + fullPhone + '\n演示模式：验证码为 123456');
        errorDiv.textContent = '';
        
        let countdown = 60;
        const timer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(timer);
                sendBtn.textContent = '发送验证码';
                sendBtn.disabled = false;
            } else {
                sendBtn.textContent = `${countdown}秒后重试`;
            }
        }, 1000);
    }, 1000);
}

function sendRegisterEmailCode() {
    const emailAddress = document.getElementById('registerEmailAddress').value;
    const errorDiv = document.getElementById('loginError');
    const sendBtn = document.getElementById('sendRegisterEmailCodeBtn');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailAddress || !emailRegex.test(emailAddress)) {
        errorDiv.textContent = '请输入有效的邮箱地址';
        return;
    }
    
    errorDiv.textContent = '正在发送验证码...';
    sendBtn.disabled = true;
    
    setTimeout(() => {
        alert('验证码已发送至 ' + emailAddress + '\n演示模式：验证码为 123456');
        errorDiv.textContent = '';
        
        let countdown = 60;
        const timer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(timer);
                sendBtn.textContent = '发送验证码';
                sendBtn.disabled = false;
            } else {
                sendBtn.textContent = `${countdown}秒后重试`;
            }
        }, 1000);
    }, 1000);
}

function handleRegister() {
    const registerType = document.getElementById('registerType').value;
    const errorDiv = document.getElementById('loginError');
    
    if (registerType === 'username') {
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        if (!username || !password) {
            errorDiv.textContent = '请填写完整信息';
            return;
        }
        
        if (password !== passwordConfirm) {
            errorDiv.textContent = '两次密码输入不一致';
            return;
        }
        
        if (password.length < 6) {
            errorDiv.textContent = '密码长度至少6位';
            return;
        }
        
        errorDiv.textContent = '';
        alert('演示模式：用户注册成功！\n用户名：' + username + '\n\n提示：演示模式，实际注册功能需配置后端服务');
        
    } else if (registerType === 'phone') {
        const phoneNumber = document.getElementById('registerPhoneNumber').value;
        const phoneCode = document.getElementById('registerPhoneCode').value;
        
        if (!phoneNumber || !phoneCode) {
            errorDiv.textContent = '请填写完整信息';
            return;
        }
        
        if (phoneCode !== '123456') {
            errorDiv.textContent = '验证码错误（演示验证码：123456）';
            return;
        }
        
        errorDiv.textContent = '';
        alert('演示模式：手机号注册成功！\n手机号：' + document.getElementById('registerPhonePrefix').value + phoneNumber + '\n\n提示：演示模式，实际注册功能需配置后端服务');
        
    } else if (registerType === 'email') {
        const emailAddress = document.getElementById('registerEmailAddress').value;
        const emailCode = document.getElementById('registerEmailCode').value;
        
        if (!emailAddress || !emailCode) {
            errorDiv.textContent = '请填写完整信息';
            return;
        }
        
        if (emailCode !== '123456') {
            errorDiv.textContent = '验证码错误（演示验证码：123456）';
            return;
        }
        
        errorDiv.textContent = '';
        alert('演示模式：邮箱注册成功！\n邮箱：' + emailAddress + '\n\n提示：演示模式，实际注册功能需配置后端服务');
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
            const provider = data.config.provider || 'siliconflow';
            document.getElementById('llmProvider').value = provider;
            document.getElementById('llmApiKey').value = data.config.apiKey || '';
            document.getElementById('llmBaseUrl').value = data.config.baseUrl || 'https://api.siliconflow.cn/v1';
            
            // 先更新模型列表
            updateModelList(provider);
            
            // 然后设置模型值
            document.getElementById('llmModel').value = data.config.model || 'Qwen/Qwen2.5-7B-Instruct';
            document.getElementById('llmStatus').textContent = data.config.apiKey ? '✅ 已配置' : '❌ 未配置';
            document.getElementById('llmStatus').style.color = data.config.apiKey ? 'var(--secondary-color)' : '#ef4444';
        }
    } catch (error) {
        document.getElementById('llmStatus').textContent = '❌ 连接失败';
        document.getElementById('llmStatus').style.color = '#ef4444';
        
        // 出错时也更新模型列表为默认值
        updateModelList('siliconflow');
    }
}

async function testLLMConfig() {
    const provider = document.getElementById('llmProvider').value;
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
            body: JSON.stringify({ provider, apiKey, baseUrl, model })
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
            
            const totalSize = toolFiles.reduce((sum, f) => sum + (f.size || 0), 0);
            const formatSize = (bytes) => {
                if (bytes < 1024) return bytes + ' B';
                if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
                return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
            };
            
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
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-weight: 600; font-size: 0.9rem;">📁 Skills知识文件</span>
                                <span style="font-size: 0.8rem; color: var(--text-secondary);">(${toolFiles.length}个文件, ${formatSize(totalSize)})</span>
                            </div>
                            ${!isDisabled && toolFiles.length > 0 ? `
                                <button onclick="clearToolSkills('${tool.key}', '${tool.name}')" style="background: #ef4444; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">清空全部</button>
                            ` : ''}
                        </div>
                        
                        ${toolFiles.length > 0 ? `
                            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 8px;">
                                ${toolFiles.map(f => {
                                    const fileSize = f.size || 0;
                                    const isTextFile = /\.(txt|md|json|js|py|ts|html|css|xml|yaml|yml|sql|csv|log)$/i.test(f.filename);
                                    const displayName = f.originalName || f.filename;
                                    return `
                                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--border-color); background: white;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                                            <div style="flex: 1; display: flex; align-items: center; gap: 0.5rem; overflow: hidden;">
                                                <span style="font-size: 1.2rem;">${getFileIcon(f.filename)}</span>
                                                <div style="overflow: hidden;">
                                                    <div style="font-size: 0.85rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${displayName}">${displayName}</div>
                                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${formatSize(fileSize)}</div>
                                                </div>
                                            </div>
                                            <div style="display: flex; gap: 0.25rem;">
                                                ${isTextFile ? `
                                                    <button onclick="previewToolFile('${tool.key}', '${f.filename}')" style="background: #10b981; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.7rem;">预览</button>
                                                ` : ''}
                                                ${!isDisabled ? `
                                                    <button onclick="deleteToolSkillFile('${tool.key}', '${f.filename}')" style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.7rem;">删除</button>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 2rem; background: var(--bg-color); border-radius: 8px; margin-bottom: 1rem; border: 2px dashed var(--border-color);">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📂</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">暂无上传文件</div>
                            </div>
                        `}
                        
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <label style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: ${isDisabled ? '#ccc' : 'var(--primary-color)'}; color: white; border-radius: 6px; cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; font-size: 0.85rem;">
                                <span>⬆️ 上传文件</span>
                                <input type="file" id="file_${tool.key}" style="display: none;" onchange="uploadToolSkillFile('${tool.key}', '${tool.name}', this)" ${isDisabled ? 'disabled' : ''} multiple accept=".txt,.md,.json,.js,.py,.ts,.html,.css,.xml,.yaml,.yml,.sql,.csv,.log,.pdf,.doc,.docx">
                            </label>
                            <label style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: ${isDisabled ? '#ccc' : '#8b5cf6'}; color: white; border-radius: 6px; cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; font-size: 0.85rem;">
                                <span>📦 上传ZIP</span>
                                <input type="file" id="zip_${tool.key}" style="display: none;" onchange="uploadToolSkillFile('${tool.key}', '${tool.name}', this)" ${isDisabled ? 'disabled' : ''} accept=".zip">
                            </label>
                            <label style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: ${isDisabled ? '#ccc' : '#10b981'}; color: white; border-radius: 6px; cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; font-size: 0.85rem;">
                                <span>📁 上传文件夹</span>
                                <input type="file" id="folder_${tool.key}" style="display: none;" onchange="uploadToolSkillFile('${tool.key}', '${tool.name}', this)" ${isDisabled ? 'disabled' : ''} webkitdirectory multiple>
                            </label>
                        </div>
                        <div id="uploadStatus_${tool.key}" style="margin-top: 0.5rem; font-size: 0.8rem;"></div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        document.getElementById('onlineToolsConfig').innerHTML = '<p style="color: #ef4444;">加载失败: ' + error.message + '</p>';
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'txt': '📝', 'md': '📝', 'json': '📋', 'js': '💻', 'ts': '💻',
        'py': '🐍', 'html': '🌐', 'css': '🎨', 'xml': '📄', 'yaml': '⚙️',
        'yml': '⚙️', 'sql': '🗄️', 'csv': '📊', 'log': '📋', 'pdf': '📕',
        'doc': '📘', 'docx': '📘', 'zip': '📦', 'png': '🖼️', 'jpg': '🖼️',
        'jpeg': '🖼️', 'gif': '🖼️', 'svg': '🖼️'
    };
    return icons[ext] || '📄';
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

async function clearToolSkills(toolKey, toolName) {
    if (!confirm(`确定要清空"${toolName}"的所有Skills文件吗？此操作不可撤销！`)) return;
    
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/tools/folder/${toolKey}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            alert('已清空所有文件');
            loadOnlineToolsConfig();
        } else {
            alert('清空失败: ' + data.error);
        }
    } catch (error) {
        alert('清空失败: ' + error.message);
    }
}

async function previewToolFile(toolKey, filename) {
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    
    container.innerHTML = `
        <div style="padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0;">📄 ${filename}</h2>
                <button onclick="closeModal()" style="background: var(--text-secondary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">关闭</button>
            </div>
            <div id="previewContent" style="background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; max-height: 60vh; overflow: auto; font-family: 'Consolas', monospace; font-size: 0.9rem; white-space: pre-wrap; word-break: break-all;">
                <div style="text-align: center; padding: 2rem;">加载中...</div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/tools/file/${toolKey}/${encodeURIComponent(filename)}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('previewContent').textContent = data.content;
        } else {
            document.getElementById('previewContent').innerHTML = '<div style="color: #ef4444; text-align: center; padding: 2rem;">❌ ' + data.error + '</div>';
        }
    } catch (error) {
        document.getElementById('previewContent').innerHTML = '<div style="color: #ef4444; text-align: center; padding: 2rem;">❌ 加载失败: ' + error.message + '</div>';
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

function updateBaseUrlByProvider() {
    const provider = document.getElementById('llmProvider').value;
    const baseUrlInput = document.getElementById('llmBaseUrl');
    const modelSelect = document.getElementById('llmModel');
    
    const baseUrls = {
        siliconflow: 'https://api.siliconflow.cn/v1',
        openai: 'https://api.openai.com/v1',
        anthropic: 'https://api.anthropic.com/v1',
        azure: 'https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME/chat/completions?api-version=2024-03-01-preview',
        google: 'https://generativelanguage.googleapis.com/v1/models/MODEL_NAME:generateContent',
        baidu: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
        ali: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        tencent: 'https://api.tencentcloud.com',
        bytedance: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        custom: ''
    };
    
    baseUrlInput.value = baseUrls[provider] || '';
    updateModelList(provider);
}

function updateModelList(provider) {
    const modelInput = document.getElementById('llmModel');
    const modelList = document.getElementById('modelList');
    modelList.innerHTML = '';
    
    const providerModels = {
        siliconflow: [
            { value: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen/Qwen2.5-7B-Instruct (通义千问)' },
            { value: 'Qwen/Qwen2.5-14B-Instruct', label: 'Qwen/Qwen2.5-14B-Instruct (通义千问14B)' },
            { value: 'baichuan-inc/Baichuan2-7B-Chat', label: 'baichuan-inc/Baichuan2-7B-Chat (百川智能)' },
            { value: '01-ai/Yi-34B-Chat', label: '01-ai/Yi-34B-Chat (零一万物)' },
            { value: 'THUDM/chatglm3-6b', label: 'THUDM/chatglm3-6b (清华大学GLM)' },
            { value: 'ByteDance/LLaMA2-7B-Chat', label: 'ByteDance/LLaMA2-7B-Chat (字节跳动)' },
            { value: 'meta-llama/Llama-3-8b-chat-hf', label: 'meta-llama/Llama-3-8b-chat-hf (Meta Llama 3)' },
            { value: 'microsoft/phi-3-mini-128k-instruct', label: 'microsoft/phi-3-mini-128k-instruct (Microsoft Phi-3)' }
        ],
        openai: [
            { value: 'gpt-4o', label: 'gpt-4o' },
            { value: 'gpt-4-turbo', label: 'gpt-4-turbo' },
            { value: 'gpt-4', label: 'gpt-4' },
            { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' }
        ],
        anthropic: [
            { value: 'claude-3-opus-20240229', label: 'claude-3-opus-20240229' },
            { value: 'claude-3-sonnet-20240229', label: 'claude-3-sonnet-20240229' },
            { value: 'claude-3-haiku-20240307', label: 'claude-3-haiku-20240307' }
        ],
        azure: [
            { value: 'gpt-4o', label: 'gpt-4o' },
            { value: 'gpt-4-turbo', label: 'gpt-4-turbo' },
            { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' }
        ],
        google: [
            { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' },
            { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
            { value: 'gemini-1.0-pro', label: 'gemini-1.0-pro' }
        ],
        baidu: [
            { value: 'ernie-3.5', label: 'ernie-3.5 (文心一言)' },
            { value: 'ernie-4.0', label: 'ernie-4.0 (文心一言4.0)' }
        ],
        ali: [
            { value: 'qwen2.5-7b-chat', label: 'qwen2.5-7b-chat (通义千问)' },
            { value: 'qwen2.5-14b-chat', label: 'qwen2.5-14b-chat (通义千问14B)' },
            { value: 'qwen2.5-32b-chat', label: 'qwen2.5-32b-chat (通义千问32B)' }
        ],
        tencent: [
            { value: 'hunyuan-pro', label: 'hunyuan-pro (混元大模型)' },
            { value: 'hunyuan-standard', label: 'hunyuan-standard (混元标准)' }
        ],
        bytedance: [
            { value: 'doubao-1.5-pro', label: 'doubao-1.5-pro (豆包)' },
            { value: 'doubao-1.5-flash', label: 'doubao-1.5-flash (豆包Flash)' },
            { value: 'doubao-code', label: 'doubao-code (豆包代码)' }
        ],
        custom: [
            { value: '', label: '请手动输入模型名称' }
        ]
    };
    
    const models = providerModels[provider] || providerModels.siliconflow;
    
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.value;
        option.textContent = model.label;
        modelList.appendChild(option);
    });
    
    // 不进行默认展示，保持输入框为空
    modelInput.value = '';
}

function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('llmApiKey');
    const toggleButton = apiKeyInput.nextElementSibling;
    
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleButton.textContent = '🙈';
    } else {
        apiKeyInput.type = 'password';
        toggleButton.textContent = '👁️';
    }
}
