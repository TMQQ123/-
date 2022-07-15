<template>
  <div class="account-box">
    <div class="toggle">
      <a @click="isMsgLogin = false" href="javascript:;" v-if="isMsgLogin">
        <i class="iconfont icon-user"></i> 使用账号登录
      </a>
      <a @click="isMsgLogin = true" href="javascript:;" v-else>
        <i class="iconfont icon-msg"></i> 使用短信登录
      </a>
    </div>
    <Form ref="formCom" class="form" :validation-schema="schema" v-slot="{ errors }" autocomplete="off">
      <template v-if="!isMsgLogin">
        <div class="form-item">
          <div class="input">
            <i class="iconfont icon-user"></i>
            <!-- 用户名 -->
            <Field :class="{ error: errors.account }" v-model="form.account" name="account" type="text" placeholder="请输入用户名" />
          </div>
          <div class="error" v-if="errors.account">
            <i class="iconfont icon-warning" />{{ errors.account }}
          </div>
        </div>
        <div class="form-item">
          <div class="input">
            <i class="iconfont icon-lock"></i>
            <!-- 密码 -->
            <Field :class="{ error: errors.password }" v-model="form.password" name="password" type="password" placeholder="请输入密码" />
          </div>
          <div class="error" v-if="errors.password">
            <i class="iconfont icon-warning" />{{ errors.password }}
          </div>
        </div>
      </template>
      <template v-else>
        <div class="form-item">
          <div class="input">
            <i class="iconfont icon-user"></i>
            <!-- 手机号 -->
            <Field :class="{ error: errors.mobile }" v-model="form.mobile" name="mobile" type="text" placeholder="请输入手机号" />
          </div>
          <div class="error" v-if="errors.mobile">
            <i class="iconfont icon-warning" />{{ errors.mobile }}
          </div>
        </div>
        <div class="form-item">
          <div class="input">
            <i class="iconfont icon-code"></i>
            <!-- 验证码 -->
            <Field :class="{ error: errors.code }" v-model="form.code" name="code" type="text" placeholder="请输入验证码" />
            <span @click="send()" class="code">
              {{ time === 0 ? "发送验证码" : `${time}秒后发送` }}
            </span>
          </div>
          <div class="error" v-if="errors.code">
            <i class="iconfont icon-warning" />{{ errors.code }}
          </div>
        </div>
      </template>
      <div class="form-item">
        <div class="agree">
          <Field as="XtxCheckbox" name="isAgree" v-model="form.isAgree" />
          <span>我已同意</span>
          <a href="javascript:;">《隐私条款》</a>
          <span>和</span>
          <a href="javascript:;">《服务条款》</a>
        </div>
        <div class="error" v-if="errors.isAgree">
          <i class="iconfont icon-warning" />{{ errors.isAgree }}
        </div>
      </div>
      <a @click="login()" href="javascript:;" class="btn">登录</a>
    </Form>
    <!-- QQ登录 -->
    <div class="action">
      <a href="https://graph.qq.com/oauth2.0/authorize?client_id=100556005&response_type=token&scope=all&redirect_uri=http%3A%2F%2Fwww.corho.com%3A8080%2F%23%2Flogin%2Fcallback">
        <img src="https://qzonestyle.gtimg.cn/qzone/vas/opensns/res/img/Connect_logo_7.png" alt="" />
      </a>
      <div class="url">
        <a href="javascript:;">忘记密码</a>
        <a href="javascript:;">免费注册</a>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, reactive, watch, onUnmounted } from "vue";
import { Form, Field } from "vee-validate";
import schema from "@/utils/vee-validate-schema";
import Message from "@/components/library/Message";
// import QC from "qc";

import {
  userAccountLogin,
  userMobileLoginMsg,
  userMobileLogin,
} from "@/api/user";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useIntervalFn } from "@vueuse/core";

export default {
  name: "LoginForm",
  components: {
    Form,
    Field,
  },
  setup() {
    // 切换短信登录
    const isMsgLogin = ref(false);
    // 表单数据对象
    const form = reactive({
      isAgree: true,
      account: null,
      password: null,
      mobile: null,
      code: null,
    });

    // vee-validate 表单校验基本步骤
    // 1. 导入 Form Field 组件 分别将 form 和 input 进行替换 需要加上name用来指定将来的校验规则函数
    // 2. Field 需要进行数据绑定 字段名称最好和后台接口保持一致
    // 3. 定义Field的name属性指定校验规则函数 Form的 validation-schema 来接收定义好的校验规则
    // 4. 自定义组件需要校验必须先支持 v-model 然后 Field 使用 as 指定自定义组件名称

    const mySchema = {
      // 校验函数规则: 返回true就是成功 返回一个字符串就是失败 字符串就是错误提示
      account: schema.account,
      password: schema.password,
      mobile: schema.mobile,
      code: schema.code,
      isAgree: schema.isAgree,
    };

    // 监听 isMsgLogin 发生变换表明切换了 重置表单数据
    watch(isMsgLogin, () => {
      form.isAgree = true;
      form.account = null;
      form.password = null;
      form.mobile = null;
      form.code = null;
    });

    // 需要在点击登录的时候对表单进行整体校验
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    // ref 加在组件上拿的就是组件实例可以调用方法 加在元素上拿的就是dom
    const formCom = ref(null);
    const login = async () => {
      // Form 提供了一个方法 validate 用来做整体表单校验 但返回的是一个Promise
      const valid = await formCom.value.validate();
      // console.log(valid)    true 校验成功 false 校验失败
      // Message({ type: "error", text: "用户名或者密码错误" });

      // 表单校验成功后:
      if (valid) {
        try {
          let data = null;
          if (isMsgLogin.value) {
            // ***手机号登录
            // 2.1. 准备1个API做手机号登录
            // 2.2. 调用API
            // 2.3. 成功: 存储用户信息 + 跳转至来源页或者首页 + 消息提示
            // 2.4. 失败: 消息提示
            const { mobile, code } = form;
            data = await userMobileLogin({ mobile, code });
          } else {
            // ***账号密码登录
            // 1. 准备1个API做账号登录
            // 2. 调用API
            // 3. 成功: 存储用户信息 + 跳转至来源页或者首页 + 消息提示
            // 4. 失败: 消息提示
            const { account, password } = form;
            data = await userAccountLogin({ account, password });
          }
          // 存储用户信息
          const { id, account, avater, mobile, nickname, token } = data.result;
          store.commit("user/setUser", {
            id,
            account,
            avater,
            mobile,
            nickname,
            token,
          });
          // 合并购物车
          store.dispatch("cart/mergeCart").then(() => {
            // 进行跳转
            router.push(route.query.redirectUrl || "/");
            // 成功的消息提示
            Message({ type: "success", text: "登录成功" });
          });
        } catch (e) {
          // 失败的消息提示
          if (e.response.data) {
            Message({
              type: "error",
              text: e.response.data.message || "登录失败，用户名不存在",
            });
          }
          // Message({ type: "error", text: "登录失败，用户名不存在" });
        }
      }
    };

    // 发送短信
    // 1. 发送验证码
    // 1.1 绑定发送验证码按钮点击事件
    // 1.2 校验手机号 如果成功就去发送短信(定义API) 请求成功开启60s的倒计时且此时不能点击 结束恢复原样可点击
    // 1.3 如果校验失败  失败的提示要显示出来
    // pause 暂停 resume 开启 useIntervalFn(回调函数,执行间隔,是否立即开启)
    const time = ref(0);
    const { pause, resume } = useIntervalFn(
      () => {
        time.value--;
        if (time.value <= 0) {
          // 终止销毁定时器
          pause();
        }
      },
      1000,
      false
    );

    onUnmounted(() => {
      pause();
    });
    // 发送短信按钮函数
    const send = async () => {
      const valid = mySchema.mobile(form.mobile);
      // valid 返回的值是 true 或 错误信息
      if (valid === true) {
        // 校验通过
        // 没有倒计时才可以发送
        if (time.value === 0) {
          await userMobileLoginMsg(form.mobile);
          Message({ type: "success", text: "发送成功" });
          time.value = 60;
          // 开启定时器
          resume();
        }
      } else {
        // 校验失败 使用 vee 的错误函数显示错误信息 setFieldError(字段名称,错误信息)
        formCom.value.setFieldError("mobile", valid);
      }
    };

    // 初始化QQ登录按钮(官方)
    // 1. 准备span有id
    // 2. QC.Login({btnId: 'qqLoginBtn'})
    // onMounted(() => {
    //   QC.Login({ btnId: "qqLoginBtn" });
    // });

    return { isMsgLogin, form, schema: mySchema, formCom, login, send, time };
  },
};
</script>
<style lang="less" scoped>
// 账号容器
.account-box {
  .toggle {
    padding: 15px 40px;
    text-align: right;
    a {
      color: @xtxColor;
      i {
        font-size: 14px;
      }
    }
  }
  .form {
    padding: 0 40px;
    &-item {
      margin-bottom: 28px;
      .input {
        position: relative;
        height: 36px;
        > i {
          width: 34px;
          height: 34px;
          background: #cfcdcd;
          color: #fff;
          position: absolute;
          left: 1px;
          top: 1px;
          text-align: center;
          line-height: 34px;
          font-size: 18px;
        }
        input {
          padding-left: 44px;
          border: 1px solid #cfcdcd;
          height: 36px;
          line-height: 36px;
          width: 100%;
          &.error {
            border-color: @priceColor;
          }
          &.active,
          &:focus {
            border-color: @xtxColor;
          }
        }
        .code {
          position: absolute;
          right: 1px;
          top: 1px;
          text-align: center;
          line-height: 34px;
          font-size: 14px;
          background: #f5f5f5;
          color: #666;
          width: 90px;
          height: 34px;
          cursor: pointer;
        }
      }
      > .error {
        position: absolute;
        font-size: 12px;
        line-height: 28px;
        color: @priceColor;
        i {
          font-size: 14px;
          margin-right: 2px;
        }
      }
    }
    .agree {
      a {
        color: #069;
      }
    }
    .btn {
      display: block;
      width: 100%;
      height: 40px;
      color: #fff;
      text-align: center;
      line-height: 40px;
      background: @xtxColor;
      &.disabled {
        background: #cfcdcd;
      }
    }
  }
  .action {
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .url {
      a {
        color: #999;
        margin-left: 10px;
      }
    }
  }
}
</style>
