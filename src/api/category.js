// 定义分类相关的 API 接口数据

import request from "@/utils/request.js";

// 获取所有分类（包括一级 二级）
export const findAllCategory = () => {
  return request("/home/category/head", "get");
};

/**
 * 获取顶级类目信息(children属性就是各个子分类)
 * @param {String} id - 顶级类目ID
 * @returns
 */
export const findTopCategory = (id) => {
  return request("/category", "get", { id });
};

/**
 * 获取二级类目下筛选条件数据
 * @param {String} id - 二级类目ID
 * @returns
 */
export const findSubCategoryFilter = (id) => {
  return request("/category/sub/filter", "get", { id });
};

/**
 * 获取二级分类下的商品（带 筛选条件）
 * @param {Object} params - 可参考接口文档
 */
export const findSubCategoryGoods = (params) => {
  return request("/category/goods/temporary", "post", params);
};
