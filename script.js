const toolTemplates = {
    testcase: {
        title: '测试用例生成器',
        description: '输入需求描述，AI将帮你生成测试用例',
        placeholder: `例如：用户登录功能
- 用户名：6-20位字母数字组合
- 密码：8-20位，必须包含大小写字母和数字
- 登录成功后跳转至首页
- 连续5次密码错误锁定账户
- 记住密码功能`,
        systemPrompt: '你是一个资深的测试工程师，擅长生成高质量的测试用例。'
    },
    xmind: {
        title: '需求转XMind',
        description: '将文字需求转换为思维导图结构，方便梳理',
        placeholder: `例如：电商订单管理模块
1. 订单创建：用户选择商品加入购物车，填写收货地址，选择支付方式提交订单
2. 订单支付：支持微信、支付宝、银行卡支付，支付成功更新订单状态
3. 订单发货：商家发货，填写物流信息
4. 订单收货：用户确认收货或自动确认
5. 订单售后：支持退款退货`,
        systemPrompt: '你是一个思维导图专家，擅长将需求整理成清晰的层级结构。'
    },
    regexp: {
        title: '正则表达式生成',
        description: '描述你想要匹配的内容，AI帮你生成正则表达式',
        placeholder: `例如：匹配中国大陆手机号，1开头，第二位是3-9，后面9位数字`,
        systemPrompt: '你是一个正则表达式专家，擅长用简洁的正则表达式解决各种匹配问题。'
    },
    sql: {
        title: 'SQL查询生成',
        description: '用自然语言描述你想查询的数据，AI帮你生成SQL',
        placeholder: `例如：查询2024年1月份销售额超过10000元的订单，按销售额降序排列，显示订单号、客户名、销售额、订单日期`,
        systemPrompt: '你是一个SQL专家，擅长编写高效的查询语句。'
    },
    api: {
        title: 'API文档生成',
        description: '根据接口描述生成API文档',
        placeholder: `例如：用户登录接口
- 请求方式：POST
- 请求路径：/api/login
- 请求参数：username(用户名), password(密码)
- 返回：token, userId, username, nickname`,
        systemPrompt: '你是一个API文档专家，擅长编写清晰规范的接口文档。'
    },
    email: {
        title: '测试报告模板',
        description: '快速生成专业的测试报告',
        placeholder: `例如：本次测试了用户登录、订单管理、支付三个模块
- 用户登录：25个用例，通过24个，失败1个
- 订单管理：40个用例，通过38个，失败2个
- 支付模块：30个用例，全部通过
- 共发现3个bug，均已修复`,
        systemPrompt: '你是一个测试报告专家，擅长编写专业清晰的测试报告。'
    },
    apitest: {
        title: '接口测试工具',
        description: '在线发送HTTP请求，测试API接口',
        placeholder: '',
        isInteractive: true
    },
    faker: {
        title: '测试数据生成',
        description: '生成各种类型的测试数据',
        placeholder: '',
        isInteractive: true
    },
    json: {
        title: 'JSON格式化',
        description: '格式化、校验、压缩JSON数据',
        placeholder: '{"name":"test","value":123}',
        isInteractive: true
    },
    coder: {
        title: '代码转换器',
        description: '代码格式互转，如JSON转Java实体类',
        placeholder: `{"id":1,"userName":"test","email":"test@example.com","age":25}`,
        isInteractive: true
    },
    encoder: {
        title: '编码转换工具',
        description: 'URL编码、Base64、MD5等编码转换',
        placeholder: '你好世界',
        isInteractive: true
    },
    timestamp: {
        title: '时间戳转换',
        description: '时间戳与日期格式互转',
        placeholder: '',
        isInteractive: true
    }
};

const API_CONFIG = {
    provider: 'openai',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    backendUrl: window.location.port === '80' || window.location.port === '443' 
        ? `${window.location.protocol}//${window.location.hostname}` 
        : `${window.location.protocol}//${window.location.hostname}:3001`
};

function getApiConfig() {
    const saved = localStorage.getItem('aiTestHelper_apiConfig');
    if (saved) {
        return JSON.parse(saved);
    }
    return API_CONFIG;
}

function getBackendUrl() {
    const config = getApiConfig();
    const saved = localStorage.getItem('aiTestHelper_apiConfig');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.backendUrl) return parsed.backendUrl;
    }
    if (window.location.protocol === 'file:' || !window.location.port) {
        return 'http://localhost:3001';
    }
    return config.backendUrl || 'http://localhost:3001';
}

function saveApiConfig(config) {
    localStorage.setItem('aiTestHelper_apiConfig', JSON.stringify(config));
    Object.assign(API_CONFIG, config);
}

async function callAI(prompt, systemPrompt, toolType = 'testcase') {
    const config = getApiConfig();
    
    if (!config.apiKey && !config.backendUrl) {
        return { error: true, message: '请先配置API Key或启动后端服务' };
    }
    
    try {
        let response;
        
        if (config.backendUrl) {
            response = await fetch(`${config.backendUrl}/api/ai/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    toolType: toolType,
                    input: prompt
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '后端服务请求失败');
            }
            
            const data = await response.json();
            if (data.success) {
                return { error: false, content: data.content };
            } else {
                throw new Error(data.error || 'AI生成失败');
            }
        } else {
            response = await fetch(`${config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API请求失败');
            }
            
            const data = await response.json();
            return { error: false, content: data.choices[0].message.content };
        }
    } catch (error) {
        return { error: true, message: error.message };
    }
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function md5(string) {
    const md5chars = '0123456789ABCDEF';
    let result = '';
    const x = simpleHash(string);
    for (let i = 0; i < 32; i++) {
        result += md5chars[(x >> (i * 4 + 4)) & 0x0F];
        result += md5chars[(x >> (i * 4)) & 0x0F];
    }
    return result || 'd41d8cd98f00b204e9800998ecf8427e';
}

const localGenerators = {
    testcase: (input) => {
        const lines = input.split('\n').filter(l => l.trim());
        const fields = {};
        
        lines.forEach(line => {
            const match = line.match(/^[-•]\s*([^：:]+)[：:]\s*(.+)$/);
            if (match) {
                fields[match[1].trim()] = match[2].trim();
            }
        });
        
        const featureName = Object.keys(fields).length > 0 ? '功能' : '需求';
        const testCases = [];
        
        testCases.push({
            id: 1,
            name: '正常场景',
            preconditions: '用户未登录',
            steps: '1. 输入有效的用户名和密码\n2. 点击登录按钮',
            expected: '登录成功，跳转至首页',
            priority: 'P0',
            type: '功能'
        });
        
        testCases.push({
            id: 2,
            name: '用户名为空',
            preconditions: '用户未登录',
            steps: '1. 不输入用户名\n2. 输入密码\n3. 点击登录按钮',
            expected: '提示"用户名不能为空"',
            priority: 'P0',
            type: '异常'
        });
        
        testCases.push({
            id: 3,
            name: '密码为空',
            preconditions: '用户未登录',
            steps: '1. 输入用户名\n2. 不输入密码\n3. 点击登录按钮',
            expected: '提示"密码不能为空"',
            priority: 'P0',
            type: '异常'
        });
        
        if (Object.keys(fields).some(k => k.includes('错误') || k.includes('锁定'))) {
            testCases.push({
                id: 4,
                name: '密码错误',
                preconditions: '用户已注册',
                steps: '1. 输入正确的用户名\n2. 输入错误的密码\n3. 点击登录按钮',
                expected: '提示"密码错误"',
                priority: 'P0',
                type: '异常'
            });
            
            testCases.push({
                id: 5,
                name: '密码错误5次锁定',
                preconditions: '用户已注册',
                steps: '1. 输入正确的用户名\n2. 连续5次输入错误密码',
                expected: '提示"账号已锁定"',
                priority: 'P0',
                type: '异常'
            });
        }
        
        Object.entries(fields).forEach(([key, value]) => {
            if (key.includes('长度') || key.includes('位')) {
                const match = value.match(/(\d+)[-~](\d+)/);
                if (match) {
                    testCases.push({
                        id: testCases.length + 1,
                        name: `${key}边界测试`,
                        preconditions: '无',
                        steps: `输入${key}为${match[1]}位和${match[2]}位`,
                        expected: '验证边界值处理正确',
                        priority: 'P1',
                        type: '边界'
                    });
                }
            }
        });
        
        let result = `📋 测试用例生成结果\n\n`;
        result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        result += `【测试范围】${featureName}\n`;
        result += `${lines.slice(0, 3).map(l => l.replace(/^[-•]\s*/, '• ')).join('\n')}\n\n`;
        result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        result += `| ID | 测试项 | 前置条件 | 测试步骤 | 预期结果 | 优先级 | 类型 |\n`;
        result += `|---|--------|----------|----------|----------|--------|------|\n`;
        
        testCases.forEach(tc => {
            const steps = tc.steps.replace(/\n/g, '<br>');
            result += `| ${tc.id} | ${tc.name} | ${tc.preconditions} | ${steps} | ${tc.expected} | ${tc.priority} | ${tc.type} |\n`;
        });
        
        result += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        result += `💡 测试建议：\n`;
        result += `• 建议补充：界面显示、兼容性、安全性测试\n`;
        result += `• 重点关注：用户交互体验、错误提示友好性\n`;
        
        return result;
    },
    
    xmind: (input) => {
        const lines = input.split('\n').filter(l => l.trim() && !l.match(/^[\d]+\./));
        
        let result = `🧠 需求思维导图结构\n\n`;
        result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        const mainTopic = lines[0]?.replace(/^[-•]\s*/, '').replace(/[：:].*$/, '') || '需求模块';
        result += `📌 ${mainTopic}\n`;
        
        const categories = {
            '功能': [],
            '流程': [],
            '规则': [],
            '其他': []
        };
        
        lines.forEach((line) => {
            const content = line.replace(/^[\d\.]*\s*[-•]\s*/, '').trim();
            if (!content) return;
            
            if (content.includes('创建') || content.includes('新增') || content.includes('添加') || content.includes('注册')) {
                categories['功能'].push(`  ✓ ${content}`);
            } else if (content.includes('支付') || content.includes('发货') || content.includes('收货') || content.includes('登录')) {
                categories['流程'].push(`  → ${content}`);
            } else if (content.includes('验证') || content.includes('限制') || content.includes('规则') || content.includes('权限')) {
                categories['规则'].push(`  △ ${content}`);
            } else if (content.length > 5) {
                categories['其他'].push(`  ◇ ${content}`);
            }
        });
        
        Object.entries(categories).forEach(([category, items]) => {
            if (items.length > 0) {
                result += `\n【${category}】\n`;
                items.forEach(item => {
                    result += `${item}\n`;
                });
            }
        });
        
        result += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        result += `🔑 关键测试点：\n`;
        result += `• 功能完整性：各功能点是否可正常使用\n`;
        result += `• 流程正确性：业务流程是否顺畅\n`;
        result += `• 边界条件：各种限制规则是否生效\n`;
        result += `• 异常处理：异常情况是否处理得当\n`;
        
        return result;
    },
    
    regexp: (input) => {
        const lowerInput = input.toLowerCase();
        
        let result = `🔤 正则表达式生成结果\n\n`;
        result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        if (lowerInput.includes('手机') || lowerInput.includes('电话')) {
            result += `【匹配中国大陆手机号】\n\n`;
            result += `正则表达式：\`^1[3-9]\\d{9}$\`\n\n`;
            result += `解释：\n• ^1 - 必须以1开头\n• [3-9] - 第二位是3-9\n• \\d{9} - 后面9位数字\n• $ - 结束\n\n`;
            result += `匹配示例：✅ 13812345678, ✅ 15987654321\n`;
            result += `不匹配：❌ 12012345678, ❌ 1381234567\n`;
        } else if (lowerInput.includes('邮箱') || lowerInput.includes('邮件')) {
            result += `【匹配电子邮箱】\n\n`;
            result += `正则表达式：\`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$\`\n\n`;
            result += `匹配示例：✅ test@example.com\n`;
        } else if (lowerInput.includes('身份证')) {
            result += `【匹配中国大陆身份证号】\n\n`;
            result += `正则表达式：\`^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$\`\n\n`;
            result += `匹配示例：✅ 110101199003078888\n`;
        } else if (lowerInput.includes('url') || lowerInput.includes('网址') || lowerInput.includes('链接')) {
            result += `【匹配URL链接】\n\n`;
            result += `正则表达式：\`^https?://[\\w.-]+(?:\\.[\\w.-]+)+[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=.]+$\`\n\n`;
            result += `匹配示例：✅ https://www.example.com\n`;
        } else if (lowerInput.includes('ip') || (lowerInput.includes('地址') && lowerInput.includes('网络'))) {
            result += `【匹配IP地址】\n\n`;
            result += `正则表达式：\`^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$\`\n\n`;
            result += `匹配示例：✅ 192.168.1.1, ✅ 10.0.0.1\n`;
        } else if (lowerInput.includes('日期') || lowerInput.includes('时间')) {
            result += `【匹配日期格式】\n\n`;
            result += `YYYY-MM-DD: \`^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$\`\n\n`;
            result += `HH:mm:ss: \`^([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$\`\n\n`;
        } else {
            result += `【通用模式】\n\n`;
            result += `根据输入内容生成了通用匹配模式：\n`;
            result += `正则表达式：\`^[\\w\\u4e00-\\u9fa5]+$\`\n\n`;
            result += `说明：匹配字母、数字、中文、下划线\n`;
        }
        
        return result;
    },
    
    sql: (input) => {
        const lowerInput = input.toLowerCase();
        
        let result = `🗄️ SQL查询生成结果\n\n`;
        result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        let tableName = 'orders';
        let whereClause = '';
        let orderClause = '';
        let selectFields = '*';
        
        if (lowerInput.includes('用户') || lowerInput.includes('客户')) {
            tableName = 'customers';
            selectFields = 'customer_id, customer_name, email, phone, created_at';
        }
        
        if (lowerInput.includes('订单')) {
            tableName = 'orders';
            selectFields = 'order_id, customer_id, order_date, total_amount, status';
        }
        
        if (lowerInput.includes('产品') || lowerInput.includes('商品')) {
            tableName = 'products';
            selectFields = 'product_id, product_name, price, stock, category';
        }
        
        if (lowerInput.includes('2024') || lowerInput.includes('2023') || lowerInput.includes('日期') || lowerInput.includes('时间')) {
            const dateMatch = input.match(/(20\d{2})/);
            if (dateMatch) {
                whereClause = `WHERE order_date >= '${dateMatch[1]}-01-01' AND order_date < '${parseInt(dateMatch[1]) + 1}-01-01'`;
            }
        }
        
        if (lowerInput.includes('超过') || lowerInput.includes('大于') || lowerInput.includes('多于')) {
            const amountMatch = input.match(/(\d+)/);
            if (amountMatch) {
                whereClause = whereClause ? whereClause + ` AND total_amount > ${amountMatch[1]}` : `WHERE total_amount > ${amountMatch[1]}`;
            }
        }
        
        if (lowerInput.includes('降序') || lowerInput.includes('从高到低')) {
            orderClause = 'ORDER BY total_amount DESC';
        } else if (lowerInput.includes('升序') || lowerInput.includes('从低到高')) {
            orderClause = 'ORDER BY total_amount ASC';
        }
        
        result += `【假设表结构】\n\n\`\`\`sql\n`;
        result += `CREATE TABLE ${tableName} (\n`;
        result += `    id INT PRIMARY KEY AUTO_INCREMENT,\n`;
        result += `    name VARCHAR(100),\n`;
        result += `    created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n`;
        result += `);\n\`\`\`\n\n`;
        
        result += `【查询SQL】\n\n\`\`\`sql\n`;
        result += `SELECT ${selectFields}\n`;
        result += `FROM ${tableName}\n`;
        if (whereClause) result += `${whereClause}\n`;
        if (orderClause) result += `${orderClause}\n`;
        result += `LIMIT 100;\n\`\`\`\n\n`;
        
        return result;
    },
    
    api: (input) => {
        let result = `🌐 API文档生成结果\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        const lines = input.split('\n').filter(l => l.trim() && !l.startsWith('例如'));
        
        let method = 'POST';
        let path = '/api/endpoint';
        let params = [];
        let returns = [];
        
        lines.forEach(line => {
            const methodMatch = line.match(/(GET|POST|PUT|DELETE|PATCH)/i);
            if (methodMatch) method = methodMatch[1].toUpperCase();
            
            const pathMatch = line.match(/\/api\/[\w\/]+/);
            if (pathMatch) path = pathMatch[0];
            
            const paramMatches = line.matchAll(/(\w+)[(（](\w+)[)）]/g);
            for (const match of paramMatches) {
                params.push({ name: match[1], desc: match[2] });
            }
            
            if (line.includes('返回') || line.includes('响应')) {
                const returnMatches = line.matchAll(/(\w+)[,，]/g);
                for (const match of returnMatches) {
                    returns.push(match[1]);
                }
            }
        });
        
        if (params.length === 0) params = [{ name: 'data', desc: '请求数据' }];
        if (returns.length === 0) returns = ['code', 'message', 'data'];
        
        result += `## 请求信息\n\n`;
        result += `| 项目 | 内容 |\n`;
        result += `|------|------|\n`;
        result += `| 请求方法 | **${method}** |\n`;
        result += `| 请求路径 | \`${path}\` |\n\n`;
        
        result += `## 请求参数\n\n`;
        result += `| 参数名 | 类型 | 必填 | 说明 |\n`;
        result += `|--------|------|------|------|\n`;
        params.forEach(p => {
            result += `| ${p.name} | String | 是 | ${p.desc} |\n`;
        });
        
        result += `\n## 响应示例\n\n`;
        result += `\`\`\`json\n{\n`;
        result += `  "code": 200,\n`;
        result += `  "message": "success",\n`;
        result += `  "data": {}\n`;
        result += `}\n\`\`\`\n\n`;
        
        return result;
    },
    
    email: (input) => {
        const lines = input.split('\n').filter(l => l.trim());
        
        let totalCases = 0, passedCases = 0, failedCases = 0;
        
        const caseMatches = input.matchAll(/(\d+)个用例/gi);
        for (const match of caseMatches) totalCases += parseInt(match[1]);
        
        const passMatches = input.matchAll(/通过(\d+)个/gi);
        for (const match of passMatches) passedCases += parseInt(match[1]);
        
        const failMatches = input.matchAll(/失败(\d+)个/gi);
        for (const match of failMatches) failedCases += parseInt(match[1]);
        
        const total = totalCases || 100;
        const passed = passedCases || 95;
        const failed = failedCases || 5;
        
        let result = `══════════════════════════════════════════\n`;
        result += `              测试报告\n`;
        result += `══════════════════════════════════════════\n\n`;
        
        result += `【一、测试概述】\n\n`;
        result += `本次测试针对系统核心功能进行了全面验证。\n\n`;
        
        result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        result += `【二、测试结果统计】\n\n`;
        result += `• 总用例数：${total}\n`;
        result += `• 通过用例：${passed}\n`;
        result += `• 失败用例：${failed}\n`;
        result += `• 通过率：${((passed/total)*100).toFixed(1)}%\n\n`;
        
        result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        result += `【三、测试结论】\n\n`;
        result += `✅ 核心功能测试通过率达到预期\n`;
        result += `✅ 主要业务流程运行正常\n`;
        result += `✅ 系统具备上线条件\n\n`;
        
        result += `══════════════════════════════════════════\n`;
        result += `报告日期：${new Date().toLocaleDateString('zh-CN')}\n`;
        result += `══════════════════════════════════════════\n`;
        
        return result;
    }
};

function openTool(toolKey) {
    const tool = toolTemplates[toolKey];
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    const config = getApiConfig();
    const hasAIConfig = config.apiKey || config.backendUrl;
    
    if (tool.isInteractive) {
        openInteractiveTool(toolKey);
        return;
    }
    
    container.innerHTML = `
        <h2>${tool.title}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">${tool.description}</p>
        <textarea id="toolInput" class="tool-input" placeholder="${tool.placeholder}"></textarea>
        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <button id="generateBtn" class="tool-btn" onclick="generateContent('${toolKey}')">生成内容</button>
            <button id="localBtn" class="tool-btn" style="background: var(--secondary-color);" onclick="generateContent('${toolKey}', true)">本地生成</button>
            <button id="copyBtn" class="tool-btn copy-btn" onclick="copyContent()" style="display: none;">复制结果</button>
        </div>
        <div id="toolOutput" class="tool-output"></div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openInteractiveTool(toolKey) {
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    const tool = toolTemplates[toolKey];
    
    let content = `
        <h2>${tool.title}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">${tool.description}</p>
    `;
    
    switch(toolKey) {
        case 'apitest':
            content += `
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <select id="apiMethod" style="padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px; font-size: 1rem;">
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                    <input type="text" id="apiUrl" class="tool-input" style="flex: 1; min-width: 200px;" placeholder="输入API URL，如 https://api.example.com/users">
                </div>
                <textarea id="apiBody" class="tool-input" style="min-height: 150px;" placeholder='请求体 JSON，如 {"name": "test"}'></textarea>
                <div style="margin-bottom: 1rem;">
                    <label style="font-weight: 500; margin-right: 1rem;">Headers:</label>
                    <input type="text" id="apiHeaders" class="tool-input" style="min-height: auto;" placeholder='如 Authorization: Bearer xxx, Content-Type: application/json'>
                </div>
                <button class="tool-btn" onclick="sendApiRequest()">发送请求</button>
                <div id="apiResponse" class="tool-output" style="margin-top: 1rem; max-height: 400px; overflow: auto;"></div>
            `;
            break;
            
        case 'faker':
            content += `
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">数据类型</label>
                    <select id="fakerType" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px;">
                        <option value="name">姓名</option>
                        <option value="phone">手机号</option>
                        <option value="email">邮箱</option>
                        <option value="idcard">身份证号</option>
                        <option value="address">地址</option>
                        <option value="company">公司名</option>
                        <option value="url">网址</option>
                        <option value="ip">IP地址</option>
                        <option value="uuid">UUID</option>
                    </select>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">生成数量</label>
                    <input type="number" id="fakerCount" value="5" min="1" max="100" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px;">
                </div>
                <button class="tool-btn" onclick="generateFakeData()">生成数据</button>
                <div id="fakerOutput" class="tool-output" style="margin-top: 1rem;"></div>
            `;
            break;
            
        case 'json':
            content += `
                <textarea id="jsonInput" class="tool-input" style="min-height: 200px;" placeholder='{"name": "test", "value": 123}'></textarea>
                <div style="display: flex; gap: 0.5rem; margin: 1rem 0; flex-wrap: wrap;">
                    <button class="tool-btn" onclick="formatJson()">格式化</button>
                    <button class="tool-btn" style="background: #10b981;" onclick="compressJson()">压缩</button>
                    <button class="tool-btn" style="background: #f59e0b;" onclick="validateJson()">校验</button>
                    <button class="tool-btn" style="background: #6b7280;" onclick="clearJson()">清空</button>
                </div>
                <textarea id="jsonOutput" class="tool-input" style="min-height: 200px;" placeholder="输出结果" readonly></textarea>
            `;
            break;
            
        case 'coder':
            content += `
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">转换类型</label>
                    <select id="coderType" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px;">
                        <option value="json2java">JSON → Java实体类</option>
                        <option value="json2ts">JSON → TypeScript类型</option>
                        <option value="json2go">JSON → Go结构体</option>
                        <option value="json2sql">JSON → SQL建表语句</option>
                        <option value="json2python">JSON → Python类</option>
                        <option value="json2csharp">JSON → C#类</option>
                        <option value="json2rust">JSON → Rust结构体</option>
                        <option value="json2php">JSON → PHP类</option>
                        <option value="yaml2json">YAML → JSON</option>
                        <option value="xml2json">XML → JSON</option>
                    </select>
                </div>
                <textarea id="coderInput" class="tool-input" style="min-height: 150px;" placeholder='{"id": 1, "userName": "test", "email": "test@example.com"}'></textarea>
                <button class="tool-btn" style="margin: 1rem 0;" onclick="convertCode()">转换</button>
                <textarea id="coderOutput" class="tool-input" style="min-height: 150px;" placeholder="转换结果" readonly></textarea>
            `;
            break;
            
        case 'encoder':
            content += `
                <textarea id="encoderInput" class="tool-input" style="min-height: 100px;" placeholder="输入要转换的内容"></textarea>
                <div style="display: flex; gap: 0.5rem; margin: 1rem 0; flex-wrap: wrap;">
                    <button class="tool-btn" onclick="encodeUrl()">URL编码</button>
                    <button class="tool-btn" style="background: #10b981;" onclick="decodeUrl()">URL解码</button>
                    <button class="tool-btn" style="background: #8b5cf6;" onclick="encodeBase64()">Base64编码</button>
                    <button class="tool-btn" style="background: #f59e0b;" onclick="decodeBase64()">Base64解码</button>
                    <button class="tool-btn" style="background: #ef4444;" onclick="generateMd5()">MD5加密</button>
                </div>
                <textarea id="encoderOutput" class="tool-input" style="min-height: 100px;" placeholder="转换结果"></textarea>
            `;
            break;
            
        case 'timestamp':
            const now = Date.now();
            content += `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">当前时间戳</label>
                        <input type="text" id="currentTimestamp" value="${now}" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px;">
                    </div>
                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">当前日期</label>
                        <input type="text" id="currentDate" value="${new Date().toLocaleString('zh-CN')}" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px;">
                    </div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">输入时间戳转日期</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" id="timestampInput" class="tool-input" style="flex: 1; min-height: auto;" placeholder="输入时间戳，如 1704067200000">
                        <button class="tool-btn" onclick="timestampToDate()">转换</button>
                    </div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">输入日期转时间戳</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" id="dateInput" class="tool-input" style="flex: 1; min-height: auto;" placeholder="输入日期，如 2024-01-01 12:00:00">
                        <button class="tool-btn" onclick="dateToTimestamp()">转换</button>
                    </div>
                </div>
                <div id="timestampResult" class="tool-output"></div>
            `;
            break;
    }
    
    container.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function sendApiRequest() {
    const method = document.getElementById('apiMethod').value;
    const url = document.getElementById('apiUrl').value.trim();
    const body = document.getElementById('apiBody').value.trim();
    const headersStr = document.getElementById('apiHeaders').value.trim();
    const output = document.getElementById('apiResponse');
    
    if (!url) {
        alert('请输入API URL');
        return;
    }
    
    output.textContent = '请求中...';
    output.classList.add('visible');
    
    const headers = {};
    if (headersStr) {
        headersStr.split(',').forEach(h => {
            const [key, value] = h.split(':').map(s => s.trim());
            if (key && value) headers[key] = value;
        });
    }
    if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    
    try {
        const options = { method, headers };
        if (body && method !== 'GET') {
            options.body = body;
        }
        
        const startTime = Date.now();
        const response = await fetch(url, options);
        const duration = Date.now() - startTime;
        
        const contentType = response.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
            data = await response.json();
            data = JSON.stringify(data, null, 2);
        } else {
            data = await response.text();
        }
        
        let result = `✅ 请求成功！\n\n`;
        result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        result += `📊 响应信息\n\n`;
        result += `• 状态码：${response.status} ${response.statusText}\n`;
        result += `• 耗时：${duration}ms\n`;
        result += `• Content-Type：${contentType}\n\n`;
        result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        result += `📄 响应内容\n\n`;
        result += data;
        
        output.textContent = result;
    } catch (error) {
        output.textContent = `❌ 请求失败：\n\n${error.message}\n\n请检查URL是否正确，或确认是否支持跨域请求。`;
    }
}

function generateFakeData() {
    const type = document.getElementById('fakerType').value;
    const count = parseInt(document.getElementById('fakerCount').value) || 5;
    const output = document.getElementById('fakerOutput');
    
    const generators = {
        name: () => {
            const surnames = ['张', '李', '王', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗'];
            const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞'];
            return surnames[Math.floor(Math.random() * surnames.length)] + names[Math.floor(Math.random() * names.length)];
        },
        phone: () => {
            const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '170', '176', '177', '178', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '198', '199'];
            return prefixes[Math.floor(Math.random() * prefixes.length)] + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        },
        email: () => {
            const domains = ['gmail.com', 'qq.com', '163.com', '126.com', 'outlook.com', 'sina.com', 'hotmail.com'];
            const name = 'user' + Math.random().toString(36).substring(2, 8);
            return name + '@' + domains[Math.floor(Math.random() * domains.length)];
        },
        idcard: () => {
            const areas = ['110101', '310101', '440100', '510100', '320100', '330100'];
            const area = areas[Math.floor(Math.random() * areas.length)];
            const year = 1980 + Math.floor(Math.random() * 30);
            const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
            const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
            const seq = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return area + year + month + day + seq + '0';
        },
        address: () => {
            const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '湖南省'];
            const cities = ['市', '市', '市', '市'];
            const districts = ['朝阳区', '海淀区', '浦东新区', '天河区', '西湖区', '江干区'];
            const streets = ['科技路', '人民路', '中山路', '建设路', '解放路', '和平路'];
            return provinces[Math.floor(Math.random() * provinces.length)] + 
                   cities[Math.floor(Math.random() * cities.length)] +
                   districts[Math.floor(Math.random() * districts.length)] + 
                   streets[Math.floor(Math.random() * streets.length)] + 
                   Math.floor(Math.random() * 500 + 1).toString() + '号';
        },
        company: () => {
            const prefixes = ['腾讯', '阿里', '百度', '京东', '字节', '美团', '滴滴', '小米', '华为', '网易'];
            const types = ['科技', '网络', '信息', '软件', '电子', '通信'];
            const suffixes = ['有限公司', '股份有限公司', '科技有限公司'];
            return prefixes[Math.floor(Math.random() * prefixes.length)] + 
                   types[Math.floor(Math.random() * types.length)] + 
                   suffixes[Math.floor(Math.random() * suffixes.length)];
        },
        url: () => {
            const domains = ['example.com', 'test.com', 'demo.com', 'api.com', 'site.com'];
            const paths = ['/users', '/products', '/api/v1', '/login', '/home'];
            return 'https://' + domains[Math.floor(Math.random() * domains.length)] + paths[Math.floor(Math.random() * paths.length)];
        },
        ip: () => {
            return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
        },
        uuid: () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };
    
    let result = `🎲 测试数据生成结果 (${count}条)\n\n`;
    result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    for (let i = 0; i < count; i++) {
        result += `${i + 1}. ${generators[type]()}\n`;
    }
    
    output.textContent = result;
    output.classList.add('visible');
}

function formatJson() {
    const input = document.getElementById('jsonInput').value;
    const output = document.getElementById('jsonOutput');
    try {
        const obj = JSON.parse(input);
        output.value = JSON.stringify(obj, null, 4);
    } catch (e) {
        output.value = '❌ JSON格式错误：' + e.message;
    }
}

function compressJson() {
    const input = document.getElementById('jsonInput').value;
    const output = document.getElementById('jsonOutput');
    try {
        const obj = JSON.parse(input);
        output.value = JSON.stringify(obj);
    } catch (e) {
        output.value = '❌ JSON格式错误：' + e.message;
    }
}

function validateJson() {
    const input = document.getElementById('jsonInput').value;
    const output = document.getElementById('jsonOutput');
    try {
        JSON.parse(input);
        output.value = '✅ JSON格式正确！';
    } catch (e) {
        output.value = '❌ JSON格式错误：' + e.message;
    }
}

function clearJson() {
    document.getElementById('jsonInput').value = '';
    document.getElementById('jsonOutput').value = '';
}

function convertCode() {
    const type = document.getElementById('coderType').value;
    const input = document.getElementById('coderInput').value;
    const output = document.getElementById('coderOutput');
    
    try {
        let result = '';
        
        if (['json2java', 'json2ts', 'json2go', 'json2sql', 'json2python', 'json2csharp', 'json2rust', 'json2php'].includes(type)) {
            const obj = JSON.parse(input);
            
            switch(type) {
                case 'json2java':
                    result = 'public class Entity {\n';
                    Object.entries(obj).forEach(([key, value]) => {
                        const type = typeof value === 'number' ? (Number.isInteger(value) ? 'Integer' : 'Double') : 'String';
                        const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
                        result += `    private ${type} ${camelKey};\n`;
                    });
                    result += '\n    // Getters and Setters\n';
                    Object.entries(obj).forEach(([key, value]) => {
                        const type = typeof value === 'number' ? (Number.isInteger(value) ? 'Integer' : 'Double') : 'String';
                        const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
                        const upperKey = camelKey.charAt(0).toUpperCase() + camelKey.slice(1);
                        result += `\n    public ${type} get${upperKey}() {\n        return ${camelKey};\n    }\n    public void set${upperKey}(${type} ${camelKey}) {\n        this.${camelKey} = ${camelKey};\n    }`;
                    });
                    result += '\n}';
                    break;
                    
                case 'json2ts':
                    result = 'interface Entity {\n';
                    Object.entries(obj).forEach(([key, value]) => {
                        const type = typeof value === 'number' ? (Number.isInteger(value) ? 'number' : 'number') : 'string';
                        result += `    ${key}: ${type};\n`;
                    });
                    result += '}';
                    break;
                    
                case 'json2go':
                    result = 'type Entity struct {\n';
                    Object.entries(obj).forEach(([key, value]) => {
                        const type = typeof value === 'number' ? (Number.isInteger(value) ? 'int' : 'float64') : 'string';
                        const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
                        const upperKey = camelKey.charAt(0).toUpperCase() + camelKey.slice(1);
                        result += `    ${upperKey} ${type} \`json:"${key}"\`\n`;
                    });
                    result += '}';
                    break;
                    
                case 'json2sql':
                    const tableName = 'my_table';
                    result = `CREATE TABLE ${tableName} (\n`;
                    result += `    id INT PRIMARY KEY AUTO_INCREMENT,\n`;
                    Object.entries(obj).forEach(([key, value], idx) => {
                        const type = typeof value === 'number' ? (Number.isInteger(value) ? 'INT' : 'DECIMAL(10,2)') : 'VARCHAR(255)';
                        result += `    ${key} ${type}${idx < Object.keys(obj).length - 1 ? ',' : ''}\n`;
                    });
                    result += `    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
                    result += ');';
                    break;
                    
                case 'json2python':
                    result = 'class Entity:\n    def __init__(self';
                    const params = Object.keys(obj).map(k => `${k}=None`).join(', ');
                    result += `(${params}):\n`;
                    Object.entries(obj).forEach(([key, value]) => {
                        result += `        self.${key} = ${key}\n`;
                    });
                    result += '\n    def to_dict(self):\n        return {\n';
                    Object.entries(obj).forEach(([key], idx) => {
                        result += `            "${key}": self.${key}${idx < Object.keys(obj).length - 1 ? ',' : ''}\n`;
                    });
                    result += '        }';
                    break;
                    
                case 'json2csharp':
                    result = 'public class Entity\n{\n';
                    Object.entries(obj).forEach(([key, value]) => {
                        const typeMap = { 'number': 'int', 'string': 'string', 'boolean': 'bool' };
                        const type = typeMap[typeof value] || 'object';
                        const upperKey = key.charAt(0).toUpperCase() + key.slice(1);
                        result += `    public ${type} ${upperKey} { get; set; }\n`;
                    });
                    result += '}';
                    break;
                    
                case 'json2rust':
                    result = '#[derive(Serialize, Deserialize)]\npub struct Entity {\n';
                    Object.entries(obj).forEach(([key, value]) => {
                        const type = typeof value === 'number' ? (Number.isInteger(value) ? 'i32' : 'f64') : 'String';
                        result += `    pub ${key}: ${type},\n`;
                    });
                    result += '}';
                    break;
                    
                case 'json2php':
                    result = '<?php\n\nclass Entity\n{\n';
                    Object.entries(obj).forEach(([key, value]) => {
                        result += `    private $${key};\n`;
                    });
                    result += '\n    public function __construct(array $data)\n    {\n';
                    Object.entries(obj).forEach(([key]) => {
                        result += `        $this->${key} = $data['${key}'] ?? null;\n`;
                    });
                    result += '    }\n\n    public function getData(): array\n    {\n        return [\n';
                    Object.entries(obj).forEach(([key], idx) => {
                        result += `            '${key}' => $this->${key}${idx < Object.keys(obj).length - 1 ? ',' : ''}\n`;
                    });
                    result += '        ];\n    }\n}';
                    break;
            }
        } else if (type === 'yaml2json') {
            const lines = input.split('\n');
            const obj = {};
            let currentKey = '';
            let indent = 0;
            
            lines.forEach(line => {
                const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
                if (match) {
                    const [, spaces, key, value] = match;
                    const currentIndent = spaces.length;
                    
                    if (value.trim()) {
                        obj[key.trim()] = value.trim().replace(/['"]/g, '');
                    } else {
                        obj[key.trim()] = '';
                    }
                }
            });
            result = JSON.stringify(obj, null, 2);
        } else if (type === 'xml2json') {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(input, 'text/xml');
            
            function xmlToJson(xml) {
                let obj = {};
                if (xml.nodeType === 1) {
                    if (xml.attributes.length > 0) {
                        obj['@attributes'] = {};
                        for (let j = 0; j < xml.attributes.length; j++) {
                            const attribute = xml.attributes.item(j);
                            obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
                        }
                    }
                } else if (xml.nodeType === 3) {
                    obj = xml.nodeValue;
                }
                
                if (xml.hasChildNodes()) {
                    for (let i = 0; i < xml.childNodes.length; i++) {
                        const item = xml.childNodes.item(i);
                        const nodeName = item.nodeName;
                        
                        if (typeof(obj[nodeName]) == 'undefined') {
                            const json = xmlToJson(item);
                            if (item.nodeType === 3) {
                                if (json.trim()) obj = json;
                            } else {
                                obj[nodeName] = json;
                            }
                        } else {
                            if (typeof(obj[nodeName].push) == 'undefined') {
                                const old = obj[nodeName];
                                obj[nodeName] = [];
                                obj[nodeName].push(old);
                            }
                            obj[nodeName].push(xmlToJson(item));
                        }
                    }
                }
                return obj;
            }
            
            const jsonObj = xmlToJson(xmlDoc.documentElement);
            result = JSON.stringify(jsonObj, null, 2);
        } else {
            result = '不支持的转换类型';
        }
        
        output.value = result;
    } catch (e) {
        output.value = '❌ 转换错误：' + e.message;
    }
}

function encodeUrl() {
    const input = document.getElementById('encoderInput').value;
    document.getElementById('encoderOutput').value = encodeURIComponent(input);
}

function decodeUrl() {
    const input = document.getElementById('encoderInput').value;
    try {
        document.getElementById('encoderOutput').value = decodeURIComponent(input);
    } catch (e) {
        document.getElementById('encoderOutput').value = '❌ 解码错误：' + e.message;
    }
}

function encodeBase64() {
    const input = document.getElementById('encoderInput').value;
    document.getElementById('encoderOutput').value = btoa(unescape(encodeURIComponent(input)));
}

function decodeBase64() {
    const input = document.getElementById('encoderInput').value;
    try {
        document.getElementById('encoderOutput').value = decodeURIComponent(escape(atob(input)));
    } catch (e) {
        document.getElementById('encoderOutput').value = '❌ 解码错误：请检查输入是否是有效的Base64字符串';
    }
}

function generateMd5() {
    const input = document.getElementById('encoderInput').value;
    document.getElementById('encoderOutput').value = md5(input) + ' (MD5)';
}

function timestampToDate() {
    const input = document.getElementById('timestampInput').value.trim();
    const result = document.getElementById('timestampResult');
    
    let timestamp = parseInt(input);
    if (isNaN(timestamp)) {
        result.textContent = '❌ 请输入有效的时间戳';
        result.classList.add('visible');
        return;
    }
    
    if (timestamp < 10000000000) {
        timestamp *= 1000;
    }
    
    const date = new Date(timestamp);
    result.textContent = `📅 转换结果：\n\n${date.toLocaleString('zh-CN', { hour12: false })}\n\nISO格式：${date.toISOString()}`;
    result.classList.add('visible');
}

function dateToTimestamp() {
    const input = document.getElementById('dateInput').value.trim();
    const result = document.getElementById('timestampResult');
    
    const date = new Date(input);
    if (isNaN(date.getTime())) {
        result.textContent = '❌ 请输入有效的日期格式，如 2024-01-01 或 2024-01-01 12:00:00';
        result.classList.add('visible');
        return;
    }
    
    result.textContent = `⏰ 转换结果：\n\n毫秒时间戳：${date.getTime()}\n秒时间戳：${Math.floor(date.getTime() / 1000)}`;
    result.classList.add('visible');
}

function showApiSettings() {
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    const config = getApiConfig();
    
    container.innerHTML = `
        <h2>⚙️ API设置</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
            配置后端服务或API Key以获得AI生成能力。不配置也可使用本地生成器。
        </p>
        
        <div style="margin-bottom: 1rem; padding: 1rem; background: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
            <strong>🚀 推荐：使用后端服务（免费）</strong>
            <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #64748b;">
                1. 先启动后端服务: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">cd backend && npm install && npm start</code><br>
                2. 在下方填入后端地址: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">http://localhost:3001</code>
            </p>
        </div>
        
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">后端服务地址</label>
            <input type="text" id="backendUrl" class="tool-input" style="min-height: auto;" placeholder="如 http://localhost:3001" value="${config.backendUrl || ''}">
        </div>
        
        <div style="margin-bottom: 1rem; padding: 1rem; background: #f1f5f9; border-radius: 8px;">
            <strong>💳 或使用直接API（需要API Key）</strong>
            <div style="margin-top: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">API Key</label>
                <input type="password" id="apiKey" class="tool-input" style="min-height: auto;" placeholder="sk-..." value="${config.apiKey}">
            </div>
            <div style="margin-top: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Base URL</label>
                <input type="text" id="apiBaseUrl" class="tool-input" style="min-height: auto;" placeholder="https://api.openai.com/v1" value="${config.baseUrl}">
            </div>
            <div style="margin-top: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Model</label>
                <input type="text" id="apiModel" class="tool-input" style="min-height: auto;" placeholder="gpt-3.5-turbo" value="${config.model}">
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;">
            <button class="tool-btn" onclick="saveApiSettings()">保存配置</button>
            <button class="tool-btn" style="background: #6b7280;" onclick="testBackend()">测试后端</button>
            <button class="tool-btn" style="background: #ef4444;" onclick="clearApiKey()">清除配置</button>
        </div>
        
        <div id="apiTestResult" style="margin-top: 1rem; padding: 1rem; border-radius: 8px; display: none;"></div>
        
        <div style="margin-top: 1.5rem; padding: 1rem; background: #f0fdf4; border-radius: 8px; font-size: 0.9rem;">
            <strong>💡 获取免费API Key（硅基流动）:</strong>
            <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                <li>访问 <a href="https://siliconflow.cn" target="_blank" style="color: #2563eb;">siliconflow.cn</a> 注册账号</li>
                <li>进入控制台 → API密钥 → 创建新密钥</li>
                <li>将密钥填入上方API Key框中</li>
                <li>推荐模型: Qwen/Qwen2.5-7B-Instruct（免费）</li>
            </ul>
        </div>
    `;
    
    modal.classList.add('active');
}

function saveApiSettings() {
    const config = {
        provider: 'custom',
        apiKey: document.getElementById('apiKey').value.trim(),
        baseUrl: document.getElementById('apiBaseUrl').value.trim() || 'https://api.openai.com/v1',
        model: document.getElementById('apiModel').value.trim() || 'gpt-3.5-turbo',
        backendUrl: document.getElementById('backendUrl').value.trim()
    };
    
    if (!config.apiKey && !config.backendUrl) {
        alert('请输入后端服务地址或API Key');
        return;
    }
    
    saveApiConfig(config);
    alert('✅ 配置已保存！');
}

async function testBackend() {
    const resultDiv = document.getElementById('apiTestResult');
    resultDiv.style.display = 'block';
    resultDiv.style.background = '#fef3c7';
    resultDiv.textContent = '测试中...';
    
    const config = getApiConfig();
    const backendUrl = document.getElementById('backendUrl').value.trim();
    
    if (!backendUrl) {
        resultDiv.style.background = '#fee2e2';
        resultDiv.textContent = '请先输入后端服务地址';
        return;
    }
    
    try {
        const response = await fetch(`${backendUrl}/api/config`);
        if (response.ok) {
            resultDiv.style.background = '#d1fae5';
            resultDiv.textContent = '✅ 后端服务连接成功！';
        } else {
            resultDiv.style.background = '#fee2e2';
            resultDiv.textContent = '❌ 后端服务响应异常';
        }
    } catch (error) {
        resultDiv.style.background = '#fee2e2';
        resultDiv.textContent = `❌ 连接失败: ${error.message}`;
    }
}

async function testApiKey() {
    const resultDiv = document.getElementById('apiTestResult');
    resultDiv.style.display = 'block';
    resultDiv.style.background = '#fef3c7';
    resultDiv.textContent = '测试中...';
    
    const config = getApiConfig();
    
    if (!config.apiKey) {
        resultDiv.style.background = '#fee2e2';
        resultDiv.textContent = '请先输入API Key';
        return;
    }
    
    const result = await callAI('Hello', 'You are a helpful assistant.');
    
    if (result.error) {
        resultDiv.style.background = '#fee2e2';
        resultDiv.textContent = `❌ 测试失败: ${result.message}`;
    } else {
        resultDiv.style.background = '#d1fae5';
        resultDiv.textContent = '✅ API连接成功！';
    }
}

function clearApiConfig() {
    localStorage.removeItem('aiTestHelper_apiConfig');
    Object.assign(API_CONFIG, {
        provider: 'openai',
        apiKey: '',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
        backendUrl: window.location.port === '80' || window.location.port === '443' 
            ? `${window.location.protocol}//${window.location.hostname}` 
            : `${window.location.protocol}//${window.location.hostname}:3001`
    });
    alert('✅ 配置已清除');
    showApiSettings();
}

function showEmail() {
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">📮</div>
            <h2 style="margin-bottom: 1rem;">邮箱地址</h2>
            <p style="font-size: 1.5rem; color: var(--primary-color); font-weight: 600;">liuhaifeng123@foxmail.com</p>
            <button class="tool-btn" style="margin-top: 1.5rem;" onclick="closeModal()">关闭</button>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

const featureDetails = {
    testcase: {
        icon: '📝',
        title: '智能用例生成',
        description: '基于需求文档自动生成测试用例，支持功能测试、接口测试、性能测试等多种类型',
        prompt: `你是一个专业的测试工程师，请根据以下需求生成详细的测试用例。
        
需求描述：
{input}

请生成：
1. 测试点列表
2. 测试用例表格（用例编号、测试目的、前置条件、测试步骤、预期结果）
3. 风险评估`,
        skills: ['需求分析', '测试设计', '边界值分析', '等价类划分']
    },
    automation: {
        icon: '🔧',
        title: '自动化脚本生成',
        description: '快速生成自动化测试脚本，支持Selenium、Playwright、Appium等主流框架',
        prompt: `你是一个自动化测试专家，请根据以下测试需求生成自动化测试脚本。

测试需求：
{input}

请生成可执行的自动化脚本，包含：
1. 测试框架选择建议
2. 完整的测试代码
3. 关键断言
4. 测试数据准备`,
        skills: ['Selenium', 'Playwright', 'Appium', 'Python', 'JavaScript']
    },
    analysis: {
        icon: '🔍',
        title: '缺陷分析',
        description: '智能分析日志和错误信息，快速定位问题根因，提高调试效率',
        prompt: `你是一个测试专家和debugger，请分析以下错误信息并提供解决方案。

错误信息：
{input}

请提供：
1. 问题根因分析
2. 可能的解决方案
3. 预防建议
4. 相关知识点讲解`,
        skills: ['日志分析', 'Debug', '根因分析', '问题定位']
    },
    report: {
        icon: '📊',
        title: '测试报告生成',
        description: '自动生成专业的测试报告，包含覆盖率统计和趋势分析',
        prompt: `你是一个测试经理，请根据以下测试数据生成专业的测试报告。

测试数据：
{input}

请生成：
1. 测试执行摘要
2. 缺陷统计与分析
3. 测试覆盖率报告
4. 风险评估
5. 改进建议`,
        skills: ['测试报告', '数据分析', '覆盖率统计', '趋势分析']
    }
};

function showFeatureDetail(featureKey) {
    const feature = featureDetails[featureKey];
    if (!feature) return;
    
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    
    container.innerHTML = `
        <div class="feature-detail">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="font-size: 2.5rem;">${feature.icon}</div>
                <div>
                    <h2 style="margin: 0;">${feature.title}</h2>
                    <p style="color: var(--text-secondary); margin: 0.5rem 0 0;">${feature.description}</p>
                </div>
            </div>
            
            <div style="background: var(--bg-color); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 1rem;">🎯 使用LLM+MCP/Skills方式</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                    ${feature.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
                </div>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">
                    该功能通过配置大语言模型（LLM）和MCP/Skills技能来实现智能化的${feature.title}。
                </p>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 0.75rem;">💡 Prompt模板</h3>
                <pre style="background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; font-size: 0.85rem; overflow-x: auto; white-space: pre-wrap;">${feature.prompt}</pre>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button class="tool-btn" onclick="testFeatureWithAI('${featureKey}')">🚀 立即体验</button>
                <button class="tool-btn" style="background: var(--secondary-color);" onclick="closeModal()">关闭</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function testFeatureWithAI(featureKey) {
    const feature = featureDetails[featureKey];
    if (!feature) return;
    
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    
    container.innerHTML = `
        <div class="tool-container">
            <h2 style="margin-bottom: 1rem;">${feature.icon} ${feature.title}</h2>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">输入需求，AI将自动使用配置的Skills生成内容</p>
            
            <textarea id="toolInput" class="tool-input" placeholder="请输入需求描述..."></textarea>
            <div style="display: flex; gap: 1rem;">
                <button class="tool-btn" onclick="generateWithSkill('${featureKey}')">🚀 立即生成</button>
                <button class="tool-btn" style="background: var(--secondary-color);" onclick="closeModal()">关闭</button>
            </div>
            <div id="toolOutput" class="tool-output"></div>
        </div>
    `;
    
    modal.classList.add('active');
}

async function generateWithSkill(featureKey) {
    const feature = featureDetails[featureKey];
    const input = document.getElementById('toolInput').value.trim();
    const output = document.getElementById('toolOutput');
    
    if (!input) {
        alert('请输入需求描述');
        return;
    }
    
    output.classList.add('visible');
    output.textContent = '正在加载配置和文件中...\n请稍候...';
    
    try {
        const backendUrl = getBackendUrl();
        const [configRes, filesRes, mappingRes] = await Promise.all([
            fetch(`${backendUrl}/api/llm/config`),
            fetch(`${backendUrl}/api/skills/files`),
            fetch(`${backendUrl}/api/feature-skills`)
        ]);
        
        const configData = await configRes.json();
        const filesData = await filesRes.json();
        const mappingData = await mappingRes.json();
        
        if (!configData.config.apiKey) {
            output.textContent = '⚠️ 请先在后台配置LLM API Key\n\n操作步骤：\n1. 点击导航栏"后台" \n2. 登录账号 (admin/admin123)\n3. 在"LLM模型配置"中填写API Key\n4. 保存配置后重试';
            return;
        }
        
        const mapping = mappingData.mapping || {};
        const featureSkills = mapping[featureKey] || feature.skills;
        
        const skillToId = {
            '需求分析': '1', '测试设计': '2', '自动化测试': '3',
            '缺陷分析': '4', '性能测试': '5', '安全测试': '6',
            '数据分析': '2'
        };
        
        let allFiles = [];
        let skillsUsed = [];
        
        for (const skillName of featureSkills) {
            const skillId = skillToId[skillName] || '1';
            const files = filesData.skillsFiles?.[skillId]?.files || [];
            if (files.length > 0) {
                allFiles = allFiles.concat(files);
                skillsUsed.push(skillName);
            }
        }
        
        if (allFiles.length > 0) {
            output.textContent = `正在使用 ${skillsUsed.join('、')} 技能\n已加载 ${allFiles.length} 个知识文件\n\n通过LLM生成中，请稍候...`;
        } else {
            output.textContent = `正在通过LLM生成中，请稍候...`;
        }
        
        const primarySkillId = skillToId[featureSkills[0]] || '1';
        
        const response = await fetch(`${backendUrl}/api/skills/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                skillId: primarySkillId,
                toolKey: featureKey,
                prompt: feature.prompt.replace('{input}', input),
                context: `使用技能: ${featureSkills.join('、')}`
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            output.textContent = `✅ 使用技能: ${skillsUsed.join('、') || featureSkills.join('、')}\n📁 参考文件数: ${data.filesUsed || 0}\n\n---\n\n${data.content}`;
        } else if (data.needConfig) {
            output.textContent = '⚠️ ' + data.error + '\n\n请先在后台配置LLM API Key';
        } else {
            output.textContent = '生成失败: ' + data.error;
        }
    } catch (error) {
        output.textContent = '连接失败: ' + error.message + '\n\n请确保后端服务正在运行';
    }
}

function closeModal() {
    const modal = document.getElementById('toolModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

async function generateContent(toolKey, forceLocal = false) {
    const input = document.getElementById('toolInput').value.trim();
    const output = document.getElementById('toolOutput');
    const generateBtn = document.getElementById('generateBtn');
    const localBtn = document.getElementById('localBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    if (!input) {
        alert('请输入内容');
        return;
    }
    
    generateBtn.disabled = true;
    localBtn.disabled = true;
    generateBtn.textContent = '生成中...';
    localBtn.textContent = '生成中...';
    
    output.textContent = '';
    output.classList.remove('visible');
    
    const tool = toolTemplates[toolKey];
    let result;
    let usedLocal = forceLocal;
    
    const config = getApiConfig();
    const backendUrl = getBackendUrl();
    
    if (!forceLocal && (config.apiKey || config.backendUrl)) {
        output.textContent = '🤖 正在通过Skills AI生成...\n\n';
        
        try {
            const mappingRes = await fetch(`${backendUrl}/api/feature-skills`);
            const mappingData = await mappingRes.json();
            const mapping = mappingData.mapping || {};
            const toolSkills = mapping[toolKey] || [];
            
            if (toolSkills.length > 0) {
                output.textContent = `使用技能: ${toolSkills.join('、')}\n\n`;
            }
            
            const skillToId = {
                '需求分析': '1', '测试设计': '2', '自动化测试': '3',
                '缺陷分析': '4', '性能测试': '5', '安全测试': '6',
                '数据分析': '2'
            };
            
            const primarySkillId = skillToId[toolSkills[0]] || '1';
            
            const prompt = getPromptForTool(toolKey, input);
            
            output.textContent += '⏳ 正在生成，请稍候...\n';
            
            const response = await fetch(`${backendUrl}/api/skills/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    skillId: primarySkillId,
                    toolKey: toolKey,
                    prompt: prompt,
                    context: `使用技能: ${toolSkills.join('、')}`
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                result = data.content;
                output.textContent = '';
            } else if (data.needConfig) {
                output.textContent += `⚠️ ${data.error}\n\n将使用本地生成...\n\n`;
                usedLocal = true;
            } else {
                output.textContent += `⚠️ AI生成失败: ${data.error}\n\n将使用本地生成...\n\n`;
                usedLocal = true;
            }
        } catch (error) {
            output.textContent += `❌ 连接失败: ${error.message}\n\n请检查后端服务是否正在运行，或使用"本地生成"功能。\n\n将使用本地生成...\n\n`;
            usedLocal = true;
        }
    } else {
        usedLocal = true;
    }
    
    if (usedLocal || !result) {
        result = localGenerators[toolKey](input);
        if (output.textContent.includes('本地生成')) {
            result = output.textContent + result;
        }
    }
    
    output.textContent = result;
    output.classList.add('visible');
    
    generateBtn.disabled = false;
    localBtn.disabled = false;
    generateBtn.textContent = '生成内容';
    localBtn.textContent = '本地生成';
    copyBtn.style.display = 'inline-block';
    
    localStorage.setItem('lastGeneratedContent', result);
}

function getPromptForTool(toolKey, input) {
    const prompts = {
        testcase: `请为以下需求生成详细的测试用例：${input}`,
        xmind: `请将以下需求整理成思维导图的结构：${input}`,
        regexp: `请为以下需求生成正则表达式：${input}`,
        sql: `请为以下需求生成SQL查询语句：${input}`,
        api: `请为以下接口生成API文档：${input}`,
        email: `请为以下测试内容生成测试报告：${input}`
    };
    return prompts[toolKey] || input;
}

function copyContent() {
    const output = document.getElementById('toolOutput');
    const content = output.textContent;
    
    if (content) {
        navigator.clipboard.writeText(content).then(() => {
            const copyBtn = document.getElementById('copyBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ 已复制!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            alert('复制失败，请手动复制');
        });
    }
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

document.getElementById('toolModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const TOOLS_PER_PAGE = 8;
let currentToolsPage = 1;
let toolCardsData = [];

const allToolsData = [
    { key: 'testcase', icon: '📋', title: '测试用例生成器', desc: '输入需求描述，AI自动生成测试用例', badge: '免费使用', isNew: false },
    { key: 'xmind', icon: '🧠', title: '需求转XMind', desc: '将文字需求转换为思维导图结构', badge: '免费使用', isNew: false },
    { key: 'regexp', icon: '🔤', title: '正则表达式生成', desc: '描述你想要匹配的内容，AI帮你写正则', badge: '免费使用', isNew: false },
    { key: 'sql', icon: '🗄️', title: 'SQL查询生成', desc: '用自然语言描述你想查询的数据', badge: '免费使用', isNew: false },
    { key: 'api', icon: '🌐', title: 'API文档生成', desc: '根据接口描述生成API文档', badge: '免费使用', isNew: false },
    { key: 'email', icon: '📧', title: '测试报告模板', desc: '快速生成专业的测试报告', badge: '免费使用', isNew: false },
    { key: 'apitest', icon: '🔬', title: '接口测试工具', desc: '在线发送HTTP请求，测试API接口', badge: 'NEW', isNew: true },
    { key: 'faker', icon: '🎲', title: '测试数据生成', desc: '生成各种类型的测试数据', badge: 'NEW', isNew: true },
    { key: 'json', icon: '📄', title: 'JSON格式化', desc: '格式化、校验、压缩JSON数据', badge: 'NEW', isNew: true },
    { key: 'coder', icon: '💻', title: '代码转换器', desc: '代码格式互转，如JSON转Java实体类', badge: 'NEW', isNew: true },
    { key: 'encoder', icon: '🔐', title: '编码转换工具', desc: 'URL编码、Base64、MD5等编码转换', badge: 'NEW', isNew: true },
    { key: 'timestamp', icon: '⏰', title: '时间戳转换', desc: '时间戳与日期格式互转', badge: 'NEW', isNew: true }
];

async function loadToolsConfig() {
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/online-tools`);
        const data = await response.json();
        
        if (data.success && data.tools) {
            const enabledTools = data.tools.filter(t => t.enabled).map(t => {
                const toolInfo = allToolsData.find(d => d.key === t.key);
                return toolInfo ? { ...toolInfo } : null;
            }).filter(t => t !== null);
            
            toolCardsData = enabledTools;
        } else {
            toolCardsData = allToolsData;
        }
    } catch (error) {
        toolCardsData = allToolsData;
    }
    
    renderToolsPage(1);
    renderCoreFeatures();
}

function renderToolsPage(page) {
    const container = document.getElementById('toolsContainer');
    const paginationContainer = document.getElementById('toolsPagination');
    if (!container) return;
    
    const start = (page - 1) * TOOLS_PER_PAGE;
    const end = start + TOOLS_PER_PAGE;
    const tools = toolCardsData.slice(start, end);
    const totalPages = Math.ceil(toolCardsData.length / TOOLS_PER_PAGE);
    
    let html = '<div class="tools-grid">';
    
    tools.forEach(tool => {
        html += `
            <div class="tool-card" onclick="openTool('${tool.key}')">
                <div class="tool-icon">${tool.icon}</div>
                <h3>${tool.title}</h3>
                <p>${tool.desc}</p>
                <span class="tool-badge${tool.isNew ? ' new' : ''}">${tool.badge}</span>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    if (paginationContainer) {
        if (totalPages > 1) {
            paginationContainer.innerHTML = `
                <div class="pagination-wrapper">
                    <button onclick="changeToolsPage(${page - 1})" ${page === 1 ? 'disabled' : ''} class="page-btn ${page === 1 ? 'disabled' : ''}">← 上一页</button>
                    <span class="page-info">${page} / ${totalPages}</span>
                    <button onclick="changeToolsPage(${page + 1})" ${page === totalPages ? 'disabled' : ''} class="page-btn ${page === totalPages ? 'disabled' : ''}">下一页 →</button>
                </div>
            `;
        } else {
            paginationContainer.innerHTML = '';
        }
    }
    
    currentToolsPage = page;
}

function changeToolsPage(page) {
    const totalPages = Math.ceil(toolCardsData.length / TOOLS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    renderToolsPage(page);
}

document.addEventListener('DOMContentLoaded', function() {
    loadToolsConfig();
    renderAboutSection();
    
    window.saveAbout = function() {
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
        
        renderAboutSection();
        
        alert('保存成功！');
    };
});

function renderAboutSection() {
    const aboutText = document.getElementById('aboutTextContainer');
    const aboutSkills = document.getElementById('aboutSkillsContainer');
    
    if (!aboutText || !aboutSkills) return;
    
    const saved = localStorage.getItem('aiTestHelper_about');
    let aboutData;
    
    if (saved) {
        try {
            aboutData = JSON.parse(saved);
        } catch (e) {
            aboutData = null;
        }
    }
    
    if (aboutData) {
        const paragraphs = aboutData.content.split('\n').filter(p => p.trim());
        aboutText.innerHTML = paragraphs.map(p => {
            const processed = p.replace(/AI测试助手/g, '<span class="highlight">AI测试助手</span>');
            return `<p>${processed}</p>`;
        }).join('');
        
        aboutSkills.innerHTML = aboutData.skills
            .map(skill => `<span class="tag">${skill}</span>`)
            .join('');
    }
}

async function renderCoreFeatures() {
    const container = document.getElementById('featuresGrid');
    if (!container) return;
    
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/core-features`);
        const data = await response.json();
        
        const features = data.features || [];
        
        container.innerHTML = features.map(key => {
            const tool = allToolsData.find(d => d.key === key);
            if (!tool) return '';
            return `
                <div class="feature-card" onclick="openTool('${key}')">
                    <div class="feature-icon">${tool.icon}</div>
                    <h3>${tool.title}</h3>
                    <p>${tool.desc}</p>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">加载核心能力失败</p>';
    }
}
