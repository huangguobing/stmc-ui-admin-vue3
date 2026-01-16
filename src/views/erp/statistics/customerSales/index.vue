<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px" label-width="80px">
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
          type="date"
          placeholder="请选择开始日期"
          value-format="YYYY-MM-DD"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          type="date"
          placeholder="请选择结束日期"
          value-format="YYYY-MM-DD"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          class="!w-150px"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入手机号"
          clearable
          class="!w-150px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 统计概览 -->
  <el-row :gutter="20" class="summary-cards">
    <el-col :span="6">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-label">总订单数</div>
          <div class="stat-value text-primary">{{ totalOrderCount }}</div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-label">总销售额</div>
          <div class="stat-value text-primary">{{ formatNumber(totalSalesAmount) }}</div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-label">总毛利</div>
          <div class="stat-value" :class="totalGrossProfit >= 0 ? 'text-success' : 'text-danger'">
            {{ formatNumber(totalGrossProfit) }}
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-label">总净利润</div>
          <div class="stat-value" :class="totalNetProfit >= 0 ? 'text-success' : 'text-danger'">
            {{ formatNumber(totalNetProfit) }}
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :header-cell-style="{ background: '#f5f7fa', fontWeight: 'bold' }"
      class="statistics-table"
    >
      <el-table-column align="center" label="客户名称" prop="customerName" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="客户编号" prop="customerCode" min-width="120" />
      <el-table-column align="center" label="联系人" prop="contact" min-width="100" />
      <el-table-column align="center" label="联系电话" prop="mobile" min-width="130" />
      <el-table-column align="center" label="订单数" prop="orderCount" width="100">
        <template #default="{ row }">
          <span class="font-medium">{{ row.orderCount }}</span>
        </template>
      </el-table-column>
      <el-table-column align="right" label="销售额" prop="salesAmount" min-width="130">
        <template #default="{ row }">
          <span class="text-primary font-bold">{{ formatNumber(row.salesAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="right" label="成本" prop="costAmount" min-width="130">
        <template #default="{ row }">
          <span class="font-medium">{{ formatNumber(row.costAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="right" label="毛利" prop="grossProfit" min-width="130">
        <template #default="{ row }">
          <span class="font-bold" :class="row.grossProfit >= 0 ? 'text-success' : 'text-danger'">
            {{ formatNumber(row.grossProfit) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column align="right" label="净利润" prop="netProfit" min-width="130">
        <template #default="{ row }">
          <span class="font-bold" :class="row.netProfit >= 0 ? 'text-success' : 'text-danger'">
            {{ formatNumber(row.netProfit) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { StatisticsApi, CustomerStatisticsVO } from '@/api/erp/statistics'
import { formatNumber } from '@/utils'
import { formatDate } from '@/utils/formatTime'

defineOptions({ name: 'ErpCustomerSalesStatistics' })

const loading = ref(true)
const list = ref<CustomerStatisticsVO[]>([])

/** 获取本月第一天 */
const getMonthFirstDay = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

const queryParams = reactive({
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined,
  customerName: undefined as string | undefined,
  mobile: undefined as string | undefined
})

const queryFormRef = ref()

/** 统计概览数据 */
const totalOrderCount = computed(() => {
  return list.value.reduce((sum, item) => sum + (item.orderCount || 0), 0)
})

const totalSalesAmount = computed(() => {
  return list.value.reduce((sum, item) => sum + (item.salesAmount || 0), 0)
})

const totalGrossProfit = computed(() => {
  return list.value.reduce((sum, item) => sum + (item.grossProfit || 0), 0)
})

const totalNetProfit = computed(() => {
  return list.value.reduce((sum, item) => sum + (item.netProfit || 0), 0)
})

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await StatisticsApi.getCustomerSalesStatistics(queryParams)
    list.value = data || []
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  // 重置为本月日期
  queryParams.startDate = formatDate(getMonthFirstDay(), 'YYYY-MM-DD')
  queryParams.endDate = formatDate(new Date(), 'YYYY-MM-DD')
  queryParams.customerName = undefined
  queryParams.mobile = undefined
  handleQuery()
}

/** 初始化 - 默认填充本月日期 */
onMounted(async () => {
  queryParams.startDate = formatDate(getMonthFirstDay(), 'YYYY-MM-DD')
  queryParams.endDate = formatDate(new Date(), 'YYYY-MM-DD')
  await getList()
})
</script>

<style scoped>
/* 统计卡片样式 */
.summary-cards {
  margin: 20px 0;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-content {
  padding: 10px 0;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.2;
}

/* 表格样式 */
.statistics-table :deep(.el-table__body-row:hover > td) {
  background-color: #f0f9ff !important;
}

/* 文字颜色 */
.text-primary {
  color: var(--el-color-primary);
}
.text-success {
  color: var(--el-color-success);
}
.text-danger {
  color: var(--el-color-danger);
}

/* 字体加粗 */
.font-bold {
  font-weight: bold;
}

.font-medium {
  font-weight: 500;
}
</style>
