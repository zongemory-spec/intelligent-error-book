// 封装通义千问 (DashScope) 的调用逻辑
// 使用 OpenAI 兼容接口模式，方便同时处理文本和图片

const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

interface AIParams {
  prompt: string;
  imageBase64?: string; // 可选的图片数据
  systemPrompt?: string; // 可选的系统提示词
}

export const callTongyiAI = async ({ prompt, imageBase64, systemPrompt }: AIParams): Promise<string> => {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    throw new Error("未配置 DASHSCOPE_API_KEY,请检查 .env 文件。");
  }

  // 构造消息体
  const messages: any[] = [];
  
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  const userContent: any[] = [{ type: "text", text: prompt }];

  // 如果有图片，使用 qwen-vl-max 模型，并按照 OpenAI 格式构造图片内容
  // 注意：通义千问 VL 模型目前在兼容模式下支持 base64
  if (imageBase64) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${imageBase64}`
      }
    });
  }

  messages.push({ role: "user", content: userContent });

  // 只有包含图片时才必须使用 qwen-vl-max，纯文本可以使用更便宜快速的 qwen-turbo 或 qwen-plus
  const model = imageBase64 ? "qwen-vl-max" : "qwen-plus";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7, // 创意程度
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("AI API Error:", errData);
      throw new Error(`请求失败 (${response.status}): ${errData?.error?.message || '未知错误'}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("AI 返回了空内容");
    }

    return content;

  } catch (error: any) {
    console.error("Call Tongyi AI Failed:", error);
    // 处理 CORS 或网络问题
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("网络请求失败，可能是跨域(CORS)限制。请尝试安装 'Allow CORS' 浏览器插件进行本地测试，或检查网络连接。");
    }
    throw error;
  }
};