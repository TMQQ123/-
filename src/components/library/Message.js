// 提供一个能够显示 xtx-message 组件的函数
// 这个函数将来可以导入直接使用 也可以挂载爱vue实例原型上
// import Message from 'Message.js' 使用 Message({text:'error',text:'提示文字'})
// this.$message({text:'error',text:'提示文字'})

import { createVNode, render } from "vue";
import XtxMessage from "./xtx-message.vue";

// 创建一个消息提示的DOM容器
const div = document.createElement("div");
div.setAttribute("class", "xtx-message-container");
document.body.appendChild(div);

// 定时器标识
let timer = null;

export default ({ type, text }) => {
  // 渲染组件步骤
  // 1. 导入消息提示组件
  // 2. 将导入的组件编译为虚拟节点(dom节点)
  // createVNode(组件,属性对象(props))
  const vnode = createVNode(XtxMessage, { type, text });
  // 3. 准备一个装载消息提示组件的DOM容器
  // 4. 将虚拟节点渲染在容器中

  // 渲染虚拟节点 render(虚拟节点,DOM容器)
  render(vnode, div);
  // 5. 3s后销毁组件
  clearTimeout(timer);
  timer = setTimeout(() => {
    render(null, div);
  }, 3000);
};
