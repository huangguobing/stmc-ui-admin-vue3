<template>
  <Dialog v-model="dialogVisible" title="订单详情" width="1100px">
    <div v-loading="loading">
      <!-- 订单基本信息 -->
      <el-card class="mb-20px" shadow="never">
        <template #header>
          <span class="font-bold">订单信息</span>
        </template>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="订单号">{{ orderData.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(orderData.status)">
              {{ getStatusLabel(orderData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="客户">{{ orderData.customerName }}</el-descriptions-item>
          <el-descriptions-item label="业务员">{{ orderData.salesmanName }}</el-descriptions-item>
          <el-descriptions-item label="订单日期">{{ safeFormatDate(orderData.orderDate) }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ orderData.contact }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ orderData.mobile }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="4">{{ orderData.address }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="4">{{ orderData.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 商品明细 -->
      <el-card class="mb-20px" shadow="never">
        <template #header>
          <span class="font-bold">商品明细</span>
        </template>
        <el-table :data="orderData.items || []" border>
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="商品名称" prop="productName" width="200" :show-overflow-tooltip="true" />
          <el-table-column label="规格" prop="spec" min-width="150" :show-overflow-tooltip="true" />
          <el-table-column label="单位" prop="saleUnit" width="80" align="center" />
          <el-table-column label="数量" prop="saleQuantity" width="80" align="right" />
          <el-table-column label="单价" prop="salePrice" width="80" align="right" />
          <el-table-column label="金额" width="100" align="right">
            <template #default="{ row }">
              <span class="text-red-500">{{ formatNumber(row.saleAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="saleRemark" width="100" :show-overflow-tooltip="true" />
          <!-- 成本信息（管理员可见或已填充） -->
          <template v-if="orderData.costFilled">
            <el-table-column label="供应商" prop="supplierName" width="100" />
            <el-table-column label="采购单价" prop="purchasePrice" width="80" align="right" />
            <el-table-column label="采购金额" width="100" align="right">
              <template #default="{ row }">
                <span class="text-blue-500">{{ formatNumber(row.purchaseAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="采购备注" prop="purchaseRemark" width="100" :show-overflow-tooltip="true" />
            <el-table-column label="毛利" width="80" align="right">
              <template #default="{ row }">
                <span :class="row.grossProfit >= 0 ? 'text-green-500' : 'text-red-500'">
                  {{ formatNumber(row.grossProfit) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="税额" prop="taxAmount" width="80" align="right" />
            <el-table-column label="净利" width="80" align="right">
              <template #default="{ row }">
                <span :class="row.netProfit >= 0 ? 'text-green-500' : 'text-red-500'">
                  {{ formatNumber(row.netProfit) }}
                </span>
              </template>
            </el-table-column>
          </template>
        </el-table>
      </el-card>

      <!-- 金额汇总 -->
      <el-card shadow="never">
        <template #header>
          <span class="font-bold">金额汇总</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="orderData.costFilled ? 12 : 24">
            <el-descriptions :column="2" border title="销售信息">
              <el-descriptions-item label="商品总数量">{{ orderData.totalQuantity }}</el-descriptions-item>
              <el-descriptions-item label="商品总金额">
                <span class="text-red-500 font-bold">{{ formatNumber(orderData.totalAmount) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="折扣金额">{{ formatNumber(orderData.discountAmount) }}</el-descriptions-item>
              <el-descriptions-item label="应付金额">
                <span class="text-red-500 text-lg font-bold">{{ formatNumber(orderData.payableAmount) }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col v-if="orderData.costFilled" :span="12">
            <el-descriptions :column="2" border title="成本利润">
              <el-descriptions-item label="采购总成本">
                <span class="text-blue-500 font-bold">{{ formatNumber(orderData.totalPurchaseAmount) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="总毛利">
                <span :class="['font-bold', orderData.totalGrossProfit >= 0 ? 'text-green-500' : 'text-red-500']">
                  {{ formatNumber(orderData.totalGrossProfit) }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="总税额">{{ formatNumber(orderData.totalTaxAmount) }}</el-descriptions-item>
              <el-descriptions-item label="总净利">
                <span :class="['text-lg font-bold', orderData.totalNetProfit >= 0 ? 'text-green-500' : 'text-red-500']">
                  {{ formatNumber(orderData.totalNetProfit) }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="成本填充人">{{ orderData.costFilledByName }}</el-descriptions-item>
              <el-descriptions-item label="填充时间">{{ formatDate(orderData.costFilledTime) }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { OrderApi, OrderVO, OrderStatus } from '@/api/erp/order'
import { formatDate } from '@/utils/formatTime'
import { formatNumber } from '@/utils'

// 安全的日期格式化，1970年显示为'-'
const safeFormatDate = (date: any) => {
  if (!date) return '-'
  const d = new Date(date)
  if (d.getFullYear() <= 1971) return '-'
  return formatDate(date)
}

defineOptions({ name: 'OrderDetail' })

const dialogVisible = ref(false)
const loading = ref(false)
const orderData = ref<OrderVO>({} as OrderVO)

/** 获取状态类型 */
const getStatusType = (status: number | undefined) => {
  switch (status) {
    case OrderStatus.PENDING_REVIEW: return 'warning'
    case OrderStatus.PENDING_COST: return 'primary'
    case OrderStatus.COMPLETED: return 'success'
    case OrderStatus.CANCELLED: return 'info'
    default: return 'info'
  }
}

/** 获取状态标签 */
const getStatusLabel = (status: number | undefined) => {
  switch (status) {
    case OrderStatus.PENDING_REVIEW: return '待审核'
    case OrderStatus.PENDING_COST: return '待填充成本'
    case OrderStatus.COMPLETED: return '已完成'
    case OrderStatus.CANCELLED: return '已取消'
    default: return '未知'
  }
}

/** 打开弹窗 */
const open = async (id: number) => {
  dialogVisible.value = true
  loading.value = true
  try {
    orderData.value = await OrderApi.getOrder(id)
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>
