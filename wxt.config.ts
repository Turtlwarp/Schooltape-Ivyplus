import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Schooltape - Ivy+",
    web_accessible_resources: [
      {
        matches: ["<all_urls>"],
        resources: ["*"],
      },
    ],
    host_permissions: ["http://*/*", "https://*/*"],
    permissions: ["storage", "contextMenus", "activeTab"],
    browser_specific_settings: {
      gecko: { id: "ivyplus@turtl" },
    },
  },
  srcDir: "src",
  outDir: "dist",
  modules: ["@wxt-dev/module-svelte"],
  imports: false,
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
