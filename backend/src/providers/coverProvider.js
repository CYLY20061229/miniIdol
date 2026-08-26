import { MockCoverProvider } from "./mockCoverProvider.js";
import { QwenCoverProvider } from "./qwenCoverProvider.js";

export function createCoverProvider() {
  if ((process.env.COVER_PROVIDER || "mock").toLowerCase() === "qwen") {
    return new QwenCoverProvider();
  }
  return new MockCoverProvider();
}
