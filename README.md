# 基于官方架构的链接转附件插件

## 项目简介

这是一个基于飞书科技官方多维表格插件架构开发的升级版本，专门解决防盗链图片链接转换问题。

## 核心特性

- ✅ **官方架构兼容**: 完全基于飞书官方插件架构开发
- ✅ **PersonalBaseToken授权**: 使用官方授权机制
- ✅ **防盗链绕过**: 智能请求头模拟，支持字节跳动CDN等
- ✅ **服务端插件**: 自动化操作插件类型
- ✅ **多语言支持**: 中英文国际化

## 技术架构

### 官方插件架构
- **类型**: 多维表格自动化操作插件
- **SDK**: `@lark-opdev/block-basekit-server-api`
- **权限**: `permission.type: 2` (文档权限)
- **授权**: `useTenantAccessToken: true`

### 核心功能
1. **图片下载**: 使用`context.fetch`绕过防盗链
2. **附件上传**: 使用`uploadAttachments`上传到飞书云空间
3. **字段回写**: 将附件写入指定的附件字段

## 开发说明

### 文件结构
```
official-bitable-link-converter/
├── src/
│   └── index.ts          # 主插件代码
├── test/
│   └── index.ts          # 测试代码
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── app.json              # 应用ID配置
└── block.json            # 区块ID配置
```

### 关键代码解析

#### 1. 防盗链绕过逻辑
```typescript
async function downloadImageWithAntiHotlink(url: string, context: any): Promise<Buffer> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    // ... 其他头部
  };

  // 针对特定域名的特殊处理
  if (url.includes('500fd.com') || url.includes('volcengine.com')) {
    headers['Referer'] = 'https://www.douyin.com/';
    headers['Origin'] = 'https://www.douyin.com';
  }
  // ... 其他域名处理
}
```

#### 2. 官方插件注册
```typescript
basekit.addAction({
  // 表单配置
  formItems: [
    {
      itemId: 'imageUrl',
      label: basekit.t('source_url'),
      component: Component.Input,
      // ...
    }
  ],
  
  // 权限声明
  permission: { type: 2 },
  useTenantAccessToken: true,
  
  // 执行逻辑
  execute: async function(args, context) {
    // 图片下载和附件上传逻辑
  }
});
```

## 配置指南

### 1. 应用配置
在 `app.json` 中填入您的应用ID：
```json
{
  "appId": "cli_your_app_id"
}
```

### 2. 区块配置
在 `block.json` 中填入您的区块ID：
```json
{
  "blockTypeID": "blk_your_block_type_id",
  "url": "https://base-api.feishu.cn"
}
```

### 3. 权限申请
在飞书开放平台后台申请以下权限：
- `bitable:app` (查看、评论、编辑和管理多维表格)
- `drive:media:download` (下载素材)
- `drive:media:upload` (上传素材)

## 部署步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 构建项目
```bash
npm run build
```

### 3. 上传代码
```bash
npm run upload
```

### 4. 测试
```bash
npm run test
```

## 使用说明

### 在多维表格中使用
1. 打开多维表格
2. 点击右上角机器人图标
3. 创建自动化流程
4. 选择本插件
5. 配置参数并启用

### 参数说明
- **图片链接**: 输入要转换的图片URL
- **目标附件字段**: 选择要写入的附件字段

## 支持的图片域名

### 已测试支持
- ✅ `s.500fd.com` (字节跳动CDN)
- ✅ `p3-tt.byteimg.com` (字节跳动图片服务)
- ✅ `tos-cn-i-*` (腾讯云对象存储)

### 防盗链绕过策略
- **Referer伪装**: 模拟来源网站
- **User-Agent伪装**: 模拟浏览器环境
- **特殊Header**: 针对特定CDN的额外头部

## 错误处理

### 常见错误
| 错误 | 原因 | 解决方案 |
|-----|------|----------|
| 403 Forbidden | 防盗链限制 | 检查域名特定处理逻辑 |
| 下载超时 | 网络问题 | 增加超时时间设置 |
| 文件为空 | 链接失效 | 验证图片链接有效性 |

### 调试方法
1. 查看插件运行日志
2. 使用测试功能验证URL
3. 检查授权和权限配置

## 与官方插件对比

| 功能 | 官方插件 | 本插件 |
|-----|---------|--------|
| 基础转换 | ✅ | ✅ |
| PersonalBaseToken授权 | ✅ | ✅ |
| 官方架构兼容 | ✅ | ✅ |
| 防盗链支持 | ❌ | ✅ |
| 字节跳动CDN | ❌ | ✅ |
| 多语言支持 | ❌ | ✅ |

## 更新日志

### v1.0.0 (2025-12-30)
- ✨ 基于官方架构开发
- ✨ 支持防盗链图片转换
- ✨ 多语言国际化
- ✨ 完整的错误处理

## 技术支持

如有问题，请检查：
1. 应用权限是否正确配置
2. 区块ID和应用ID是否正确
3. 图片链接是否有效
4. 网络连接是否正常

---

**注意**: 本插件完全基于飞书官方插件架构开发，使用官方授权机制，确保与飞书生态的完全兼容。