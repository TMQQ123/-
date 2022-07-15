<template>
  <div class="goods-tabs">
    <nav>
      <a
        @click="activeName = 'GoodsDetail'"
        :class="{ active: activeName === 'GoodsDetail' }"
        href="javascript:;"
        >商品详情</a
      >
      <a
        @click="activeName = 'GoodsComment'"
        :class="{ active: activeName === 'GoodsComment' }"
        href="javascript:;"
        >商品评价<span>{{ goods.commentCount }}</span></a
      >
    </nav>
    <!-- 切换内容的地方 -->
    <!-- <GoodsDetial v-if="activeName === 'GoodsDetial'"></GoodsDetial> -->
    <!-- <GoodsComment v-if="activeName === 'GoodsComment'"></GoodsComment> -->
    <!-- 在vue中动态的切换组件可以使用动态组件 component 组件 -->
    <!-- is 属性用来决定component动态组件渲染为哪个组件 组件的名称 -->
    <component :is="activeName"></component>
  </div>
</template>

<script>
import GoodsDetail from "@/views/goods/components/goods-detail.vue";
import GoodsComment from "@/views/goods/components/goods-comment.vue";

import { ref, inject } from "vue";
export default {
  name: "GoodsTabs",
  components: { GoodsDetail, GoodsComment },
  setup() {
    // 值是 GoodsDetial 激活商品详情 值是 GoodsComment 激活商品评价
    const activeName = ref("GoodsDetail");
    // goods详情数据
    const goods = inject("goods");
    return { activeName, goods };
  },
};
</script>

<style lang="less" scoped>
.goods-tabs {
  min-height: 600px;
  background: #fff;
  nav {
    height: 70px;
    line-height: 70px;
    display: flex;
    border-bottom: 1px solid #f5f5f5;
    a {
      padding: 0 40px;
      font-size: 18px;
      position: relative;
      > span {
        color: @priceColor;
        font-size: 16px;
        margin-left: 10px;
      }
      &:first-child {
        border-right: 1px solid #f5f5f5;
      }
      &.active {
        &::before {
          content: "";
          position: absolute;
          left: 40px;
          bottom: -1px;
          width: 72px;
          height: 2px;
          background: @xtxColor;
        }
      }
    }
  }
}
</style>