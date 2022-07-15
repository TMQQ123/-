// 扩展原有 vue 功能：全局组件 自定义指令 挂载原型方法
// 插件
// Vue3.0 插件写法：导出一个对象，有install函数，默认传入了App，Vue基础之上扩展

import Message from "./Message";

import defaultImg from "@/assets/images/200.png";
// import XtxSkeleton from "./xtx-skeleton.vue";
// import XtxCarousel from "./xtx-carousel.vue";
// import XtxMore from "./xtx-more.vue";
// import XtxBread from "./xtx-bread";
// import XtxBreadItem from "./xtx-bread-item";

// 使用 require 提供的函数 context 加载某一个目录下的所有 .vue 后缀的文件。
// 然后 context 函数会返回一个导入函数 importFn
// 它又一个属性 keys() 获取所有的文件路径
// 通过文件路径数组，通过遍历数组，再使用 importFn 根据路径导入组件对象
// 遍历的同时进行全局注册即可

// context() 三个参数 目录路径 、是否加载子目录、加载的正则匹配
const importFn = require.context("./", false, /\.vue$/);

export default {
  install(app) {
    // 在app上进行扩展插件 app提供 component、directive 函数
    // 如果要挂载原型 要使用 app.config.globalProperties 方式
    // app.component(XtxSkeleton.name, XtxSkeleton);
    // app.component(XtxCarousel.name, XtxCarousel);
    // app.component(XtxMore.name, XtxMore);
    // app.component(XtxBread.name, XtxBread);
    // app.component(XtxBreadItem.name, XtxBreadItem);

    // 根据keys批量注册
    importFn.keys().forEach((path) => {
      // 导入组件
      const component = importFn(path).default;
      // 注册组件
      app.component(component.name, component);
    });

    // 基于vue3.0和IntersectionObserver封装懒加载指令
    defineDirective(app);

    // 定义一个原型函数
    app.config.globalProperties.$message = Message;
  },
};

const defineDirective = (app) => {
  // 1. 图片懒加载 v-lazy
  // 原理: 先存储图片但不能那个放在src上 当图片进入可视区 将src地址换成存储的图片地址
  app.directive("lazy", {
    // 指令是否创建好 用 mounted
    mounted(el, binding) {
      // 2. 创建一个观察对象 来观察当前使用指令的元素
      const observe = new IntersectionObserver(
        ([{ isIntersecting }]) => {
          if (isIntersecting) {
            // 停止观察
            observe.unobserve(el);
            // 把指令的值设置给el的src属性
            el.src = binding.value;
            // 处理图片加载失败
            el.onerror = () => {
              el.src = defaultImg;
            };
          }
        },
        {
          threshold: 0,
        }
      );
      // 开启观察
      observe.observe(el);
    },
  });
};
