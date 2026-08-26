import { MockCoverProvider } from "./mockCoverProvider.js";

export class QwenCoverProvider {
  constructor() {
    this.mock = new MockCoverProvider();
    this.apiKey = process.env.QWEN_IMAGE_API_KEY || "";
    this.baseUrl = process.env.QWEN_IMAGE_BASE_URL || "https://dashscope.aliyuncs.com";
  }

  async generateCover({ originalInputSummary }) {
    if (!this.apiKey) {
      return this.mock.generateCover({ originalInputSummary });
    }

    // TODO: 根据千问图片生成 API 文档实现 1080x1080 方形封面生成。
    // 约束：
    // - 不出现真实艺人肖像
    // - 不出现真实团体 logo
    // - 不出现版权角色
    // - 输出文件应保存到 backend/public/generated，并返回 public URL
    return this.mock.generateCover({ originalInputSummary });
  }
}
