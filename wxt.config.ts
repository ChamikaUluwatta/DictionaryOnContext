import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    permissions: ["storage","contextMenus","scripting"],
    host_permissions:  ["https://generativelanguage.googleapis.com/*", "https://openrouter.ai/*"],
  },
});
