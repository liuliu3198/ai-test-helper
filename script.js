const toolTemplates = {
    testcase: {
        title: '测试用例生成器',
        description: '输入需求描述，AI将帮你生成测试用例',
        placeholder: '例如：用户登录功能\n- 用户名：6-20位字母数字组合\n- 密码：8-20位，必须包含大小写字母和数字\n- 登录成功后跳转至首页\n- 连续5次密码错误锁定账户',
        generatePrompt: (input) => `请为以下需求生成详细的测试用例，包括正常用例和异常用例：

${input}

请按以下格式输出：
1. 测试项
2. 前置条件
3. 测试步骤
4. 预期结果
5. 优先级（P0/P1/P2）
6. 测试类型（功能/界面/兼容/性能）`
    },
    xmind: {
        title: '需求转XMind',
        description: '将文字需求转换为思维导图结构，方便梳理',
        placeholder: '例如：电商订单管理模块\n1. 订单创建：用户选择商品加入购物车，填写收货地址，选择支付方式提交订单\n2. 订单支付：支持微信、支付宝、银行卡支付，支付成功更新订单状态\n3. 订单发货：商家发货，填写物流信息\n4. 订单收货：用户确认收货或自动确认\n5. 订单售后：支持退款退货',
        generatePrompt: (input) => `请将以下需求整理成思维导图的结构，使用层级清晰的格式：

${input}

请按以下格式输出：
- 一级主题（主要模块）
  - 二级主题（子功能）
    - 三级主题（具体功能点/业务流程）
    
并标注关键测试点`
    },
    regexp: {
        title: '正则表达式生成',
        description: '描述你想要匹配的内容，AI帮你生成正则表达式',
        placeholder: '例如：匹配中国大陆手机号，1开头，第二位是3-9，后面9位数字',
        generatePrompt: (input) => `请为以下需求生成正则表达式，并解释其含义：

需求：${input}

请输出：
1. 正则表达式
2. 解释
3. 匹配示例（至少3个）`
    },
    sql: {
        title: 'SQL查询生成',
        description: '用自然语言描述你想查询的数据，AI帮你生成SQL',
        placeholder: '例如：查询2024年1月份销售额超过10000元的订单，按销售额降序排列，显示订单号、客户名、销售额、订单日期',
        generatePrompt: (input) => `请为以下需求生成SQL查询语句：

需求：${input}

请假设合理的表结构（如orders, customers, products等），并输出：
1. 建表语句（如果需要）
2. 查询SQL
3. SQL说明`
    },
    api: {
        title: 'API文档生成',
        description: '根据接口描述生成API文档',
        placeholder: '例如：用户登录接口\n- 请求方式：POST\n- 请求路径：/api/login\n- 请求参数：username(用户名), password(密码)\n- 返回：token, userId, username',
        generatePrompt: (input) => `请为以下接口生成完整的API文档：

${input}

请包含：
1. 接口说明
2. 请求方法
3. 请求路径
4. 请求头
5. 请求参数（说明类型、必填、示例）
6. 响应示例（成功和失败）
7. 错误码说明`
    },
    email: {
        title: '测试报告模板',
        description: '快速生成专业的测试报告',
        placeholder: '例如：本次测试了用户登录、订单管理、支付三个模块，发现5个bug，3个严重，2个一般，已修复4个',
        generatePrompt: (input) => `请为以下测试内容生成专业的测试报告模板：

${input}

请包含：
1. 测试概述
2. 测试范围
3. 测试结果统计
4. 缺陷分析
5. 测试结论
6. 风险评估
7. 后续建议`
    }
};

function openTool(toolKey) {
    const tool = toolTemplates[toolKey];
    const modal = document.getElementById('toolModal');
    const container = document.getElementById('toolContainer');
    
    container.innerHTML = `
        <h2>${tool.title}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${tool.description}</p>
        <textarea id="toolInput" class="tool-input" placeholder="${tool.placeholder}"></textarea>
        <div style="display: flex; align-items: center;">
            <button id="generateBtn" class="tool-btn" onclick="generateContent('${toolKey}')">生成内容</button>
            <button id="copyBtn" class="tool-btn copy-btn" onclick="copyContent()" style="display: none;">复制结果</button>
        </div>
        <div id="toolOutput" class="tool-output"></div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('toolModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function generateContent(toolKey) {
    const input = document.getElementById('toolInput').value.trim();
    const output = document.getElementById('toolOutput');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    if (!input) {
        alert('请输入内容');
        return;
    }
    
    generateBtn.disabled = true;
    generateBtn.textContent = '生成中...';
    
    const tool = toolTemplates[toolKey];
    const prompt = tool.generatePrompt(input);
    
    setTimeout(() => {
        const result = generateWithAI(prompt, toolKey);
        
        output.textContent = result;
        output.classList.add('visible');
        
        generateBtn.disabled = false;
        generateBtn.textContent = '重新生成';
        copyBtn.style.display = 'inline-block';
        
        localStorage.setItem('lastGeneratedContent', result);
    }, 1500);
}

function generateWithAI(prompt, toolKey) {
    const mockResponses = {
        testcase: `测试用例生成结果：

【用户登录功能测试用例】

一、正常功能测试

| 序号 | 测试项 | 前置条件 | 测试步骤 | 预期结果 | 优先级 | 测试类型 |
|------|--------|----------|----------|----------|--------|----------|
| 1 | 正常登录 | 用户未登录，输入正确的用户名和密码 | 1. 输入正确用户名<br>2. 输入正确密码<br>3. 点击登录按钮 | 登录成功，跳转至首页，显示用户名 | P0 | 功能 |
| 2 | 记住密码 | 用户之前勾选过记住密码 | 1. 打开登录页面<br>2. 检查用户名和密码是否自动填充 | 用户名和密码自动填充 | P1 | 功能 |

二、异常测试

| 序号 | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|------|--------|----------|----------|--------|
| 1 | 用户名为空 | 不输入用户名，直接点击登录 | 提示"用户名不能为空" | P0 |
| 2 | 密码错误 | 输入正确用户名和错误密码 | 提示"密码错误，您还有4次机会" | P0 |
| 3 | 用户不存在 | 输入不存在的用户名 | 提示"用户不存在" | P0 |
| 4 | 密码错误5次 | 连续5次输入错误密码 | 提示"账号已锁定，请30分钟后重试" | P0 |

三、边界值测试
- 用户名长度：5位（失败）、6位（成功）、20位（成功）、21位（失败）
- 密码长度：7位（失败）、8位（成功）、20位（成功）、21位（失败）`,
        
        xmind: `需求思维导图结构：

【电商订单管理模块】

📦 订单创建
   ├─ 商品选择
   │  ├─ 加入购物车
   │  ├─ 立即购买
   │  └─ 数量选择
   ├─ 收货地址
   │  ├─ 新增地址
   │  ├─ 选择已有地址
   │  └─ 地址验证
   └─ 支付方式
      ├─ 微信支付
      ├─ 支付宝
      └─ 银行卡

💳 订单支付
   ├─ 支付跳转
   │  ├─ 微信扫码
   │  ├─ 支付宝跳转
   │  └─ 银行支付
   ├─ 支付状态
   │  ├─ 支付成功
   │  ├─ 支付失败
   │  └─ 支付超时
   └─ 状态更新
      └─ 订单状态变更

📤 订单发货
   ├─ 商家发货
   │  ├─ 填写物流信息
   │  └─ 选择物流公司
   └─ 物流跟踪
      ├─ 实时定位
      └─ 签收提醒

📥 订单收货
   ├─ 手动确认收货
   ├─ 自动确认收货（7天）
   └─ 物流异常处理

🔄 订单售后
   ├─ 退款
   │  ├─ 仅退款
   │  └─ 退货退款
   ├─ 换货
   └─ 售后进度查询

🔑 关键测试点：
- 订单状态流转的正确性
- 支付回调的可靠性
- 库存扣减的准确性
- 售后流程的完整性`,
        
        regexp: `正则表达式生成结果：

【匹配中国大陆手机号】

正则表达式：
^1[3-9]\\d{9}$

解释：
- ^1：必须以1开头
- [3-9]：第二位是3-9之间的数字
- \\d{9}：后面跟9位数字（0-9）
- $：结束

匹配示例：
✅ 13812345678
✅ 15987654321
✅ 19912345678

不匹配示例：
❌ 12012345678（第二位是2）
❌ 1381234567（只有10位）
❌ 138123456789（12位）`,
        
        sql: `SQL查询生成结果：

【假设表结构】

```sql
CREATE TABLE orders (
    order_id VARCHAR(32) PRIMARY KEY,
    customer_id INT NOT NULL,
    customer_name VARCHAR(100),
    order_date DATETIME,
    total_amount DECIMAL(10,2),
    status VARCHAR(20)
);
```

【查询SQL】

```sql
SELECT 
    order_id AS 订单号,
    customer_name AS 客户名,
    total_amount AS 销售额,
    order_date AS 订单日期
FROM orders
WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31'
    AND total_amount > 10000
ORDER BY total_amount DESC;
```

【说明】
- 使用BETWEEN...AND筛选1月份数据
- WHERE条件过滤销售额>10000的订单
- ORDER BY按销售额降序排列
- 使用别名提高可读性`,
        
        api: `API文档生成结果：

【用户登录接口】

## 接口说明
用户登录系统，获取认证Token

## 请求信息
- **请求方法**: POST
- **请求路径**: /api/login
- **Content-Type**: application/json

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| username | String | 是 | 用户名，6-20位字母数字 | "testuser" |
| password | String | 是 | 密码，8-20位 | "Test1234" |

## 请求示例
```json
{
    "username": "testuser",
    "password": "Test1234"
}
```

## 响应示例

### 成功响应 (200)
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "userId": 10001,
        "username": "testuser",
        "expireTime": 7200
    }
}
```

### 失败响应 (401)
```json
{
    "code": 401,
    "message": "用户名或密码错误",
    "data": null
}
```

## 错误码
| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 401 | 用户名或密码错误 |
| 403 | 账号被锁定 |
| 500 | 服务器错误 |`,
        
        email: `测试报告生成结果：

══════════════════════════════════════════
           测试报告
══════════════════════════════════════════

【一、测试概述】

本次测试针对用户登录、订单管理、支付三个核心模块进行了全面测试，验证各功能的正确性、稳定性和用户体验。

【二、测试范围】

| 模块 | 测试类型 | 用例数 |
|------|----------|--------|
| 用户登录 | 功能测试、异常测试 | 25 |
| 订单管理 | 功能测试、界面测试 | 40 |
| 支付 | 功能测试、异常测试 | 30 |
| 合计 | - | 95 |

【三、测试结果统计】

- 总用例数：95
- 执行数：95
- 通过数：90
- 失败数：5
- 通过率：94.7%

【四、缺陷分析】

| 严重程度 | 数量 | 状态 |
|----------|------|------|
| 严重 | 3 | 已修复 |
| 一般 | 2 | 已修复 |
| 提示 | 0 | - |

【五、测试结论】

✅ 所有严重缺陷已修复并通过验证
✅ 核心功能测试通过率达到预期
✅ 系统具备上线条件

【六、风险评估】

- 低风险：UI细节优化建议
- 低风险：部分边界条件可进一步增强

【七、后续建议】

1. 建议增加自动化回归测试覆盖
2. 建议进行压力测试验证性能
3. 建议补充兼容性测试

══════════════════════════════════════════`
    };
    
    return mockResponses[toolKey] || '生成内容，请稍后...';
}

function copyContent() {
    const content = localStorage.getItem('lastGeneratedContent');
    if (content) {
        navigator.clipboard.writeText(content).then(() => {
            alert('复制成功！');
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
