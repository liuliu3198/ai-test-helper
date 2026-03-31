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

const toolTemplates = {
    testcase: {
        title: '测试用例生成器',
        prompt: '请为以下需求生成详细的测试用例：{input}'
    },
    xmind: {
        title: '需求转XMind',
        prompt: '请将以下需求整理成思维导图的结构：{input}'
    },
    regexp: {
        title: '正则表达式生成',
        prompt: '请为以下需求生成正则表达式：{input}'
    },
    sql: {
        title: 'SQL查询生成',
        prompt: '请为以下需求生成SQL查询：{input}'
    },
    api: {
        title: 'API文档生成',
        prompt: '请为以下需求生成API文档：{input}'
    },
    email: {
        title: '测试报告模板',
        prompt: '请为以下测试内容生成专业的测试报告：{input}'
    },
    apitest: {
        title: '接口测试工具',
        prompt: '请分析以下API接口：{input}'
    },
    faker: {
        title: '测试数据生成',
        prompt: '请生成以下类型的测试数据：{input}'
    },
    json: {
        title: 'JSON格式化',
        prompt: '请格式化以下JSON：{input}'
    },
    coder: {
        title: '代码转换器',
        prompt: '请转换以下代码：{input}'
    },
    encoder: {
        title: '编码转换工具',
        prompt: '请转换以下编码：{input}'
    },
    timestamp: {
        title: '时间戳转换',
        prompt: '请转换以下时间：{input}'
    }
};

const toolsUploadDir = path.join(__dirname, 'tools-skills');
if (!fs.existsSync(toolsUploadDir)) {
    fs.mkdirSync(toolsUploadDir, { recursive: true });
}

function getLocalResponse(toolType, input) {
    const responses = {
        testcase: `测试用例生成结果：

## 功能测试用例

| 用例ID | 测试目的 | 前置条件 | 测试步骤 | 预期结果 |
|--------|----------|----------|----------|----------|
| TC001 | 验证登录成功 | 用户未登录 | 1.输入正确用户名和密码\n2.点击登录按钮 | 登录成功，跳转首页 |
| TC002 | 验证登录失败 | 用户未登录 | 1.输入错误密码\n2.点击登录按钮 | 显示错误提示 |
| TC003 | 验证空用户名 | 用户未登录 | 1.不输入用户名\n2.点击登录按钮 | 提示用户名不能为空 |`,

        xmind: `思维导图结构：

# 需求分析

## 功能需求
- 用户管理
  - 用户注册
  - 用户登录
  - 用户信息修改
- 订单管理
  - 创建订单
  - 查询订单
  - 取消订单

## 非功能需求
- 性能要求
- 安全要求
- 兼容性要求`,

        regexp: `正则表达式生成结果：

1. 手机号: ^1[3-9]\\d{9}$
2. 邮箱: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$
3. 身份证: ^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$
4. URL: ^https?://[\\w.-]+(:\\d+)?(/.*)?$`,

        sql: `SQL查询生成结果：

-- 查询用户表所有数据
SELECT * FROM users;

-- 按条件查询
SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC;`,

        api: `API文档生成结果：

## 用户管理 API

### 1. 用户登录
- URL: POST /api/login
- 参数: { username, password }
- 返回: { token, userInfo }

### 2. 获取用户信息
- URL: GET /api/user/:id
- 返回: { id, username, email, avatar }`,

        email: `测试报告模板：

# 测试报告

## 一、测试概述
本次测试针对XX系统进行了全面测试...

## 二、测试环境
- 服务器: ...
- 数据库: ...

## 三、测试结果
通过率: XX%
缺陷数: X个

## 四、风险评估
...`,

        apitest: `接口测试分析：

请在工具中直接输入URL进行测试

支持方法: GET, POST, PUT, DELETE
支持参数: JSON, FormData`,

        faker: `测试数据生成结果：

用户数据:
{
  "id": 1,
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000"
}

订单数据:
{
  "order_id": "ORD001",
  "amount": 99.99,
  "status": "paid"
}`,

        json: `JSON格式化结果：

{
  "name": "测试",
  "value": 123,
  "enabled": true
}`,

        coder: `代码转换结果：

JSON转Java:
public class Test {
    private String name;
    private Integer value;
    private Boolean enabled;
    // getters and setters
}`,

        encoder: `编码转换结果：

原文: Hello World
URL编码: Hello%20World
Base64编码: SGVsbG8gV29ybGQ=`,

        timestamp: `时间戳转换结果：

当前时间: 2024-01-01 12:00:00
时间戳: 1704091200000
毫秒时间戳: 1704091200000`
    };

    return responses[toolType] || `这是${toolType}工具对"${input}"的本地生成结果。配置API Key可获得AI生成的智能结果。`;
}

app.post('/api/ai/generate', async (req, res) => {
    try {
        const { toolType, input } = req.body;
        const result = getLocalResponse(toolType, input);
        res.json({ success: true, content: result });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/api/config', (req, res) => {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        res.json(config);
    } else {
        res.json({});
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
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
            return res.json({ success: false, error: '请先配置API Key' });
        }

        const response = await axios.post(
            `${BASE_URL}/chat/completions`,
            {
                model: Model,
                messages: messages,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ success: true, content: response.data.choices[0].message.content });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.use('/uploads', express.static('uploads'));

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
            skillsFiles[skillId] = { name: skillName, files: [] };
        }
        
        skillsFiles[skillId].files.push({
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            uploadedAt: new Date().toISOString()
        });
        
        fs.writeFileSync(skillsPath, JSON.stringify(skillsFiles, null, 2));
        res.json({ success: true, message: '文件上传成功' });
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
        const { skillId, prompt, context, toolKey } = req.body;
        
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
        
        if (toolKey) {
            const toolDir = path.join(toolsUploadDir, toolKey);
            if (fs.existsSync(toolDir)) {
                const readDirRecursive = (dir, basePath = '') => {
                    const items = fs.readdirSync(dir);
                    for (const item of items) {
                        const fullPath = path.join(dir, item);
                        const relativePath = basePath ? path.join(basePath, item) : item;
                        if (fs.statSync(fullPath).isDirectory()) {
                            readDirRecursive(fullPath, relativePath);
                        } else if (fs.statSync(fullPath).isFile()) {
                            try {
                                const content = fs.readFileSync(fullPath, 'utf8');
                                fileContents += `\n\n=== ${relativePath} ===\n${content}\n`;
                            } catch (e) {
                                console.error(`读取文件失败: ${fullPath}`, e.message);
                            }
                        }
                    }
                };
                readDirRecursive(toolDir);
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
            return res.json({ success: false, error: '请先配置API Key', needConfig: true });
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
        res.json({ success: false, error: error.response?.data?.error?.message || error.message });
    }
});

app.get('/api/core-features', (req, res) => {
    const featuresPath = path.join(__dirname, 'core-features.json');
    
    try {
        if (fs.existsSync(featuresPath)) {
            const data = JSON.parse(fs.readFileSync(featuresPath, 'utf8'));
            res.json({ success: true, features: data.features || [] });
        } else {
            res.json({ success: true, features: ['testcase', 'xmind', 'regexp', 'sql', 'api', 'email', 'apitest', 'faker'] });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/core-features', (req, res) => {
    const featuresPath = path.join(__dirname, 'core-features.json');
    
    try {
        const { features } = req.body;
        fs.writeFileSync(featuresPath, JSON.stringify({ features }, null, 2));
        res.json({ success: true, message: '核心能力展示配置已保存' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/api/feature-skills', (req, res) => {
    const mappingPath = path.join(__dirname, 'feature-skills.json');
    
    try {
        if (fs.existsSync(mappingPath)) {
            const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
            res.json({ success: true, mapping });
        } else {
            const defaultMapping = {
                testcase: ['需求分析', '测试设计'],
                automation: ['自动化测试'],
                analysis: ['缺陷分析'],
                report: ['测试设计', '数据分析']
            };
            res.json({ success: true, mapping: defaultMapping });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/feature-skills', (req, res) => {
    const mappingPath = path.join(__dirname, 'feature-skills.json');
    
    try {
        const { mapping } = req.body;
        fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
        res.json({ success: true, message: '功能-Skills关联已保存' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
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

app.post('/api/llm/test', async (req, res) => {
    try {
        const { apiKey, baseUrl, model } = req.body;
        
        if (!apiKey || !baseUrl || !model) {
            return res.json({ success: false, error: '请填写API Key、Base URL和Model' });
        }
        
        const response = await axios.post(
            `${baseUrl}/chat/completions`,
            {
                model: model,
                messages: [
                    { role: 'user', content: '你好，请回复"连接测试成功"' }
                ],
                temperature: 0.7,
                max_tokens: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        if (response.data.choices && response.data.choices[0]) {
            res.json({ success: true, content: response.data.choices[0].message.content });
        } else {
            res.json({ success: false, error: '未收到有效回复' });
        }
    } catch (error) {
        res.json({ success: false, error: error.response?.data?.error?.message || error.message });
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
            return res.json({ success: false, error: '请先配置API Key', needConfig: true });
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

        res.json({ success: true, content: response.data.choices[0].message.content });
    } catch (error) {
        console.error('AI Error:', error.response?.data || error.message);
        res.json({ success: false, error: error.response?.data?.error?.message || error.message });
    }
});

app.get('/api/online-tools', (req, res) => {
    const toolsPath = path.join(__dirname, 'online-tools.json');
    
    try {
        if (fs.existsSync(toolsPath)) {
            const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
            res.json({ success: true, tools });
        } else {
            const defaultTools = [
                { key: 'testcase', name: '测试用例生成器', enabled: true, showInCore: true },
                { key: 'xmind', name: '需求转XMind', enabled: true, showInCore: true },
                { key: 'regexp', name: '正则表达式生成', enabled: true, showInCore: false },
                { key: 'sql', name: 'SQL查询生成', enabled: true, showInCore: false },
                { key: 'api', name: 'API文档生成', enabled: true, showInCore: false },
                { key: 'email', name: '测试报告模板', enabled: true, showInCore: false },
                { key: 'apitest', name: '接口测试工具', enabled: true, showInCore: true },
                { key: 'faker', name: '测试数据生成', enabled: true, showInCore: true },
                { key: 'json', name: 'JSON格式化', enabled: true, showInCore: false },
                { key: 'coder', name: '代码转换器', enabled: true, showInCore: false },
                { key: 'encoder', name: '编码转换工具', enabled: true, showInCore: false },
                { key: 'timestamp', name: '时间戳转换', enabled: true, showInCore: false }
            ];
            res.json({ success: true, tools: defaultTools });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/online-tools', (req, res) => {
    const toolsPath = path.join(__dirname, 'online-tools.json');
    
    try {
        const tools = req.body.tools;
        fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

const toolMulter = multer({ dest: toolsUploadDir });

app.post('/api/tools/upload', toolMulter.array('files', 50), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.json({ success: false, error: '没有文件' });
        }
        
        const toolKey = req.body.toolKey;
        const toolDir = path.join(toolsUploadDir, toolKey);
        
        if (!fs.existsSync(toolDir)) {
            fs.mkdirSync(toolDir, { recursive: true });
        }
        
        const uploadedFiles = [];
        
        req.files.forEach(file => {
            let relativePath = file.originalname;
            
            if (file.path && fs.existsSync(file.path)) {
                const tempPathParts = file.path.split(path.sep);
                const tempLen = tempPathParts.length;
                if (tempLen > 1) {
                    const lastParts = tempPathParts.slice(-2, -1)[0];
                    if (lastParts && lastParts !== 'undefined' && lastParts !== toolKey) {
                        relativePath = path.join(lastParts, file.originalname);
                    }
                }
            }
            
            const relativePathObj = path.parse(relativePath);
            const destDir = path.join(toolDir, relativePathObj.dir);
            
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            
            let newPath = path.join(toolDir, relativePath);
            let finalPath = newPath;
            let counter = 1;
            
            while (fs.existsSync(finalPath)) {
                const ext = path.extname(relativePath);
                const basename = path.basename(relativePath, ext);
                finalPath = path.join(toolDir, relativePathObj.dir, `${basename}_${counter}${ext}`);
                counter++;
            }
            
            fs.renameSync(file.path, finalPath);
            uploadedFiles.push(relativePath);
        });

        res.json({ success: true, filenames: uploadedFiles });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/api/tools/files', (req, res) => {
    try {
        const skillsFiles = {};
        
        if (fs.existsSync(toolsUploadDir)) {
            const toolDirs = fs.readdirSync(toolsUploadDir);
            
            toolDirs.forEach(toolKey => {
                const toolDir = path.join(toolsUploadDir, toolKey);
                if (fs.statSync(toolDir).isDirectory()) {
                    const files = [];
                    const walkDir = (dir, basePath = '') => {
                        const items = fs.readdirSync(dir);
                        items.forEach(item => {
                            const fullPath = path.join(dir, item);
                            const relativePath = basePath ? path.join(basePath, item) : item;
                            if (fs.statSync(fullPath).isDirectory()) {
                                walkDir(fullPath, relativePath);
                            } else {
                                files.push({
                                    filename: relativePath,
                                    originalName: relativePath,
                                    isDirectory: false
                                });
                            }
                        });
                    };
                    walkDir(toolDir);
                    skillsFiles[toolKey] = files;
                }
            });
        }
        
        res.json({ success: true, skillsFiles });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.delete('/api/tools/files/:toolKey/:filename', (req, res) => {
    try {
        const { toolKey, filename } = req.params;
        let decodedFilename = decodeURIComponent(filename);
        
        let filePath = path.join(toolsUploadDir, toolKey, decodedFilename);
        
        if (!fs.existsSync(filePath)) {
            const normalizedFilename = decodedFilename.replace(/^tools-skills[\\\/]/, '');
            filePath = path.join(toolsUploadDir, toolKey, normalizedFilename);
        }
        
        if (!fs.existsSync(filePath)) {
            const parts = decodedFilename.split(path.sep);
            const actualFilename = parts[parts.length - 1];
            filePath = path.join(toolsUploadDir, toolKey, actualFilename);
        }
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true });
        } else {
            res.json({ success: false, error: '文件不存在: ' + filePath });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🤖 AI测试助手后端服务已启动: http://localhost:${PORT}`);
});
