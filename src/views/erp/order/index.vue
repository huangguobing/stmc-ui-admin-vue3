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
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="订单类型" prop="orderType">
        <el-select
          v-model="queryParams.orderType"
          placeholder="请选择订单类型"
          clearable
          class="!w-240px"
        >
          <el-option label="销售订单" :value="1" />
          <el-option label="采购订单" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择订单状态"
          clearable
          class="!w-240px"
        >
          <el-option label="草稿" :value="0" />
          <el-option label="待确认" :value="10" />
          <el-option label="已确认" :value="20" />
          <el-option label="处理中" :value="30" />
          <el-option label="已完成" :value="40" />
          <el-option label="已取消" :value="50" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:order:create']"
        >
          <Icon icon="ep:plus" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="订单号" align="center" prop="orderNo" width="150" />
      <el-table-column label="订单类型" align="center" prop="orderType" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.orderType === 1 ? 'success' : 'warning'">
            {{ scope.row.orderType === 1 ? '销售' : '采购' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单日期" align="center" prop="orderDate" :formatter="dateFormatter" width="120" />
      <el-table-column label="交货日期" align="center" prop="deliveryDate" :formatter="dateFormatter" width="120" />
      <el-table-column label="商品金额" align="right" prop="totalAmount" width="100" />
      <el-table-column label="应付金额" align="right" prop="payableAmount" width="100" />
      <el-table-column label="联系人" align="center" prop="contact" width="100" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button
            type="primary"
            link
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:order:update']"
          >
            修改
          </el-button>
          <el-button
            type="danger"
            link
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:order:delete']"
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
  <OrderForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import { OrderApi, OrderVO } from '@/api/erp/order'
import OrderForm from './OrderForm.vue'

defineOptions({ name: 'ErpOrder' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const total = ref(0)
const list = ref<OrderVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderNo: undefined,
  orderType: undefined,
  status: undefined
})
const queryFormRef = ref()

/** 获取状态类型 */
const getStatusType = (status: number) => {
  switch (status) {
    case 0: return 'info'
    case 10: return 'warning'
    case 20: return 'primary'
    case 30: return 'primary'
    case 40: return 'success'
    case 50: return 'danger'
    default: return 'info'
  }
}

/** 获取状态标签 */
const getStatusLabel = (status: number) => {
  switch (status) {
    case 0: return '草稿'
    case 10: return '待确认'
    case 20: return '已确认'
    case 30: return '处理中'
    case 40: return '已完成'
    case 50: return '已取消'
    default: return '未知'
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await OrderApi.getOrderPage(queryParams)
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
    await OrderApi.deleteOrder(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>
