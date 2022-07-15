<script>
import { h } from "vue";

export default {
  name: "XtxBread",
  render() {
    // 用法
    // 1. template 标签去除 单文件组件
    // 2. 返回值就是组件内容
    // 3. vue2的h函数是传参进来的 vue3的h函数是导入进来的
    // 4. h 第一个参数是 标签名 第二个参数是 标签属性对象 第三个参数是 子节点
    // 需求
    // 1. 创建 xtx-bread 父容器
    // 2. 获取默认插槽
    // 3. 去除 xtx-bread-item 组件的 i 标签 应该有 rouder 函数来创建
    // 4. 遍历插槽中的 item 得到一个动态创建的节点 最后一个 item 不加 i标签
    // 5. 把动态创建的节点 渲染在 xtx-bread 标签中 就是放在 子节点的位置
    const items = this.$slots.default();
    const dymaicItems = [];
    items.forEach((item, i) => {
      dymaicItems.push(item);
      if (i < items.length - 1) {
        dymaicItems.push(h("i", { class: "iconfont icon-angle-right" }));
      }
    });
    return h("div", { class: "xtx-bread" }, dymaicItems);
  },
};
</script>

<style  lang='less'>
// 去除 scoped 目的是让样式作用到 xtx-bread-item
.xtx-bread {
  display: flex;
  padding: 25px 10px;
  &-item {
    a {
      color: #666;
      transition: all 0.4s;
      &:hover {
        color: @xtxColor;
      }
    }
  }
  i {
    font-size: 12px;
    margin-left: 5px;
    margin-right: 5px;
    line-height: 22px;
  }
}
</style>