import { defineConfig } from "wxt";

export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "CredCheck",
    description: "Real-time credibility scoring for AI chat replies",
    version: "0.1.0",
    permissions: ["storage", "scripting"],
    host_permissions: ["https://chat.openai.com/*", "http://localhost:8000/*"],
  },
});
