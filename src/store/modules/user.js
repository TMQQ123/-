// 用户模块

export default {
  namespaced: true,
  state() {
    return {
      // 用户信息
      profile: {
        id: "",
        avater: "",
        nickname: "",
        account: "",
        mobile: "",
        token: "",
      },
      // 登陆后的回跳路径
      redirectUrl: "/",
    };
  },
  mutations: {
    // 修改用户信息
    setUser(state, step) {
      state.profile = step;
    },
    // 修改回跳地址
    setRedirectUrl(state, url) {
      state.redirectUrl = url;
    },
  },
};
