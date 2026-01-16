<template>
  <ContentWrap>
    <!-- 搜索 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="付款单号" prop="paymentNo">
        <el-input
          v-model="queryParams.paymentNo"
          placeholder="请输入付款单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="付款状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择付款状态"
          clearable
          class="!w-240px"
        >
          <el-option label="待付款" :value="0" />
          <el-option label="部分付款" :value="10" />
          <el-option label="已完成" :value="20" />
          <el-option label="已取消" :value="30" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:payment:create']"
        >
          <Icon icon="ep:plus" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="供应商" align="center" prop="supplierName" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="付款状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="期数" align="center" prop="totalStages" width="80" />
      <el-table-column label="计划金额" align="right" prop="amount" width="120">
        <template #default="scope">
          {{ formatNumber(scope.row.amount) }}
        </template>
      </el-table-column>
      <el-table-column label="付款方式" align="center" prop="paymentMethod" width="100">
        <template #default="scope">
          {{ getPaymentMethodLabel(scope.row.paymentMethod) }}
        </template>
      </el-table-column>
      <el-table-column label="付款日期" align="center" prop="paymentDate" :formatter="dateFormatter" width="120" />
      <el-table-column label="备注" align="center" prop="remark" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template #default="scope">
          <el-button
            type="primary"
            link
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:payment:update']"
            v-if="scope.row.status === 0"
          >
            修改
          </el-button>
          <el-button
            type="danger"
            link
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:payment:delete']"
            v-if="scope.row.status === 0"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗 -->
  <PaymentForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import { formatNumber } from '@/utils'
import { PaymentApi, PaymentVO } from '@/api/erp/payment'
import PaymentForm from './PaymentForm.vue'

defineOptions({ name: 'ErpPayment' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const total = ref(0)
const list = ref<PaymentVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  paymentNo: undefined,
  status: undefined
})
const queryFormRef = ref()

/** 获取状态类型 */
const getStatusType = (status: number) => {
  switch (status) {
    case 0: return 'warning'   // 待付款
    case 10: return 'primary'  // 部分付款
    case 20: return 'success'  // 已完成
    case 30: return 'info'     // 已取消
    default: return 'info'
  }
}

/** 获取状态标签 */
const getStatusLabel = (status: number) => {
  switch (status) {
    case 0: return '待付款'
    case 10: return '部分付款'
    case 20: return '已完成'
    case 30: return '已取消'
    default: return '未知'
  }
}

/** 获取付款方式标签 */
const getPaymentMethodLabel = (method: number) => {
  switch (method) {
    case 1: return '银行转账'
    case 2: return '现金'
    case 3: return '支票'
    default: return '-'
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await PaymentApi.getPaymentPage(queryParams)
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
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await PaymentApi.deletePayment(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>
