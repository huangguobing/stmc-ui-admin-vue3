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
          class="!w-200px"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择订单状态"
          clearable
          class="!w-200px"
        >
          <el-option label="待审核" :value="0" />
          <el-option label="待填充成本" :value="10" />
          <el-option label="已完成" :value="20" />
          <el-option label="已取消" :value="50" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
        <el-button
          type="primary"
          plain
          @click="router.push('/order/create')"
          v-hasPermi="['erp:order:create']"
        >
          <Icon icon="ep:plus" /> 销售开单
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="订单号" align="center" prop="orderNo" width="160" />
      <el-table-column label="客户" align="center" prop="customerName" width="150" />
      <el-table-column label="联系人" align="center" prop="contact" width="100" />
      <el-table-column label="订单状态" align="center" prop="status" width="110">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单日期" align="center" prop="orderDate" width="110">
        <template #default="scope">
          {{ scope.row.orderDate ? scope.row.orderDate.substring(0, 10) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="销售金额" align="right" prop="totalAmount" width="100">
        <template #default="scope">
          <span class="text-red-500">{{ formatNumber(scope.row.totalAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应付金额" align="right" prop="payableAmount" width="100">
        <template #default="scope">
          <span class="text-red-500 font-bold">{{ formatNumber(scope.row.payableAmount) }}</span>
        </template>
      </el-table-column>
      <!-- 收款状态列 -->
      <el-table-column label="收款状态" align="center" width="120">
        <template #default="scope">
          <el-tag :type="getPaymentStatusType(scope.row)">
            {{ getPaymentStatusText(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 管理员可见的成本列 -->
      <el-table-column
        v-if="hasPermission('erp:order:fill-cost')"
        label="采购成本"
        align="right"
        prop="totalPurchaseAmount"
        width="100"
      >
        <template #default="scope">
          <span v-if="scope.row.costFilled" class="text-blue-500">
            {{ formatNumber(scope.row.totalPurchaseAmount) }}
          </span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasPermission('erp:order:fill-cost')"
        label="净利润"
        align="right"
        prop="totalNetProfit"
        width="100"
      >
        <template #default="scope">
          <span v-if="scope.row.costFilled" :class="scope.row.totalNetProfit >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ formatNumber(scope.row.totalNetProfit) }}
          </span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column label="业务员" align="center" prop="salesmanName" width="100" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="170"
      />
      <el-table-column label="操作" align="center" min-width="220" fixed="right">
        <template #default="scope">
          <!-- 查看详情 -->
          <el-button type="primary" link @click="openDetail(scope.row.id)">
            详情
          </el-button>
          <!-- 打印数据 -->
          <el-button type="success" link @click="handlePrint(scope.row.id)">
            <Icon icon="ep:printer" /> 打印数据
          </el-button>
          <!-- 标注已收款（仅未收清时显示） -->
          <el-button
            v-if="(scope.row.paidAmount || 0) < (scope.row.payableAmount || 0)"
            type="success"
            link
            @click="handleMarkAsPaid(scope.row.id)"
          >
            <Icon icon="ep:success-filled" /> 标注已收款
          </el-button>
          <!-- 编辑（待审核 或 被驳回可编辑） -->
          <el-button
            v-if="canEdit(scope.row)"
            type="primary"
            link
            @click="handleEdit(scope.row.id)"
            v-hasPermi="['erp:order:update']"
          >
            编辑
          </el-button>
          <!-- 待审核状态：审核通过/拒绝 -->
          <template v-if="scope.row.status === 0">
            <el-button
              type="success"
              link
              @click="handleApprove(scope.row.id)"
              v-hasPermi="['erp:order:approve']"
            >
              通过
            </el-button>
            <el-button
              type="warning"
              link
              @click="handleReject(scope.row.id)"
              v-hasPermi="['erp:order:approve']"
            >
              拒绝
            </el-button>
          </template>
          <!-- 待填充成本状态：填充成本 -->
          <el-button
            v-if="scope.row.status === 10"
            type="primary"
            link
            @click="openCostForm(scope.row.id)"
            v-hasPermi="['erp:order:fill-cost']"
          >
            填充成本
          </el-button>
          <!-- 已完成状态且成本已填充：编辑成本 -->
          <el-button
            v-if="scope.row.status === 20 && scope.row.costFilled"
            type="primary"
            link
            @click="openEditCostForm(scope.row.id)"
            v-hasPermi="['erp:order:edit-cost']"
          >
            编辑
          </el-button>
          <!-- 删除（待审核 或 被驳回可删除） -->
          <el-button
            v-if="canDelete(scope.row)"
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

  <!-- 成本填充弹窗 -->
  <CostForm ref="costFormRef" @success="getList" />

  <!-- 订单详情弹窗 -->
  <OrderDetail ref="detailRef" />
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import { formatNumber } from '@/utils'
import { OrderApi, OrderVO, OrderStatus } from '@/api/erp/order'
import CostForm from './CostForm.vue'
import OrderDetail from './OrderDetail.vue'
import { checkPermi } from '@/utils/permission'
import download from '@/utils/download'

defineOptions({ name: 'ErpOrder' })

const message = useMessage()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const loading = ref(true)
const total = ref(0)
const list = ref<OrderVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderNo: undefined,
  orderType: 1, // 默认查销售订单
  status: undefined
})
const queryFormRef = ref()

/** 检查权限 */
const hasPermission = (permission: string) => {
  return checkPermi([permission])
}

/** 获取状态类型 */
const getStatusType = (status: number) => {
  switch (status) {
    case OrderStatus.PENDING_REVIEW: return 'warning'
    case OrderStatus.PENDING_COST: return 'primary'
    case OrderStatus.COMPLETED: return 'success'
    case OrderStatus.CANCELLED: return 'info'
    default: return 'info'
  }
}

/** 获取状态标签 */
const getStatusLabel = (status: number) => {
  switch (status) {
    case OrderStatus.PENDING_REVIEW: return '待审核'
    case OrderStatus.PENDING_COST: return '待填充成本'
    case OrderStatus.COMPLETED: return '已完成'
    case OrderStatus.CANCELLED: return '已取消'
    default: return '未知'
  }
}

/** 判断订单是否可编辑 */
const canEdit = (row: OrderVO) => {
  // 待审核状态可编辑
  if (row.status === OrderStatus.PENDING_REVIEW) {
    return true
  }
  // 被驳回（已取消+备注包含"拒绝原因"）可编辑
  if (row.status === OrderStatus.CANCELLED && row.remark?.includes('拒绝原因')) {
    return true
  }
  return false
}

/** 判断订单是否可删除 */
const canDelete = (row: OrderVO) => {
  // 待审核 或 被驳回可删除
  return canEdit(row)
}

/** 获取收款状态文本 */
const getPaymentStatusText = (row: OrderVO) => {
  const paidAmount = row.paidAmount || 0
  const payableAmount = row.payableAmount || 0

  if (paidAmount >= payableAmount) return '已收款'
  return '未收款'
}

/** 获取收款状态标签类型 */
const getPaymentStatusType = (row: OrderVO) => {
  const paidAmount = row.paidAmount || 0
  const payableAmount = row.payableAmount || 0

  if (paidAmount >= payableAmount) return 'success'  // 已收款：绿色
  return 'danger'  // 未收款：红色
}

/** 标注订单为已收款 */
const handleMarkAsPaid = async (id: number) => {
  try {
    await message.confirm('确认标注该订单为已收清吗？')
    await OrderApi.markOrderAsPaid(id)
    message.success('标注成功')
    await getList()
  } catch {}
}

/** 编辑订单 */
const handleEdit = (id: number) => {
  router.push(`/order/edit/${id}`)
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

/** 打开详情 */
const detailRef = ref()
const openDetail = (id: number) => {
  detailRef.value.open(id)
}

/** 打开成本填充弹窗 */
const costFormRef = ref()
const openCostForm = (id: number) => {
  costFormRef.value.open(id)
}

/** 打开编辑成本表单 */
const openEditCostForm = (id: number) => {
  costFormRef.value.open(id, 'edit')
}

/** 审核通过 */
const handleApprove = async (id: number) => {
  try {
    await message.confirm('确认审核通过该订单？')
    await OrderApi.approveOrder(id)
    message.success('审核通过')
    await getList()
  } catch {}
}

/** 审核拒绝 */
const handleReject = async (id: number) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入拒绝原因', '审核拒绝', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入拒绝原因（可选）'
    })
    await OrderApi.rejectOrder(id, value)
    message.success('已拒绝')
    await getList()
  } catch {}
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

/** 打印订单数据 */
const handlePrint = async (id: number) => {
  try {
    const data = await OrderApi.printExport(id)
    // 从订单列表中查找客户名
    const order = list.value.find(o => o.id === id)
    const customerName = order?.customerName || '客户'
    // 生成文件名：尚泰铭成销售清单-{客户名称}-{年月日}.xlsx
    const now = new Date()
    const dateStr = now.getFullYear() +
                    String(now.getMonth() + 1).padStart(2, '0') +
                    String(now.getDate()).padStart(2, '0')
    download.excel(data, `尚泰铭成销售清单-${customerName}-${dateStr}.xlsx`)
  } catch (error) {
    console.error('打印失败:', error)
    message.error('打印失败，请重试')
  }
}

/** 初始化 */
onMounted(() => {
  getList()
})

/** 监听路由变化，检测到刷新参数时重新加载数据 */
watch(
  () => route.query.t,
  (newVal) => {
    if (newVal) {
      getList()
    }
  }
)
</script>
