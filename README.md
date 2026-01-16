# 尚泰铭成ERP管理系统 - 前端项目

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Vue](https://img.shields.io/badge/Vue-3.3.8-green.svg)](https://vuejs.org/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.4.2-blue.svg)](https://element-plus.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)

> 基于芋道开源框架二次开发的企业级ERP管理系统前端项目

## 📖 项目简介

**尚泰铭成ERP管理系统**是一个基于 [芋道 yudao-ui-admin-vue3](https://gitee.com/zhijiantianya/yudao-ui-admin-vue3) 二次开发的企业级ERP管理平台，专注于销售订单管理、采购付款管理和数据统计分析。

### 🎯 核心功能

#### 1. 客户管理
- 客户信息维护
- 联系人管理
- 客户销售历史查询

#### 2. 供应商管理
- 供应商信息维护
- 账期配置（支持按月、按周期自定义）
- 供应商采购统计

#### 3. 订单管理
- **销售开单**：快速创建销售订单
- **订单审核**：多级审核流程（业务员 → Boss）
- **成本填充**：订单完成后填充采购成本
- **成本编辑**：支持管理员二次编辑已填充的成本
- **收款管理**：标注客户收款状态
- **数据导出**：Excel格式导出订单数据

#### 4. 采购付款管理
- **自动生成付款单**：成本填充时按供应商自动生成
- **付款计划**：根据供应商账期自动拆分付款阶段
- **付款记录**：详细的付款历史追踪
- **同步更新**：成本编辑时自动同步更新付款单

#### 5. 统计报表
- **客户销售统计**：按客户统计销售额和利润
- **供应商采购统计**：按供应商统计采购成本
- **员工业绩统计**：销售业绩排行榜

#### 6. 系统管理
- 用户管理
- 角色权限管理
- 部门管理
- 操作日志

---

## 🔨 二次开发说明

### 相比芋道源码的主要改动

#### 1. 精简模块
删除了以下不需要的模块，减少系统复杂度：
- ❌ AI模块（聊天、写作、绘图等）
- ❌ BPM工作流模块
- ❌ CRM客户关系管理模块（使用自定义简化版）
- ❌ 商城模块（商品、订单、营销等）
- ❌ 会员模块
- ❌ 支付模块（微信/支付宝支付）
- ❌ IoT物联网模块
- ❌ 公众号模块
- ❌ 租户管理（SaaS功能）

#### 2. 简化登录流程
- ❌ 移除手机号登录
- ❌ 移除二维码登录
- ❌ 移除注册功能
- ❌ 移除忘记密码功能
- ✅ 保留账号密码登录

#### 3. 核心ERP功能开发

##### 订单管理增强
- 🆕 **订单成本编辑功能**：Boss和管理员可编辑已填充成本的订单
- 🆕 **订单路由优化**：`/order/create`（销售开单）、`/order/edit/:id`（编辑订单）
- 🆕 **成本填充表单**：支持编辑模式和填充模式切换
- 🆕 **文案优化**："付款状态" → "收款状态"（明确订单是收款，采购才是付款）

##### 付款管理自动化
- 🆕 **自动生成付款单**：成本填充时按供应商分组自动创建
- 🆕 **同步更新机制**：成本编辑时物理删除旧付款记录并重新生成
- 🆕 **付款计划拆分**：根据供应商账期配置自动分期
- 🆕 **强一致性校验**：同一供应商的商品付款信息必须一致

##### 统计报表
- 🆕 **客户销售统计**：销售额、利润分析
- 🆕 **供应商采购统计**：采购成本分析
- 🆕 **员工业绩统计**：销售排名、业绩对比

#### 4. Bug修复
- 🐛 **日期选择器错误**：修复后端返回数组格式 `[2026, 1, 15]` 导致的报错
- 🐛 **日期格式兼容**：支持字符串 `"2026-01-15"` 和数组格式
- 🐛 **付款日期默认值**：修复null导致的数据库约束错误

---

## 💻 技术栈

| 框架                                                                   | 说明               | 版本     |
|----------------------------------------------------------------------|------------------|--------|
| [Vue 3](https://staging-cn.vuejs.org/)                              | 渐进式JavaScript框架 | 3.3.8  |
| [Vite](https://cn.vitejs.dev/)                                      | 下一代前端构建工具        | 4.5.0  |
| [Element Plus](https://element-plus.org/zh-CN/)                      | Vue 3 组件库       | 2.4.2  |
| [TypeScript](https://www.typescriptlang.org/docs/)                   | JavaScript超集    | 5.2.2  |
| [Pinia](https://pinia.vuejs.org/)                                    | Vue 3 状态管理      | 2.1.7  |
| [Vue Router](https://router.vuejs.org/)                              | Vue 官方路由        | 4.2.5  |
| [VueUse](https://vueuse.org/)                                        | Vue组合式API工具集    | 10.6.1 |
| [UnoCSS](https://uno.antfu.me/)                                      | 原子化CSS引擎       | 0.57.4 |
| [Axios](https://axios-http.com/)                                     | HTTP请求库         | 1.6.0  |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 16.18.0
- pnpm >= 8.6.0（强制使用pnpm）

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/huangguobing/stmc-ui-admin-vue3.git

# 进入项目目录
cd stmc-ui-admin-vue3

# 安装依赖
pnpm install
```

### 开发环境运行

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost
```

### 生产环境打包

```bash
# 构建生产环境
pnpm build:prod

# 预览构建结果
pnpm preview
```

### Docker部署

```bash
# 构建镜像
docker build -t stmc-ui:latest .

# 运行容器
docker run -d -p 80:80 --name stmc-ui stmc-ui:latest
```

---

## 📁 项目结构

```
stmc-ui-admin-vue3/
├── src/
│   ├── api/                    # API接口
│   │   ├── erp/               # ERP模块API
│   │   │   ├── customer/      # 客户管理
│   │   │   ├── supplier/      # 供应商管理
│   │   │   ├── order/         # 订单管理
│   │   │   ├── payment/       # 付款管理
│   │   │   ├── paymentPlan/   # 付款计划
│   │   │   └── statistics/    # 统计报表
│   │   └── system/            # 系统管理API
│   ├── assets/                # 静态资源
│   ├── components/            # 全局组件
│   ├── layout/                # 布局组件
│   ├── locales/               # 国际化
│   ├── router/                # 路由配置
│   ├── store/                 # Pinia状态管理
│   ├── styles/                # 全局样式
│   ├── utils/                 # 工具函数
│   ├── views/                 # 页面组件
│   │   ├── erp/               # ERP模块页面
│   │   │   ├── customer/      # 客户管理
│   │   │   ├── supplier/      # 供应商管理
│   │   │   ├── order/         # 订单管理
│   │   │   │   ├── index.vue  # 订单列表
│   │   │   │   ├── create.vue # 销售开单/编辑
│   │   │   │   ├── CostForm.vue      # 成本填充/编辑
│   │   │   │   └── OrderDetail.vue   # 订单详情
│   │   │   ├── payment/       # 付款管理
│   │   │   ├── paymentPlan/   # 付款计划
│   │   │   └── statistics/    # 统计报表
│   │   ├── system/            # 系统管理
│   │   ├── Home/              # 首页
│   │   └── Login/             # 登录
│   ├── App.vue                # 根组件
│   └── main.ts                # 入口文件
├── public/                    # 公共资源
├── .env                       # 环境变量（开发）
├── .env.prod                  # 环境变量（生产）
├── Dockerfile                 # Docker配置
├── nginx.conf                 # Nginx配置
├── index.html                 # HTML模板
├── package.json               # 项目配置
├── tsconfig.json              # TypeScript配置
├── vite.config.ts             # Vite配置
└── README.md                  # 项目说明
```

---

## 🔑 角色权限

### 1. 超级管理员（admin）
- ✅ 所有功能权限
- ✅ 系统配置权限

### 2. Boss（老板）
- ✅ 订单查看/审核/编辑
- ✅ 成本填充/编辑
- ✅ 统计报表查看
- ✅ 客户/供应商管理
- ❌ 系统配置（仅查看）

### 3. 业务员（Salesman）
- ✅ 销售开单
- ✅ 客户管理
- ✅ 订单查看/编辑（自己创建的）
- ❌ 订单审核
- ❌ 成本查看/填充
- ❌ 统计报表

---

## 🌐 环境配置

### 开发环境（.env）
```bash
# 标题
VITE_APP_TITLE=尚泰铭成ERP管理系统

# 开发环境（本地）
VITE_BASE_URL=http://localhost:48080

# 测试环境（187服务器）
# VITE_BASE_URL=http://192.168.1.187:48080
```

### 生产环境（.env.prod）
```bash
# 标题
VITE_APP_TITLE=尚泰铭成ERP管理系统

# 生产环境
VITE_BASE_URL=http://47.109.47.47:48080
```

---

## 📝 开发规范

### 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 使用 TypeScript 进行类型检查
- 组件命名使用 PascalCase
- 文件命名使用 camelCase

### Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

---

## 🐛 已知问题

暂无

---

## 📅 更新日志

### v1.2.0 (2026-01-15)
- 🆕 新增订单成本编辑功能
- 🆕 新增订单路由（/order/create、/order/edit/:id）
- 🆕 新增统计报表功能
- 🐛 修复日期选择器数组格式错误
- 🎨 优化文案："付款状态" → "收款状态"
- 🗑️ 删除未使用的AI、BPM、CRM等模块
- 🗑️ 简化登录流程

### v1.1.0 (2026-01-13)
- 🆕 客户销售统计功能
- 🆕 供应商账期配置
- 🆕 付款计划自动拆分

### v1.0.0 (2026-01-11)
- 🎉 基于芋道框架完成初始开发
- ✅ 客户管理模块
- ✅ 供应商管理模块
- ✅ 订单管理模块
- ✅ 付款管理模块

---

## 📞 技术支持

- 💬 问题反馈：[GitHub Issues](https://github.com/huangguobing/stmc-ui-admin-vue3/issues)
- 📧 联系邮箱：support@stmc.com

---

## 📄 开源协议

本项目基于 [Apache License 2.0](https://opensource.org/licenses/Apache-2.0) 开源协议

---

## 🙏 致谢

感谢 [芋道源码](https://gitee.com/zhijiantianya/yudao-ui-admin-vue3) 提供的优秀开源框架！

---

## ⭐ Star History

如果这个项目对你有帮助，请给个 Star ⭐ 支持一下！
