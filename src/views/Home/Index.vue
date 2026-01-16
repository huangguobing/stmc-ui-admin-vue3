<template>
  <div>
    <!-- 欢迎卡片 + 基础统计 -->
    <el-card shadow="never">
      <el-row :gutter="16" justify="space-between" align="middle">
        <el-col :xl="10" :lg="10" :md="24" :sm="24" :xs="24">
          <div class="flex items-center">
            <el-avatar :src="avatar" :size="60" class="mr-16px">
              <img src="@/assets/imgs/avatar.gif" alt="" />
            </el-avatar>
            <div>
              <div class="text-18px font-medium">{{ username }}，您好</div>
              <div class="mt-8px text-14px text-gray-500">今天是 {{ currentDate }}</div>
            </div>
          </div>
        </el-col>
        <el-col :xl="14" :lg="14" :md="24" :sm="24" :xs="24">
          <div class="flex items-center justify-end lt-md:mt-16px lt-md:justify-start">
            <div class="stat-item">
              <div class="stat-value">
                <CountTo :start-val="0" :end-val="statistics.customerCount" :duration="2000" />
              </div>
              <div class="stat-label">客户总数</div>
            </div>
            <!-- 供应商数（仅管理员） -->
            <template v-if="statistics.supplierCount !== null && statistics.supplierCount !== undefined">
              <el-divider direction="vertical" class="!h-40px" />
              <div class="stat-item">
                <div class="stat-value">
                  <CountTo :start-val="0" :end-val="statistics.supplierCount" :duration="2000" />
                </div>
                <div class="stat-label">供应商</div>
              </div>
            </template>
            <el-divider direction="vertical" class="!h-40px" />
            <div class="stat-item">
              <div class="stat-value">
                <CountTo :start-val="0" :end-val="statistics.orderCount" :duration="2000" />
              </div>
              <div class="stat-label">订单总数</div>
            </div>
            <!-- 待付款（仅管理员） -->
            <template v-if="statistics.pendingPaymentPlanCount !== null && statistics.pendingPaymentPlanCount !== undefined">
              <el-divider direction="vertical" class="!h-40px" />
              <div class="stat-item">
                <div class="stat-value text-orange-500">
                  <CountTo :start-val="0" :end-val="statistics.pendingPaymentPlanCount" :duration="2000" />
                </div>
                <div class="stat-label">待付款</div>
              </div>
            </template>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 待处理事项提醒（仅管理员可见） -->
    <el-row class="mt-16px" :gutter="16" v-if="statistics.isAdmin && hasPendingTasks">
      <el-col :span="24">
        <el-alert type="warning" :closable="false" show-icon>
          <template #title>
            <span class="font-medium">待处理事项：</span>
            <span v-if="statistics.pendingReviewOrderCount > 0" class="ml-16px">
              <el-link type="warning" @click="handleNavigate('/order/manage?status=0')">
                {{ statistics.pendingReviewOrderCount }} 个订单待审核
              </el-link>
            </span>
            <span v-if="statistics.pendingCostOrderCount > 0" class="ml-16px">
              <el-link type="warning" @click="handleNavigate('/order/manage?status=10')">
                {{ statistics.pendingCostOrderCount }} 个订单待填充成本
              </el-link>
            </span>
          </template>
        </el-alert>
      </el-col>
    </el-row>

    <!-- 经营数据统计 -->
    <el-card shadow="never" class="mt-16px">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-15px font-medium">经营数据统计</span>
          <el-radio-group v-model="activePeriod" size="small">
            <el-radio-button value="today">今天</el-radio-button>
            <el-radio-button value="week">本周</el-radio-button>
            <el-radio-button value="month">本月</el-radio-button>
            <el-radio-button value="year">本年</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :xl="{ span: 4, offset: 1 }" :lg="{ span: 4, offset: 1 }" :md="8" :sm="12" :xs="12" class="mb-16px">
          <div class="data-card">
            <div class="data-icon" style="background-color: #409EFF">
              <Icon icon="ep:document" :size="24" color="#fff" />
            </div>
            <div class="data-info">
              <div class="data-value">
                <CountTo :start-val="0" :end-val="currentPeriodData.orderCount" :duration="1500" />
              </div>
              <div class="data-label">订单数</div>
            </div>
          </div>
        </el-col>
        <el-col :xl="{ span: 4, offset: 1 }" :lg="{ span: 4, offset: 1 }" :md="8" :sm="12" :xs="12" class="mb-16px">
          <div class="data-card">
            <div class="data-icon" style="background-color: #E6A23C">
              <Icon icon="ep:money" :size="24" color="#fff" />
            </div>
            <div class="data-info">
              <div class="data-value text-orange-500">
                <CountTo
                  :start-val="0"
                  :end-val="currentPeriodData.salesAmount"
                  :duration="1500"
                  :decimals="2"
                  prefix="¥"
                />
              </div>
              <div class="data-label">销售额</div>
            </div>
          </div>
        </el-col>
        <el-col :xl="{ span: 4, offset: 1 }" :lg="{ span: 4, offset: 1 }" :md="8" :sm="12" :xs="12" class="mb-16px" v-if="canViewCost">
          <div class="data-card">
            <div class="data-icon" style="background-color: #909399">
              <Icon icon="ep:goods" :size="24" color="#fff" />
            </div>
            <div class="data-info">
              <div class="data-value text-gray-500">
                <CountTo
                  :start-val="0"
                  :end-val="currentPeriodData.costAmount"
                  :duration="1500"
                  :decimals="2"
                  prefix="¥"
                />
              </div>
              <div class="data-label">成本</div>
            </div>
          </div>
        </el-col>
        <el-col :xl="{ span: 4, offset: 1 }" :lg="{ span: 4, offset: 1 }" :md="8" :sm="12" :xs="12" class="mb-16px" v-if="canViewCost">
          <div class="data-card">
            <div class="data-icon" style="background-color: #67C23A">
              <Icon icon="ep:trend-charts" :size="24" color="#fff" />
            </div>
            <div class="data-info">
              <div class="data-value" :class="currentPeriodData.grossProfit >= 0 ? 'text-green-500' : 'text-red-500'">
                <CountTo
                  :start-val="0"
                  :end-val="currentPeriodData.grossProfit"
                  :duration="1500"
                  :decimals="2"
                  prefix="¥"
                />
              </div>
              <div class="data-label">毛利</div>
            </div>
          </div>
        </el-col>
        <el-col :xl="{ span: 4 }" :lg="{ span: 4 }" :md="8" :sm="12" :xs="12" class="mb-16px" v-if="canViewCost">
          <div class="data-card">
            <div class="data-icon" style="background-color: #F56C6C">
              <Icon icon="ep:coin" :size="24" color="#fff" />
            </div>
            <div class="data-info">
              <div class="data-value" :class="currentPeriodData.netProfit >= 0 ? 'text-green-500' : 'text-red-500'">
                <CountTo
                  :start-val="0"
                  :end-val="currentPeriodData.netProfit"
                  :duration="1500"
                  :decimals="2"
                  prefix="¥"
                />
              </div>
              <div class="data-label">净利润</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 功能入口 -->
    <el-row class="mt-16px" :gutter="16">
      <el-col
        v-for="item in modules"
        :key="item.name"
        :xl="6"
        :lg="6"
        :md="12"
        :sm="12"
        :xs="24"
        class="mb-16px"
      >
        <el-card
          shadow="hover"
          class="module-card cursor-pointer"
          @click="handleNavigate(item.url)"
        >
          <div class="flex items-center">
            <div class="module-icon" :style="{ backgroundColor: item.bgColor }">
              <Icon :icon="item.icon" :size="24" color="#fff" />
            </div>
            <div class="ml-16px">
              <div class="text-16px font-medium">{{ item.name }}</div>
              <div class="mt-4px text-13px text-gray-400">{{ item.desc }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card shadow="never" class="mt-8px">
      <template #header>
        <span class="text-15px font-medium">快捷操作</span>
      </template>
      <el-row :gutter="16">
        <el-col
          v-for="action in quickActions"
          :key="action.name"
          :xl="4"
          :lg="4"
          :md="8"
          :sm="8"
          :xs="12"
          class="mb-8px"
        >
          <div
            class="quick-action flex flex-col items-center cursor-pointer py-12px rounded-8px hover:bg-gray-50"
            @click="handleNavigate(action.url)"
          >
            <Icon :icon="action.icon" :size="28" :color="action.color" />
            <span class="mt-8px text-13px">{{ action.name }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { HomeApi, HomeStatisticsVO } from '@/api/erp/home'

dayjs.locale('zh-cn')

defineOptions({ name: 'Index' })

const router = useRouter()
const userStore = useUserStore()

const avatar = userStore.getUser.avatar
const username = userStore.getUser.nickname

// 当前日期
const currentDate = dayjs().format('YYYY年MM月DD日 dddd')

// 统计数据
const statistics = reactive<HomeStatisticsVO>({
  customerCount: 0,
  supplierCount: 0,
  orderCount: 0,
  pendingPaymentPlanCount: 0,
  todayOrderCount: 0,
  todaySalesAmount: 0,
  todayCostAmount: 0,
  todayGrossProfit: 0,
  todayNetProfit: 0,
  weekOrderCount: 0,
  weekSalesAmount: 0,
  weekCostAmount: 0,
  weekGrossProfit: 0,
  weekNetProfit: 0,
  monthOrderCount: 0,
  monthSalesAmount: 0,
  monthCostAmount: 0,
  monthGrossProfit: 0,
  monthNetProfit: 0,
  yearOrderCount: 0,
  yearSalesAmount: 0,
  yearCostAmount: 0,
  yearGrossProfit: 0,
  yearNetProfit: 0,
  pendingReviewOrderCount: 0,
  pendingCostOrderCount: 0,
  isAdmin: false
})

// 当前选择的时间周期
const activePeriod = ref<'today' | 'week' | 'month' | 'year'>('month')

// 当前周期的数据
const currentPeriodData = computed(() => {
  switch (activePeriod.value) {
    case 'today':
      return {
        orderCount: statistics.todayOrderCount,
        salesAmount: statistics.todaySalesAmount,
        costAmount: statistics.todayCostAmount,
        grossProfit: statistics.todayGrossProfit,
        netProfit: statistics.todayNetProfit
      }
    case 'week':
      return {
        orderCount: statistics.weekOrderCount,
        salesAmount: statistics.weekSalesAmount,
        costAmount: statistics.weekCostAmount,
        grossProfit: statistics.weekGrossProfit,
        netProfit: statistics.weekNetProfit
      }
    case 'month':
      return {
        orderCount: statistics.monthOrderCount,
        salesAmount: statistics.monthSalesAmount,
        costAmount: statistics.monthCostAmount,
        grossProfit: statistics.monthGrossProfit,
        netProfit: statistics.monthNetProfit
      }
    case 'year':
      return {
        orderCount: statistics.yearOrderCount,
        salesAmount: statistics.yearSalesAmount,
        costAmount: statistics.yearCostAmount,
        grossProfit: statistics.yearGrossProfit,
        netProfit: statistics.yearNetProfit
      }
    default:
      return {
        orderCount: 0,
        salesAmount: 0,
        costAmount: 0,
        grossProfit: 0,
        netProfit: 0
      }
  }
})

// 是否有待处理事项
const hasPendingTasks = computed(() => {
  return statistics.pendingReviewOrderCount > 0 || statistics.pendingCostOrderCount > 0
})

// 是否可以查看成本信息（根据后端返回数据判断）
const canViewCost = computed(() => {
  return statistics.todayCostAmount !== null && statistics.todayCostAmount !== undefined
})

// 获取统计数据
const getStatistics = async () => {
  try {
    const data = await HomeApi.getStatistics()
    Object.assign(statistics, data)
  } catch (error) {
    console.error('获取首页统计数据失败', error)
  }
}

// 功能模块
const modules = computed(() => {
  const allModules = [
    {
      name: '客户管理',
      icon: 'ep:user',
      url: '/customer',
      bgColor: '#409EFF',
      desc: '客户信息维护'
    },
    {
      name: '供应商管理',
      icon: 'ep:shop',
      url: '/supplier',
      bgColor: '#67C23A',
      desc: '供应商档案管理',
      adminOnly: true
    },
    {
      name: '订单管理',
      icon: 'ep:document',
      url: '/order/manage',
      bgColor: '#E6A23C',
      desc: '业务订单处理'
    },
    {
      name: '付款管理',
      icon: 'ep:money',
      url: '/payment',
      bgColor: '#F56C6C',
      desc: '付款与账期管理',
      adminOnly: true
    }
  ]
  return statistics.isAdmin
    ? allModules
    : allModules.filter(m => !m.adminOnly)
})

// 快捷操作
const quickActions = computed(() => {
  const allActions = [
    { name: '新增客户', icon: 'ep:user-filled', url: '/customer', color: '#409EFF' },
    { name: '销售开单', icon: 'ep:document-add', url: '/order/create', color: '#E6A23C' },
    { name: '付款管理', icon: 'ep:wallet', url: '/payment', color: '#F56C6C', adminOnly: true },
    { name: '供应商', icon: 'ep:shop', url: '/supplier', color: '#67C23A', adminOnly: true },
    { name: '用户管理', icon: 'ep:avatar', url: '/system/user', color: '#909399', adminOnly: true },
    { name: '角色权限', icon: 'ep:lock', url: '/system/role', color: '#9C27B0', adminOnly: true }
  ]
  return statistics.isAdmin
    ? allActions
    : allActions.filter(a => !a.adminOnly)
})

const handleNavigate = (url: string) => {
  router.push(url)
}

// 当页面激活时刷新数据（首次进入和从缓存激活都会触发）
onActivated(() => {
  getStatistics()
})
</script>

<style lang="scss" scoped>
.stat-item {
  padding: 0 16px;
  text-align: center;

  .stat-value {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
  }

  .stat-label {
    margin-top: 4px;
    font-size: 13px;
    color: #909399;
  }
}

.data-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;

  .data-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .data-info {
    margin-left: 12px;

    .data-value {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }

    .data-label {
      margin-top: 4px;
      font-size: 13px;
      color: #909399;
    }
  }
}

.module-card {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  .module-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.quick-action {
  transition: all 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }
}
</style>
