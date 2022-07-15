// 购物车模块

import {
  findCartList,
  getNewCartGoods,
  mergeCart,
  insertCart,
  deleteCart,
  updateCart,
  checkAllCart,
} from "@/api/cart";

export default {
  namespaced: true,
  state() {
    return {
      // 购物车商品列表数据
      list: [],
    };
  },
  getters: {
    // 拿三项数据:
    // 有效商品: 库存 stock 大于0 商品有效标识 isEffective 为 true
    // 有效商品列表
    validList(state) {
      return state.list.filter((goods) => goods.stock > 0 && goods.isEffective);
    },
    // 有效商品总件数
    validTotal(state, getters) {
      return getters.validList.reduce((p, c) => p + c.count, 0);
    },
    // 有效商品总金额
    validAmount(state, getters) {
      return (
        getters.validList.reduce(
          (p, c) => p + Math.round(c.nowPrice * 100) * c.count,
          0
        ) / 100
      );
    },
    // 无效商品列表
    invalidList(state) {
      return state.list.filter(
        (goods) => goods.stock <= 0 || !goods.isEffective
      );
    },
    // 已选商品列表
    selectedList(state, getters) {
      return getters.validList.filter((item) => item.selected);
    },
    // 已选商品总件数
    selectedTotal(state, getters) {
      return getters.selectedList.reduce((p, c) => p + c.count, 0);
    },
    // 已选商品总金额
    selectedAmount(state, getters) {
      return (
        getters.selectedList.reduce(
          (p, c) => p + Math.round(c.nowPrice * 100) * c.count,
          0
        ) / 100
      );
    },
    // 是否全选
    isCheckAll(state, getters) {
      return (
        getters.selectedList.length !== 0 &&
        getters.selectedList.length === getters.validList.length
      );
    },
  },

  mutations: {
    // 加入购物车
    insertCart(state, payload) {
      // 约定加入购物车字段必须和后端保持一致 其实就是 payload对象 的字段
      // 字段有: id、skuId、name、attrsText、picture、price、selected、stock、count、isEffective
      // 插入数据规则:
      // 1. 先找是否有相同的商品
      // 2. 如果有相同的商品 先查询数量 累加到payload上 再保存最新位置(上面) 原来商品需要删除
      // 3. 如果没有相同的商品 直接插入保存在最新的位置(上面)

      // 索引
      const sameIndex = state.list.findIndex(
        (goods) => goods.skuId === payload.skuId
      );
      // 判断是否有相同的商品
      if (sameIndex > -1) {
        // 原有商品数量
        const count = state.list[sameIndex].count;
        payload.count += count;
        // 删除原有商品
        state.list.splice(sameIndex, 1);
      }
      // 追加新的
      state.list.unshift(payload);
    },

    // ---------------------------------------------

    // 修改购物车商品
    updateCart(state, goods) {
      // payload 就是 goods 商品信息: nowPrice stock isEffective
      // 商品信息对象中的字段不固定 对象中有哪些字段就改哪些 字段值合理才改
      // 商品信息对象中必须有 skuId

      const updateGoods = state.list.find((item) => item.skuId == goods.skuId);
      for (const key in goods) {
        if (
          goods[key] !== undefined &&
          goods[key] !== null &&
          goods[key] !== ""
        ) {
          updateGoods[key] = goods[key];
        }
      }
    },

    // ---------------------------------------------

    // 删除购物车
    deleteCart(state, skuId) {
      const index = state.list.findIndex((item) => item.skuId === skuId);
      state.list.splice(index, 1);
    },

    // ---------------------------------------------

    // 设置购物车
    setCart(state, payload) {
      // payload 为空数组就是清空 有值就是设置
      state.list = payload;
    },
  },

  actions: {
    // 已登录-合并购物车
    async mergeCart(ctx) {
      // 合并的参数
      const cartList = ctx.state.list.map((goods) => {
        return {
          skuId: goods.skuId,
          selected: goods.selected,
          count: goods.count,
        };
      });
      await mergeCart(cartList);
      // 此时合并成功 要做清空本地购物车
      ctx.commit("setCart", []);
    },

    // ---------------------------------------------

    // 修改规格
    updateCartSku(ctx, { oldSkuId, newSku }) {
      return new Promise((resolve, reject) => {
        // payload 必须有 skuId 可能有selected count
        if (ctx.rootState.user.profile.token) {
          // 已登录
          // 1. 找出旧的商品信息
          // 2. 删除旧的商品数据
          // 3. 原先商品的数量+新skuId
          // 4. 添加新的商品
          const oldGoods = ctx.state.list.find(
            (item) => item.skuId === oldSkuId
          );
          deleteCart([oldGoods.skuId])
            .then(() => {
              return insertCart({ skuId: newSku.skuId, count: oldGoods.count });
            })
            .then(() => {
              return findCartList();
            })
            .then((data) => {
              ctx.commit("setCart", data.result);
              resolve();
            });
        } else {
          // 未登录
          // 1. 找出旧的商品信息
          // 2. 删除旧的商品数据
          // 3. 根据新的sku信息和旧的商品信息 合并成一条新的购物车商品数据
          // 4. 添加新的商品
          const oldGoods = ctx.state.list.find(
            (item) => item.skuId === oldSkuId
          );
          ctx.commit("deleteCart", oldSkuId);
          const {
            skuId,
            price: nowPrice,
            specsText: attrsText,
            inventory: stock,
          } = newSku;
          const newGoods = { ...oldGoods, skuId, nowPrice, attrsText, stock };
          ctx.commit("insertCart", newGoods);
          resolve();
        }
      });
    },

    // ---------------------------------------------

    // 批量删除
    batchDeleteCart(ctx, isclear) {
      return new Promise((resolve, reject) => {
        // payload 必须有 skuId 可能有selected count
        if (ctx.rootState.user.profile.token) {
          // 已登录
          const ids = ctx.getters[isclear ? "invalidList" : "selectedList"].map(
            (item) => item.skuId
          );
          deleteCart(ids)
            .then(() => {
              return findCartList();
            })
            .then((data) => {
              ctx.commit("setCart", data.result);
              resolve();
            });
        } else {
          // 未登录
          // 找出选中的商品列表 遍历调用删除的 mutations 中的方法
          // isclear 为true 删除失效商品列表 为false 删除选中的商品列表
          ctx.getters[isclear ? "invalidList" : "selectedList"].forEach(
            (item) => {
              ctx.commit("deleteCart", item.skuId);
            }
          );
          resolve();
        }
      });
    },

    // ---------------------------------------------

    // 全选与取消全选
    checkAllCart(ctx, selected) {
      return new Promise((resolve, reject) => {
        // payload 必须有 skuId 可能有selected count
        if (ctx.rootState.user.profile.token) {
          // 已登录
          const ids = ctx.getters.validList.map((item) => item.skuId);
          checkAllCart({ selected, ids })
            .then(() => {
              return findCartList();
            })
            .then((data) => {
              ctx.commit("setCart", data.result);
              resolve();
            });
        } else {
          // 未登录
          ctx.getters.validList.forEach((goods) => {
            ctx.commit("updateCart", { skuId: goods.skuId, selected });
          });
          resolve();
        }
      });
    },

    // ---------------------------------------------

    // 修改购物车 (选中状态,数量)
    updateCart(ctx, payload) {
      return new Promise((resolve, reject) => {
        // payload 必须有 skuId 可能有selected count
        if (ctx.rootState.user.profile.token) {
          // 已登录
          updateCart(payload)
            .then(() => {
              return findCartList();
            })
            .then((data) => {
              ctx.commit("setCart", data.result);
              resolve();
            });
        } else {
          // 未登录
          ctx.commit("updateCart", payload);
          resolve();
        }
      });
    },

    // ---------------------------------------------

    // 加入购物车
    insertCart(ctx, payload) {
      return new Promise((resolve, reject) => {
        if (ctx.rootState.user.profile.token) {
          // 已登录
          insertCart({ skuId: payload.skuId, count: payload.count })
            .then(() => {
              return findCartList();
            })
            .then((data) => {
              ctx.commit("setCart", data.result);
              resolve();
            });
        } else {
          // 未登录
          ctx.commit("insertCart", payload);
          resolve();
        }
      });
    },

    // ---------------------------------------------

    // 获取商品列表
    findCart(ctx) {
      return new Promise((resolve, reject) => {
        if (ctx.rootState.user.profile.token) {
          // 已登录
          findCartList().then((data) => {
            ctx.commit("setCart", data.result);
            resolve();
          });
        } else {
          // 未登录
          // 同时发送请求 (购物车有几个商品发几个请求) 等所有请求成功 一并修改本地购物车数据
          // Promise.all(promise数组).then((dataList)=>{}) dataList为所有请求成功结果
          const promiseArr = ctx.state.list.map((goods) => {
            return getNewCartGoods(goods.skuId);
          });
          // dataList 成功结果的集合 数据顺序和promiseArr书序一致 它又是根据state.list而来
          // 所以 索引一样
          Promise.all(promiseArr).then((dataList) => {
            // console.log(dataList);
            // 更新本地购物车
            dataList.forEach((data, i) => {
              ctx.commit("updateCart", {
                skuId: ctx.state.list[i].skuId,
                ...data.result,
              });
            });
            // 调用resolve() 代表操作成功
            resolve();
          });
        }
      });
    },

    // ---------------------------------------------

    // 删除购物车
    deleteCart(ctx, payload) {
      return new Promise((resolve, reject) => {
        if (ctx.rootState.user.profile.token) {
          // 已登录
          deleteCart([payload])
            .then(() => {
              return findCartList();
            })
            .then((data) => {
              ctx.commit("setCart", data.result);
              resolve();
            });
        } else {
          // 未登录
          // 单条删除 payload 现在就是 skuId
          ctx.commit("deleteCart", payload);
          resolve();
        }
      });
    },
  },
};
