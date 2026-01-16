<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="80px"
    >
      <el-form-item label="供应商" prop="supplierId">
        <el-select v-model="queryParams.supplierId" class="!w-200px" clearable placeholder="请选择供应商">
          <el-option v-for="item in supplierList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-200px" clearable placeholder="请选择状态">
          <el-option label="待付款" :value="0" />
          <el-option label="已付款" :value="10" />
          <el-option label="已逾期" :value="20" />
          <el-option label="已取消" :value="30" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
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

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column align="center" label="编号" prop="id" width="80" />
      <el-table-column align="center" label="供应商" prop="supplierName" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="开单业务员" prop="salesmanName" width="100" />
      <el-table-column align="center" label="订单号" prop="orderNo" width="180" />
      <el-table-column align="right" label="付款金额" prop="planAmount" width="120">
        <template #default="{ row }">{{ formatMoney(row.planAmount) }}</template>
      </el-table-column>
      <el-table-column align="center" label="计划付款日期" prop="planDate" width="120" />
      <el-table-column align="center" label="实际付款日期" prop="actualDate" width="120">
        <template #default="{ row }">
          {{ row.actualDate ? formatDate(row.actualDate) : '-' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusName(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注" prop="remark" min-width="120" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="创建时间" prop="createTime" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 0 || row.status === 20"
            v-hasPermi="['erp:payment-plan:pay']"
            type="primary"
            link
            @click="handleMarkPaid(row)"
          >
            标记已付款
          </el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { PaymentPlanApi, PaymentPlanVO } from '@/api/erp/paymentPlan'
import { SupplierApi } from '@/api/erp/supplier'
import { formatDate } from '@/utils/formatTime'
import { formatNumber } from '@/utils'

defineOptions({ name: 'ErpPaymentPlan' })

const message = useMessage()
const loading = ref(true)
const total = ref(0)
const list = ref<PaymentPlanVO[]>([])
const supplierList = ref<any[]>([])

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  supplierId: undefined as number | undefined,
  status: undefined as number | undefined
})

const queryFormRef = ref()

// 获取状态标签类型
const getStatusType = (status: number) => {
  switch (status) {
    case 0:
      return 'warning'
    case 10:
      return 'success'
    case 20:
      return 'danger'
    case 30:
      return 'info'
    default:
      return ''
  }
}

// 获取状态名称
const getStatusName = (status: number) => {
  switch (status) {
    case 0:
      return '待付款'
    case 10:
      return '已付款'
    case 20:
      return '已逾期'
    case 30:
      return '已取消'
    default:
      return '未知'
  }
}

// 格式化金额
const formatMoney = (val: number) => {
  return formatNumber(val)
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await PaymentPlanApi.getPaymentPlanPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.supplierId = undefined
  queryParams.status = undefined
  handleQuery()
}

/** 标记已付款 */
const handleMarkPaid = async (row: PaymentPlanVO) => {
  try {
    await message.confirm('确认标记此付款明细为已付款吗？')
    await PaymentPlanApi.markAsPaid(row.id)
    message.success('操作成功')
    await getList()
  } catch {}
}

/** 初始化 */
onMounted(async () => {
  // 获取供应商列表
  const res = await SupplierApi.getSupplierSimpleList()
  supplierList.value = Array.isArray(res) ? res : (res.list || [])
  // 获取付款计划列表
  await getList()
})
</script>
