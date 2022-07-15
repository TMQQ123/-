import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// 导入自己的ui组件库
import UI from "@/components/library";

// 公共重置样式的库
import "normalize.css";
// 自己定义的重置样式的库
import "@/assets/styles/common.less";

// mockjs
import "@/mock/index";

createApp(App)
  .use(store)
  .use(router)
  .use(UI)
  .mount("#app");
