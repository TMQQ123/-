<template>
  <!-- 顶部通栏 -->
  <AppNavbar></AppNavbar>
  <!-- 头部组件 -->
  <AppHeader></AppHeader>
  <!-- 吸顶头部组件 -->
  <AppHeaderSticky></AppHeaderSticky>
  <!-- 内容容器 -->
  <div class="app-body">
    <!-- 二级路由 -->
    <router-view></router-view>
  </div>
  <!-- 底部组件 -->
  <AppFooter></AppFooter>
</template>

<script>
// 导入组件
import AppNavbar from "@/components/app-navbar.vue";
import AppHeader from "@/components/app-header.vue";
import AppFooter from "@/components/app-footer.vue";
import { useStore } from "vuex";
import AppHeaderSticky from "@/components/app-header-sticky.vue";

export default {
  name: "Layout",
  components: {
    AppNavbar,
    AppHeader,
    AppFooter,
    AppHeaderSticky,
  },

  // 获取分类数据
  setup() {
    const store = useStore();
    store.dispatch("category/getList");
    return {};
  },
};
</script>

<style lang="less" scoped>
.app-body {
  min-height: 600px;
}
</style>