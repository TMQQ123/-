<template>
  <div class="member-order">
    <!-- tab 组件 -->
    <XtxTabs v-model="activeName" @tab-click="tabClick">
      <XtxTabsPanel
        v-for="item in orderStatus"
        :key="item.name"
        :label="item.label"
        :name="item.name"
      >
      </XtxTabsPanel>
    </XtxTabs>

    <!-- 订单列表 -->
    <div class="order-list">
      <div v-if="loading" class="loading"></div>
      <div class="none" v-if="!loading && orderList.length === 0">暂无数据</div>
      <OrderItem
        @on-cancel="handelCancel"
        @on-logistics="handerLogistics"
        @on-confirm="handerConfirm"
        @on-delete="handerDelete"
        v-for="item in orderList"
        :key="item.id"
        :order="item"
      ></OrderItem>
    </div>

    <!-- 分页组件 -->
    <XtxPagination
      v-if="total > 0"
      :current-page="reqParams.page"
      :page-size="reqParams.pageSize"
      :total="total"
      @current-change="reqParams.page = $event"
    >
    </XtxPagination>
    <!-- 取消原因组件 -->
    <OrderCancel ref="orderCancelCom"></OrderCancel>
    <!-- 查看物流组件 -->
    <OrderLogistics ref="orderLogisticsCom"></OrderLogistics>
  </div>
</template>

<script>
import { reactive, ref, watch } from "vue";
import { orderStatus } from "@/api/constants";
import OrderItem from "./components/order-item.vue";
import { confirmOrder, deleteOrder, findOrderList } from "@/api/order";
import OrderCancel from "./components/order-cancel.vue";
import Confirm from "@/components/library/Confirm";
import Message from "@/components/library/Message";
import OrderLogistics from "./components/order-logistics.vue";

export default {
  name: "MemberOrder",
  components: { OrderItem, OrderCancel, OrderLogistics },
  setup() {
    const activeName = ref("all");
    // ---------------------------------------
    // 筛选条件
    const reqParams = reactive({
      page: 1,
      pageSize: 5,
      orderState: 0,
    });

    // ---------------------------------------
    const orderList = ref([]);
    const loading = ref(false);
    const total = ref(0);
    // 筛选条件发生变化重新加载-获取数据
    const getOrderList = () => {
      loading.value = true;
      findOrderList(reqParams).then((data) => {
        orderList.value = data.result.items;
        total.value = data.result.counts;
        loading.value = false;
      });
    };
    watch(
      reqParams,
      () => {
        getOrderList();
      },
      { immediate: true }
    );

    // 切换tab
    const tabClick = ({ index }) => {
      reqParams.page = 1;
      reqParams.orderState = index;
    };

    // ---------------------------------------
    // 删除订单
    const handerDelete = (order) => {
      Confirm({ text: "您确认删除该订单吗?" })
        .then(() => {
          deleteOrder(order.id).then((data) => {
            Message({ type: "success", text: "删除成功" });
            getOrderList();
          });
        })
        .catch(() => {});
    };

    // ---------------------------------------

    return {
      activeName,
      orderStatus,
      orderList,
      tabClick,
      loading,
      total,
      reqParams,
      handerDelete,
      ...useCancel(),
      ...useConfirm(),
      ...useLogistics(),
    };
  },
};

// ---------------------------------------
// 取消订单逻辑
export const useCancel = () => {
  // 组件实例
  const orderCancelCom = ref(null);
  // 点击取消订单操作
  const handelCancel = (order) => {
    // 打开对话框
    orderCancelCom.value.open(order);
  };
  return { handelCancel, orderCancelCom };
};

// ---------------------------------------
// 确认收货逻辑
export const useConfirm = () => {
  const handerConfirm = (order) => {
    Confirm({ text: "确认收货吗? 确认后货款将打给买家" })
      .then(() => {
        confirmOrder(order.id).then(() => {
          Message({ type: "success", text: "确认收货成功" });
          // 待收货--->待评价
          order.orderState = 4;
        });
      })
      .catch(() => {});
  };
  return { handerConfirm };
};

// ---------------------------------------
// 查看物流逻辑
export const useLogistics = () => {
  const orderLogisticsCom = ref(null);
  const handerLogistics = (order) => {
    orderLogisticsCom.value.open(order);
  };
  return { handerLogistics, orderLogisticsCom };
};
</script>

<style lang="less" scoped>
.member-order {
  height: 100%;
  background: #fff;
}

.order-list {
  background: #fff;
  padding: 20px;
  position: relative;
}

.loading {
  height: 100%;
  width: 100%;
  min-height: 400px;
  position: absolute;
  left: 0;
  top: 0;
  background: rgba(255, 255, 255, 0.9) url(../../../assets/images/loading.gif) no-repeat
    center;
}

.none {
  height: 400px;
  text-align: center;
  line-height: 400px;
  color: #999;
}
</style>
