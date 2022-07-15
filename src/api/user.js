// 用户相关的接口 登录

import request from "@/utils/request";

/**
 * 账号密码登录
 * @param {String} account - 账号
 * @param {String} password - 密码
 * @returns Promise
 */
export const userAccountLogin = ({ account, password }) => {
  return request("/login", "post", { account, password });
};

/**
 * 获取手机短信验证码
 * @param {String} mobile - 手机号
 * @returns Promise
 */
export const userMobileLoginMsg = (mobile) => {
  return request("/login/code", "get", { mobile });
};

/**
 * 获取手机号登录
 * @param {String} mobile - 手机号
 * @param {String} code - 短信验证码, 默认 123456
 * @returns Promise
 */
export const userMobileLogin = ({ mobile, code }) => {
  return request("/login/code", "post", { mobile, code });
};

/**
 * QQ登录
 * @param {String} unionId - QQ唯一标识,openId
 * @param {String} source - 客户端类型 1-PC
 * @returns
 */
export const userQQLogin = (unionId, source = 1) => {
  return request("/login/social", "post", { unionId, source });
};

/**
 * 获取QQ绑定的时候获取短信验证码
 * @param {String} mobile - 手机号
 * @returns
 */
export const userQQBindCode = (mobile) => {
  return request("/login/social/code", "get", { mobile });
};

/**
 * QQ登录-账号绑定
 * @param {String} unionId - QQ唯一标识,openId
 * @param {String} mobile - 手机号
 * @param {String} code - 验证码
 * @returns
 */
export const userQQBindLogin = ({ unionId, mobile, code }) => {
  return request("/login/social/bind", "post", { unionId, mobile, code });
};

/**
 * 校验用户名是否存在
 * @param {String} account - 用户名
 * @returns Promise
 */
export const userAccountCheck = (account) => {
  return request("/register/check", "get", { account });
};

/**
 * 完善信息手机短信验证码
 * @param {String} mobile - 手机号
 * @returns Promise
 */
export const userQQPatchCode = (mobile) => {
  return request("/register/code", "get", { mobile });
};

/**
 * 完善信息-立即提交
 * @param {String} unionId - QQ唯一标识,openId
 * @param {String} mobile - 手机号
 * @param {String} code - 验证码
 * @param {String} account - 用户名
 * @param {String} password - 密码
 * @returns
 */
export const userQQPatchLogin = ({
  unionId,
  mobile,
  code,
  account,
  password,
}) => {
  return request(`/login/social/${unionId}/complement`, "post", {
    unionId,
    mobile,
    code,
    account,
    password,
  });
};
