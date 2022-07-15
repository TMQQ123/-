// hooks 封装逻辑，提供响应式数据。
import { useIntersectionObserver, useIntervalFn } from "@vueuse/core";
import { onUnmounted, ref } from "vue";
import dayjs from "dayjs";

// 数据懒加载函数
export const useLazyData = (apiFn) => {
  // 需要
  // 1. 被观察的对象
  // 2. 不同的API函数
  const target = ref(null);
  const result = ref([]);
  const { stop } = useIntersectionObserver(
    target,
    ([{ isIntersecting }], observerElement) => {
      if (isIntersecting) {
        stop();
        // 调用API获取数据
        apiFn().then((data) => {
          result.value = data.result;
        });
      }
    },
    // 配置选项 设置临界点 只要相交就触发
    {
      threshold: 0,
    }
  );
  // 返回--->数据（dom,后台数据）
  return { target, result };
};

/**
 * 支付倒计时函数
 * @param {Integer} countdown - 倒计时秒数
 */
export const usePayTime = (countdown) => {
  // 倒计时逻辑
  const time = ref(0);
  const timeText = ref("");
  const { pause, resume } = useIntervalFn(
    () => {
      time.value--;
      timeText.value = dayjs.unix(time.value).format("mm分ss秒");
      if (time.value <= 0) {
        pause();
      }
    },
    1000,
    false
  );
  onUnmounted(() => {
    pause();
  });
  // 开启定时器 countdown 倒计时时间
  const start = (countdown) => {
    time.value = countdown;
    timeText.value = dayjs.unix(time.value).format("mm分ss秒");
    resume();
  };

  return { start, timeText };
};
