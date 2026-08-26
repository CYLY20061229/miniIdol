import { config } from "../config.js";
import { MockMusicProvider } from "./mockMusicProvider.js";
import { MurekaProvider } from "./murekaProvider.js";

export function createMusicProvider() {
  if (config.musicProvider.toLowerCase() === "mureka") {
    return new MurekaProvider();
  }
  return new MockMusicProvider();
}
