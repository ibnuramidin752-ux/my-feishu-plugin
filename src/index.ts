import { basekit, Component, ParamType, StructureType, uploadAttachments } from '@lark-opdev/block-basekit-server-api';

// 设置国际化
basekit.setI18n({
  defaultLocale: 'zh-CN',
  messages: {
    'zh-CN': {
      "source_url": "图片链接",
      "target_field": "目标附件字段",
      "convert": "转换",
      "success": "转换成功",
      "error": "转换失败",
      "processing": "转换中..."
    },
    'en-US': {
      "source_url": "Image URL",
      "target_field": "Target Attachment Field",
      "convert": "Convert",
      "success": "Conversion successful",
      "error": "Conversion failed",
      "processing": "Processing..."
    }
  },
});

// 图片下载函数 - 支持防盗链
async function downloadImageWithAntiHotlink(url: string, context: any): Promise<Buffer> {
  try {
    const { fetch } = context;
    
    // 设置防盗链绕过请求头
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };

    // 针对特定域名的特殊处理
    if (url.includes('500fd.com') || url.includes('volcengine.com')) {
      // 字节跳动CDN特殊处理
      headers['Referer'] = 'https://www.douyin.com/';
      headers['Origin'] = 'https://www.douyin.com';
    } else if (url.includes('douyin.com')) {
      headers['Referer'] = 'https://www.douyin.com/';
    } else if (url.includes('toutiao.com')) {
      headers['Referer'] = 'https://www.toutiao.com/';
    }

    // 下载图片
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`下载失败，状态码: ${response.status}`);
    }

    // 获取图片数据
    const buffer = await response.buffer();
    
    if (buffer.length === 0) {
      throw new Error('下载的图片数据为空');
    }

    return buffer;
  } catch (error: any) {
    console.error('图片下载失败:', error);
    throw new Error(`图片下载失败: ${error.message}`);
  }
}

// 获取文件扩展名
function getFileExtension(url: string, contentType?: string): string {
  // 从URL中提取扩展名
  const urlMatch = url.match(/\.([^.?#]+)(?:\?|#|$)/);
  if (urlMatch) {
    const ext = urlMatch[1].toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
      return ext;
    }
  }
  
  // 从Content-Type推断
  if (contentType) {
    if (contentType.includes('jpeg')) return 'jpg';
    if (contentType.includes('png')) return 'png';
    if (contentType.includes('gif')) return 'gif';
    if (contentType.includes('webp')) return 'webp';
  }
  
  return 'jpg'; // 默认扩展名
}

// 主插件逻辑
basekit.addAction({
  // 插件描述
  description: '支持防盗链的图片链接转附件插件',
  
  // 表单配置
  formItems: [
    {
      itemId: 'imageUrl',
      label: '图片链接',
      required: true,
      component: Component.Input,
      componentProps: {
        placeholder: '请输入图片链接，如：https://s.500fd.com/xxx.jpg'
      }
    },
    {
      itemId: 'targetField',
      label: '目标附件字段',
      required: true,
      component: Component.Attachment,
      componentProps: {
        placeholder: '请选择目标附件字段'
      }
    }
  ],

  // 声明需要文档权限
  permission: {
    type: 2
  },

  // 使用租户访问令牌
  useTenantAccessToken: true,

  // 执行函数
  execute: async function(args, context) {
    try {
      const { imageUrl, targetField } = args;
      
      if (!imageUrl || !targetField) {
        throw new Error('请提供完整的参数');
      }

      console.log(`开始转换图片: ${imageUrl}`);

      // 下载图片（支持防盗链）
      const imageBuffer = await downloadImageWithAntiHotlink(imageUrl, context);
      
      // 生成文件名
      const timestamp = new Date().getTime();
      const extension = getFileExtension(imageUrl);
      const filename = `image_${timestamp}.${extension}`;

      console.log(`图片下载成功，大小: ${imageBuffer.length} 字节`);

      // 上传到附件字段
      const attachments = await uploadAttachments([
        {
          name: filename,
          file: imageBuffer
        }
      ], {
        context,
        env: 'feishu'
      });

      console.log('附件上传成功');

      return {
        success: true,
        message: '转换成功',
        attachments: attachments,
        fileName: filename,
        fileSize: imageBuffer.length
      };

    } catch (error: any) {
      console.error('转换失败:', error);
      return {
        success: false,
        message: '转换失败',
        error: error.message
      };
    }
  },

  // 返回结果类型
  resultType: {
    type: ParamType.Object,
    properties: {
      success: {
        type: ParamType.Boolean,
        label: '是否成功'
      },
      message: {
        type: ParamType.String,
        label: '消息'
      },
      fileName: {
        type: ParamType.String,
        label: '文件名'
      },
      fileSize: {
        type: ParamType.Number,
        label: '文件大小(字节)'
      },
      attachments: {
        type: ParamType.Array,
        structureType: StructureType.Attachment,
        label: '附件'
      },
      error: {
        type: ParamType.String,
        label: '错误信息'
      }
    }
  }
});

export default basekit;