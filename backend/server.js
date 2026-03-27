const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

function generateMockResponse(toolType, input) {
    const mockResponses = {
        testcase: `📋 测试用例生成结果

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【用户登录功能测试用例】

一、正常功能测试

| ID | 测试项 | 前置条件 | 测试步骤 | 预期结果 | 优先级 | 类型 |
|----|--------|----------|----------|----------|--------|------|
| 1 | 正常登录 | 用户未登录 | 1. 输入正确用户名和密码 2. 点击登录按钮 | 登录成功，跳转首页 | P0 | 功能 |
| 2 | 记住密码 | 用户未登录 | 1. 勾选记住密码 2. 登录 | 下次自动填充密码 | P1 | 功能 |

二、异常测试

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| 1 | 用户名为空 | 不输入用户名直接登录 | 提示"用户名不能为空" | P0 |
| 2 | 密码错误 | 输入正确用户名和错误密码 | 提示"密码错误" | P0 |
| 3 | 用户不存在 | 输入不存在的用户名 | 提示"用户不存在" | P0 |
| 4 | 密码错误5次 | 连续5次输入错误密码 | 账号锁定30分钟 | P0 |

三、边界值测试
- 用户名长度：5位（失败）、6位（成功）、20位（成功）、21位（失败）
- 密码长度：7位（失败）、8位（成功）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 提示：这是模拟响应。配置真实API Key可获得更精确的结果。`,
        
        xmind: `🧠 需求思维导图结构

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【用户登录模块】

📌 登录功能
│
├─ 【功能】
│  ├─ 用户名密码登录
│  ├─ 短信验证码登录  
│  └─ 第三方登录
│
├─ 【流程】
│  ├─ 输入账号密码
│  ├─ 验证credentials
│  └─ 返回token
│
├─ 【规则】
│  ├─ 用户名：6-20位
│  ├─ 密码：8-20位
│  └─ 错误5次锁定
│
└─ 【异常】
   ├─ 用户不存在
   ├─ 密码错误
   └─ 账号锁定

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 关键测试点：
• 登录流程正确性
• 错误提示友好性
• 账号安全保护

💡 提示：配置API Key可获得更详细的思维导图`,

        regexp: `🔤 正则表达式生成结果

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【匹配中国大陆手机号】

正则表达式：
\`^1[3-9]\\d{9}$\`

解释：
• ^1 - 必须以1开头
• [3-9] - 第二位是3-9
• \\d{9} - 后面9位数字
• $ - 结束

匹配示例：
✅ 13812345678
✅ 15987654321
✅ 19912345678

不匹配：
❌ 12012345678 (第二位是2)
❌ 1381234567 (只有10位)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 提示：配置API Key可生成更复杂的正则表达式`,

        sql: `🗄️ SQL查询生成结果

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【假设表结构】

\`\`\`sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);
\`\`\`

【查询SQL】

\`\`\`sql
SELECT user_id, username, email, created_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 100;
\`\`\`

【说明】
• WHERE - 筛选激活用户
• ORDER BY - 按创建时间降序
• LIMIT - 限制返回100条

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 提示：配置API Key可生成更复杂的SQL查询`,

        api: `🌐 API文档生成结果

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 用户登录接口

### 请求信息

| 项目 | 内容 |
|------|------|
| 请求方法 | **POST** |
| 请求路径 | /api/login |
| Content-Type | application/json |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

### 请求示例

\`\`\`json
{
    "username": "testuser",
    "password": "Test1234"
}
\`\`\`

### 响应示例

**成功响应 (200)**
\`\`\`json
{
    "code": 200,
    "message": "success",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "userId": 10001,
        "username": "testuser"
    }
}
\`\`\`

**失败响应 (401)**
\`\`\`json
{
    "code": 401,
    "message": "用户名或密码错误",
    "data": null
}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 提示：配置API Key可生成更详细的API文档`,

        email: `══════════════════════════════════════════
              测试报告
══════════════════════════════════════════

【一、测试概述】

本次测试针对用户登录、订单管理、支付三个核心模块进行了全面测试。

【二、测试范围】

| 模块 | 测试类型 | 用例数 | 通过 | 失败 |
|------|----------|--------|------|------|
| 用户登录 | 功能+异常 | 25 | 24 | 1 |
| 订单管理 | 功能+界面 | 40 | 38 | 2 |
| 支付模块 | 功能+异常 | 30 | 30 | 0 |
| 合计 | - | 95 | 92 | 3 |

【三、测试结果统计】

• 总用例数：95
• 执行数：95
• 通过数：92
• 失败数：3
• 通过率：96.8%

【四、缺陷分析】

| 严重程度 | 数量 | 状态 |
|----------|------|------|
| 严重 | 1 | 已修复 |
| 一般 | 2 | 已修复 |

【五、测试结论】

✅ 核心功能测试通过率达到预期
✅ 主要业务流程运行正常
✅ 系统具备上线条件

══════════════════════════════════════════
报告日期：${new Date().toLocaleDateString('zh-CN')}
══════════════════════════════════════════

💡 提示：配置API Key可生成更专业的测试报告`
    };
    
    return mockResponses[toolType] || mockResponses.testcase;
}

const SYSTEM_PROMPTS = {
    testcase: `你是一个资深的测试工程师，擅长生成高质量的测试用例。
请根据用户提供的需求，生成详细的测试用例表格。
要求：
1. 包含正常用例和异常用例
2. 包含前置条件、测试步骤、预期结果
3. 标注优先级（P0/P1/P2）
4. 标注测试类型（功能/异常/边界）
5. 输出格式要清晰美观`,

    xmind: `你是一个思维导图专家，擅长将需求整理成清晰的层级结构。
请将用户的需求整理成思维导图格式。
要求：
1. 使用层级缩进表示从属关系
2. 标注关键测试点
3. 分类清晰（功能、流程、规则等）`,

    regexp: `你是一个正则表达式专家，擅长用简洁的正则表达式解决各种匹配问题。
请为用户的需求生成正则表达式。
要求：
1. 给出正则表达式
2. 详细解释正则的每一部分
3. 给出匹配示例和不匹配示例`,

    sql: `你是一个SQL专家，擅长编写高效的查询语句。
请根据用户的需求生成SQL查询。
要求：
1. 先给出合理的表结构假设
2. 写出完整的查询SQL
3. 简要说明SQL逻辑`,

    api: `你是一个API文档专家，擅长编写清晰规范的接口文档。
请根据用户提供的接口描述生成完整的API文档。
要求：
1. 包含请求方法、路径、参数说明
2. 包含请求示例和响应示例
3. 包含错误码说明`,

    email: `你是一个测试报告专家，擅长编写专业清晰的测试报告。
请根据用户提供的测试情况生成专业的测试报告。
要求：
1. 包含测试概述、测试范围
2. 包含测试结果统计（用例数、通过率等）
3. 包含缺陷分析
4. 包含测试结论和后续建议`
};

async function callAI(prompt, toolType = 'testcase', model = 'Qwen/Qwen2.5-7B-Instruct') {
    const API_KEY = process.env.SILICON_API_KEY || '';
    const BASE_URL = process.env.SILICON_BASE_URL || 'https://api.siliconflow.cn/v1';
    
    if (!API_KEY) {
        return generateMockResponse(toolType, prompt);
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/chat/completions`,
            {
                model: model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPTS[model.split('/')[1]] || SYSTEM_PROMPTS.testcase },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('AI API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || error.message || 'AI调用失败');
    }
}

app.post('/api/ai/generate', async (req, res) => {
    try {
        const { toolType, input, model } = req.body;

        if (!input || !toolType) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const prompt = buildPrompt(toolType, input);
        const result = await callAI(prompt, toolType, model || 'Qwen/Qwen2.5-7B-Instruct');

        res.json({ success: true, content: result });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/api/config', (req, res) => {
    res.json({
        hasApiKey: !!process.env.SILICON_API_KEY,
        model: process.env.AI_MODEL || 'Qwen/Qwen2.5-7B-Instruct'
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: '消息格式错误' });
        }

        const API_KEY = process.env.SILICON_API_KEY || '';
        const BASE_URL = process.env.SILICON_BASE_URL || 'https://api.siliconflow.cn/v1';

        if (!API_KEY) {
            return res.status(401).json({ error: '请先配置API Key' });
        }

        const response = await axios.post(
            `${BASE_URL}/chat/completions`,
            {
                model: model || 'Qwen/Qwen2.5-7B-Instruct',
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        res.json({ 
            success: true, 
            content: response.data.choices[0].message.content 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

function buildPrompt(toolType, input) {
    const prompts = {
        testcase: `请为以下需求生成详细的测试用例：

${input}`,

        xmind: `请将以下需求整理成思维导图的结构：

${input}`,

        regexp: `请为以下需求生成正则表达式：

${input}`,

        sql: `请为以下需求生成SQL查询语句：

${input}`,

        api: `请为以下接口生成完整的API文档：

${input}`,

        email: `请为以下测试内容生成专业的测试报告：

${input}`
    };

    return prompts[toolType] || input;
}

app.use('/uploads', express.static('uploads'));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

app.post('/api/skills/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, error: '没有上传文件' });
        }
        
        const skillId = req.body.skillId;
        const skillName = req.body.skillName;
        
        const skillsPath = path.join(__dirname, 'skills-files.json');
        let skillsFiles = {};
        
        if (fs.existsSync(skillsPath)) {
            skillsFiles = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
        }
        
        if (!skillsFiles[skillId]) {
            skillsFiles[skillId] = {
                name: skillName,
                files: []
            };
        }
        
        skillsFiles[skillId].files.push({
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            uploadedAt: new Date().toISOString()
        });
        
        fs.writeFileSync(skillsPath, JSON.stringify(skillsFiles, null, 2));
        
        res.json({ 
            success: true, 
            message: '文件上传成功',
            file: {
                name: req.file.originalname,
                size: req.file.size
            }
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/api/skills/files', (req, res) => {
    try {
        const skillsPath = path.join(__dirname, 'skills-files.json');
        
        if (fs.existsSync(skillsPath)) {
            const skillsFiles = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
            res.json({ success: true, skillsFiles });
        } else {
            res.json({ success: true, skillsFiles: {} });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.delete('/api/skills/files/:skillId/:filename', (req, res) => {
    try {
        const { skillId, filename } = req.params;
        const skillsPath = path.join(__dirname, 'skills-files.json');
        
        if (fs.existsSync(skillsPath)) {
            let skillsFiles = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
            
            if (skillsFiles[skillId]) {
                const fileIndex = skillsFiles[skillId].files.findIndex(f => f.filename === filename);
                if (fileIndex > -1) {
                    const filePath = path.join(uploadDir, filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    skillsFiles[skillId].files.splice(fileIndex, 1);
                    fs.writeFileSync(skillsPath, JSON.stringify(skillsFiles, null, 2));
                    return res.json({ success: true, message: '文件已删除' });
                }
            }
        }
        
        res.json({ success: false, error: '文件不存在' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/skills/process', async (req, res) => {
    try {
        const { skillId, prompt, context } = req.body;
        
        const skillsPath = path.join(__dirname, 'skills-files.json');
        let skillFiles = [];
        
        if (fs.existsSync(skillsPath)) {
            const skillsFiles = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
            skillFiles = skillsFiles[skillId]?.files || [];
        }
        
        let fileContents = '';
        
        for (const file of skillFiles) {
            const filePath = path.join(uploadDir, file.filename);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                fileContents += `\n\n=== ${file.originalName} ===\n${content}\n`;
            }
        }
        
        const configPath = path.join(__dirname, 'llm-config.json');
        let API_KEY = process.env.SILICON_API_KEY || '';
        let BASE_URL = 'https://api.siliconflow.cn/v1';
        let Model = 'Qwen/Qwen2.5-7B-Instruct';
        
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.apiKey) API_KEY = config.apiKey;
            if (config.baseUrl) BASE_URL = config.baseUrl;
            if (config.model) Model = config.model;
        }

        if (!API_KEY) {
            return res.json({ 
                success: false, 
                error: '请先配置API Key',
                needConfig: true
            });
        }

        const skillInfoPath = path.join(__dirname, 'skills-config.json');
        let skillInfo = { name: '未知技能', description: '' };
        
        if (fs.existsSync(skillInfoPath)) {
            const skillsList = JSON.parse(fs.readFileSync(skillInfoPath, 'utf8'));
            const found = skillsList.find(s => s.id === parseInt(skillId));
            if (found) skillInfo = found;
        }

        const systemPrompt = `你是一个专业的测试专家，擅长【${skillInfo.name}】技能。
${skillInfo.description ? `技能描述：${skillInfo.description}` : ''}

${fileContents ? `以下是与该技能相关的知识文件：\n${fileContents}` : ''}

请根据以上信息和用户的需求，提供专业的测试相关服务。`;

        const systemPrompt = `你是一个专业的测试专家，擅长【${skillInfo.name}】技能。
${skillInfo.description ? `技能描述：${skillInfo.description}` : ''}

${fileContents ? `以下是与该技能相关的知识文件：\n${fileContents}` : ''}

请根据以上信息和用户的需求，提供专业的测试相关服务。`;

        const response = await axios.post(
            `${BASE_URL}/chat/completions`,
            {
                model: Model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt + (context ? `\n\n补充信息：${context}` : '') }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 120000
            }
        );

        res.json({ 
            success: true, 
            content: response.data.choices[0].message.content,
            skillInfo: skillInfo,
            filesUsed: skillFiles.length
        });
    } catch (error) {
        console.error('Skill Process Error:', error.response?.data || error.message);
        res.json({ 
            success: false, 
            error: error.response?.data?.error?.message || error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🤖 AI测试助手后端服务已启动: http://localhost:${PORT}`);
    console.log(`📝 API端点: http://localhost:${PORT}/api/ai/generate`);
});

app.get('/api/llm/config', (req, res) => {
    const configPath = path.join(__dirname, 'llm-config.json');
    
    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config.apiKey = config.apiKey ? '***已配置***' : '';
            res.json({ success: true, config });
        } else {
            res.json({ 
                success: true, 
                config: {
                    provider: 'siliconflow',
                    apiKey: '',
                    baseUrl: 'https://api.siliconflow.cn/v1',
                    model: 'Qwen/Qwen2.5-7B-Instruct'
                } 
            });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/llm/config', (req, res) => {
    const configPath = path.join(__dirname, 'llm-config.json');
    
    try {
        const config = req.body;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        res.json({ success: true, message: '配置已保存' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/api/skills/config', (req, res) => {
    const skillsPath = path.join(__dirname, 'skills-config.json');
    
    try {
        if (fs.existsSync(skillsPath)) {
            const skills = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
            res.json({ success: true, skills });
        } else {
            const defaultSkills = [
                { id: 1, name: '需求分析', description: '分析需求文档，提取测试点', enabled: true },
                { id: 2, name: '测试设计', description: '设计测试用例和测试策略', enabled: true },
                { id: 3, name: '自动化测试', description: '编写自动化测试脚本', enabled: true },
                { id: 4, name: '缺陷分析', description: '分析缺陷原因和影响', enabled: true },
                { id: 5, name: '性能测试', description: '进行性能测试和调优', enabled: false },
                { id: 6, name: '安全测试', description: '进行安全测试和漏洞扫描', enabled: false }
            ];
            res.json({ success: true, skills: defaultSkills });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/skills/config', (req, res) => {
    const skillsPath = path.join(__dirname, 'skills-config.json');
    
    try {
        const skills = req.body;
        fs.writeFileSync(skillsPath, JSON.stringify(skills, null, 2));
        res.json({ success: true, message: '技能配置已保存' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { prompt, systemPrompt, model } = req.body;
        
        const configPath = path.join(__dirname, 'llm-config.json');
        
        let API_KEY = process.env.SILICON_API_KEY || '';
        let BASE_URL = 'https://api.siliconflow.cn/v1';
        let Model = model || 'Qwen/Qwen2.5-7B-Instruct';
        
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.apiKey) API_KEY = config.apiKey;
            if (config.baseUrl) BASE_URL = config.baseUrl;
            if (config.model) Model = config.model;
        }

        if (!API_KEY) {
            return res.json({ 
                success: false, 
                error: '请先在后台配置API Key',
                needConfig: true
            });
        }

        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await axios.post(
            `${BASE_URL}/chat/completions`,
            {
                model: Model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 120000
            }
        );

        res.json({ 
            success: true, 
            content: response.data.choices[0].message.content 
        });
    } catch (error) {
        console.error('AI Error:', error.response?.data || error.message);
        res.json({ 
            success: false, 
            error: error.response?.data?.error?.message || error.message 
        });
    }
});
