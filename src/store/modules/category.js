// 分类模块

import { topCategory } from "@/api/constants.js";
import { findAllCategory } from "@/api/category.js";

export default {
  namespaced: true,
  state() {
    return {
      // 分类信息数据，依赖topCategory重新设置 保证初始化就有数据 不至于白屏
      list: topCategory.map((item) => ({ name: item })),
    };
  },

  // 修改分类函数
  mutations: {
    setList(state, step) {
      state.list = step;
    },
    // 定义show和hide函数 控制当前二级分类显示和隐藏
    show(state, id) {
      const curryCategory = state.list.find((item) => item.id === id);
      curryCategory.open = true;
    },
    hide(state, id) {
      const curryCategory = state.list.find((item) => item.id === id);
      curryCategory.open = false;
    },
  },

  // 获取分类函数
  actions: {
    async getList({ commit }) {
      // 获取分类数据
      const data = await findAllCategory();
      // 给每个分类加上控制二级分类显示和隐藏的数据
      data.result.forEach((top) => {
        top.open = false;
      });
      // 修改分类数据
      commit("setList", data.result);
    },
  },
};
