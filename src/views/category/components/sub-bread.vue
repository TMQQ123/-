<template>
  <XtxBread>
    <XtxBreadItem to="/">首页</XtxBreadItem>
    <XtxBreadItem :key="category.top.id" v-if="category.top" :to="`/category/${category.top.id}`">{{ category.top.name }}</XtxBreadItem>
    <Transition name="fade-right" mode="out-in">
      <XtxBreadItem :key="category.sub.id" v-if="category.sub">{{
        category.sub.name
      }}</XtxBreadItem>
    </Transition>
  </XtxBread>
</template>

<script>
import { computed } from "@vue/runtime-core";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
export default {
  name: "SubBread",
  setup() {
    // 通过计算属性从 vuex 中获取 顶级和二级类目数据
    // 得到对象 {top:{id,name},sub:{id:name}}
    const route = useRoute();
    const store = useStore();
    const category = computed(() => {
      const cate = {};
      // 获取数据
      store.state.category.list.forEach((top) => {
        if (top.children) {
          const sub = top.children.find((sub) => sub.id === route.params.id);
          if (sub) {
            cate.top = { id: top.id, name: top.name };
            cate.sub = { id: sub.id, name: sub.name };
          }
        }
      });
      return cate;
    });
    return { category };
  },
};
</script>

<style lang="less" scoped>
</style>