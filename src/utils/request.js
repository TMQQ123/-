// 1. 创建一个新得 axios 实例
// 2. 请求拦截器，如果有token进行头部拦截
// 3. 响应拦截器 1. 剥离无效数据 2.处理token失效
// 4. 导出一个函数，调用当前的axios实例发请求，返回值 Promise

import axios from "axios";
import store from "@/store";
import router from "@/router";

// 1.apipc-xiaotuxian-front.itheima.net
// 导出基准地址 原因：有些地方不是用axios发送请求 可用基准地址
export const baseURL = "http://pcapi-xiaotuxian-front-devtest.itheima.net/";
const instance = axios.create({
  // axios 的一些配置
  baseURL,
  timeout: 5000,
});

// 2.
instance.interceptors.request.use(
  (config) => {
    // 拦截业务逻辑
    // 进行请求配置的修改
    // 如果本地有token就在头部携带
    // 1. 获取用户信息对象
    const { profile } = store.state.user;
    // 2. 判断是否有token
    if (profile.token) {
      config.headers.Authorization = `Bearer ${profile.token}`;
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

// 3.
instance.interceptors.response.use(
  // 取出data数据 调用接口时拿到的就是后台数据
  (res) => res.data,
  (err) => {
    //   401 状态码进入该函数
    if (err.response && err.response.status === 401) {
      // 1. 清空本地无效用户信息
      // 2. 跳转到登录页面
      // 3. 跳转需要传参(当前路由地址)给登录页
      store.commit("user/setUser", {});
      //   用 $route.fullPath 拿到当前路由完全地址 在js模块中用 route.currentRoute 获取的值是响应式加 .value
      const fullPath = encodeURIComponent(router.currentRoute.value.fullPath);
      router.push("/login?redirectUrl=" + fullPath);
    }
    return Promise.reject(err);
  }
);

// 4.
// 请求工具函数
export default (url, method, submitData) => {
  // 负责发请求：请求地址 请求方式 提交的数据
  return instance({
    url,
    method,
    // 如果是 get 请求 需要使用 params 传参数   a=10?b=20
    // 如果不是 get 请求 需要使用 data 传参     请求体传参
    // .toLowerCase 转化小写
    [method.toLowerCase() === "get" ? "params" : "data"]: submitData,
  });
};

// export default request;
