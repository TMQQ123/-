// 封装购物车相关的API

import request from "@/utils/request";

/**
 * 获取商品的 最新价格 库存 是否有效
 * @param {String} skuId - SKU id
 */
export const getNewCartGoods = (skuId) => {
  return request(`/goods/stock/${skuId}`, "get");
};

/**
 * 获取商品对应的sku数据
 * @param {String} skuId - SKU id
 */
export const getGoodsSku = (skuId) => {
  return request(`/goods/sku/${skuId}`, "get");
};

/**
 * 已登录-合并购物车
 * @param {Array<object>} carList - 购物车信息列表
 * @param {String} object.skuId - skuId
 * @param {Boolean} object.selected - 是否选中
 * @param {Integer} object.count - 商品数量
 */
export const mergeCart = (carList) => {
  return request("/member/cart/merge", "post", carList);
};

/**
 * 已登录-获取购物车列表
 * @returns
 */
export const findCartList = () => {
  return request("/member/cart", "get");
};

/**
 * 已登录-加入购物车
 * @param {String} skuId  - skuId
 * @param {Integet} count  - 加入购物车数量
 */
export const insertCart = ({ skuId, count }) => {
  return request("/member/cart", "post", { skuId, count });
};

/**
 * 已登录-删除购物车 支持批量
 * @param {Array<String>} ids  - skuId 的集合
 */
export const deleteCart = (ids) => {
  return request("/member/cart", "delete", { ids });
};

/**
 * 已登录-修改购物车(是否选中,数量)
 * @param {String} skuId  - skuId
 * @param {Integer} selected  - 选中状态
 * @param {Boolean} count  - 商品的数量
 */
export const updateCart = ({ skuId, selected, count }) => {
  return request(`/member/cart/${skuId}`, "put", { selected, count });
};

/**
 * 已登录-全部选中&取消全选
 * @param {Boolean} selected  - 选中状态
 * @param {Array<String>} ids  - skuId 的集合
 */
export const checkAllCart = ({ selected, ids }) => {
  return request("/member/cart/selected", "put", { selected, ids });
};
