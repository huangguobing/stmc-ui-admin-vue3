<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="1400px">
    <el-form ref="formRef" v-loading="formLoading" label-width="100px">
      <!-- 订单基本信息 -->
      <el-card class="mb-20px" shadow="never">
        <template #header>
          <span class="font-bold">订单信息</span>
        </template>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="订单号">{{ orderData.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ orderData.customerName }}</el-descriptions-item>
          <el-descriptions-item label="业务员">{{ orderData.salesmanName }}</el-descriptions-item>
          <el-descriptions-item label="订单日期">{{
            formatDate(orderData.orderDate)
          }}</el-descriptions-item>
          <el-descriptions-item label="商品总数量">{{ totalQuantity }}</el-descriptions-item>
          <el-descriptions-item label="销售总金额">
            <span class="text-red-500 font-bold">{{ formatNumber(totalSaleAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="折扣金额">{{
            formatNumber(orderData.discountAmount)
          }}</el-descriptions-item>
          <el-descriptions-item label="应收金额">
            <span class="text-red-500 font-bold">{{ formatNumber(payableAmount) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 商品明细成本填充 -->
      <el-card shadow="never">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-bold"
              >商品明细 - {{ isEditMode ? '编辑商品与成本' : '填充采购成本' }}</span
            >
            <el-button v-if="isEditMode" type="primary" plain size="small" @click="addItem">
              <Icon icon="ep:plus" class="mr-5px" /> 添加商品
            </el-button>
          </div>
        </template>
        <el-table :data="costItems" border style="width: 100%">
          <!-- 销售信息 -->
          <el-table-column label="商品名称" width="140">
            <template #default="{ row }">
              <el-input
                v-if="isEditMode"
                v-model="row.productName"
                placeholder="商品名称"
                size="small"
              />
              <span v-else>{{ row.productName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="规格" width="80">
            <template #default="{ row }">
              <el-input v-if="isEditMode" v-model="row.spec" placeholder="" size="small" />
              <span v-else>{{ row.spec }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单位" width="70">
            <template #default="{ row }">
              <el-input v-if="isEditMode" v-model="row.saleUnit" placeholder="" size="small" />
              <span v-else>{{ row.saleUnit }}</span>
            </template>
          </el-table-column>
          <el-table-column label="销售数量" width="100">
            <template #default="{ row }">
              <el-input-number
                v-if="isEditMode"
                v-model="row.saleQuantity"
                :min="0"
                controls-position="right"
                size="small"
                class="!w-full"
                @change="calculateSaleAmount(row)"
              />
              <span v-else>{{ row.saleQuantity }}</span>
            </template>
          </el-table-column>
          <el-table-column label="销售单价" width="100">
            <template #default="{ row }">
              <el-input-number
                v-if="isEditMode"
                v-model="row.salePrice"
                :min="0"
                controls-position="right"
                size="small"
                class="!w-full"
                @change="calculateSaleAmount(row)"
              />
              <span v-else>{{ row.salePrice }}</span>
            </template>
          </el-table-column>
          <el-table-column label="销售金额" width="100">
            <template #default="{ row }">
              <el-input-number
                v-if="isEditMode"
                v-model="row.saleAmount"
                :min="0"
                controls-position="right"
                size="small"
                class="!w-full"
                @change="calculateProfit(row)"
              />
              <span v-else class="text-red-500">{{ formatNumber(row.saleAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="销售备注" width="80">
            <template #default="{ row }">
              <el-input v-if="isEditMode" v-model="row.saleRemark" placeholder="" size="small" />
              <span v-else>{{ row.saleRemark }}</span>
            </template>
          </el-table-column>

          <!-- 采购成本信息（可编辑） -->
          <el-table-column label="进货单位" width="80">
            <template #default="{ row }">
              <el-input v-model="row.purchaseUnit" placeholder="" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="进货数量" width="100">
            <template #default="{ row }">
              <el-input-number
                v-model="row.purchaseQuantity"
                :min="0"
                controls-position="right"
                size="small"
                class="!w-full"
                @change="calculateProfit(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="采购单价" width="100">
            <template #default="{ row }">
              <el-input-number
                v-model="row.purchasePrice"
                :min="0"
                controls-position="right"
                size="small"
                class="!w-full"
                @change="calculateProfit(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="采购金额" width="100">
            <template #default="{ row }">
              <el-input-number
                v-model="row.purchaseAmount"
                :min="0"
                controls-position="right"
                size="small"
                class="!w-full"
                @change="calculateProfitFromAmount(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="供应商" width="140">
            <template #default="{ row }">
              <el-select
                v-model="row.supplierId"
                placeholder="选择供应商"
                filterable
                clearable
                size="small"
                class="!w-full"
                @change="handleSupplierChange(row)"
              >
                <el-option
                  v-for="item in supplierList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="付款日期" width="130">
            <template #default="{ row }">
              <el-date-picker
                v-model="row.paymentDate"
                type="date"
                placeholder="选择日期"
                size="small"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                @change="handlePaymentDateChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="已付" width="50" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.isPaid" @change="handleIsPaidChange(row)" />
            </template>
          </el-table-column>
          <el-table-column label="采购备注" width="100">
            <template #default="{ row }">
              <el-input v-model="row.purchaseRemark" placeholder="" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="毛利" width="80" align="right">
            <template #default="{ row }">
              <span :class="row.grossProfit >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ formatNumber(row.grossProfit) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="税率%" width="80">
            <template #default="{ row }">
              <el-input-number
                v-model="row.taxRate"
                :min="0"
                :max="100"
                controls-position="right"
                size="small"
                class="!w-full"
                @change="calculateProfit(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="税额" width="70" align="right">
            <template #default="{ row }">
              {{ formatNumber(row.taxAmount) }}
            </template>
          </el-table-column>
          <el-table-column label="净利" width="80" align="right">
            <template #default="{ row }">
              <span :class="row.netProfit >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ formatNumber(row.netProfit) }}
              </span>
            </template>
          </el-table-column>
          <!-- 操作列 - 仅编辑模式显示 -->
          <el-table-column v-if="isEditMode" label="操作" width="60" align="center" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="removeItem($index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 汇总信息 -->
        <div class="mt-20px text-right">
          <el-row :gutter="40" justify="end">
            <el-col :span="4">
              <div class="mb-10px">
                <span class="text-gray-500">销售总额：</span>
                <span class="text-lg font-bold text-red-500">{{
                  formatNumber(totalSaleAmount)
                }}</span>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="mb-10px">
                <span class="text-gray-500">采购成本：</span>
                <span class="text-lg font-bold text-blue-500">{{
                  formatNumber(totalPurchaseAmount)
                }}</span>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="mb-10px">
                <span class="text-gray-500">总毛利：</span>
                <span
                  :class="[
                    'text-lg font-bold',
                    totalGrossProfit >= 0 ? 'text-green-500' : 'text-red-500'
                  ]"
                >
                  {{ formatNumber(totalGrossProfit) }}
                </span>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="mb-10px">
                <span class="text-gray-500">总税额：</span>
                <span class="text-lg font-bold">{{ formatNumber(totalTaxAmount) }}</span>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="mb-10px">
                <span class="text-gray-500">总净利：</span>
                <span
                  :class="[
                    'text-lg font-bold',
                    totalNetProfit >= 0 ? 'text-green-500' : 'text-red-500'
                  ]"
                >
                  {{ formatNumber(totalNetProfit) }}
                </span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="formLoading" @click="submitForm"> 确认提交 </el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { OrderApi, OrderVO, OrderItemVO } from '@/api/erp/order'
import { SupplierApi } from '@/api/erp/supplier'
import { formatDate } from '@/utils/formatTime'
import { formatNumber } from '@/utils'

defineOptions({ name: 'OrderCostForm' })

const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const formRef = ref()
const isEditMode = ref(false)

const orderData = ref<OrderVO>({} as OrderVO)
const costItems = ref<any[]>([])
const supplierList = ref<any[]>([])

/** 动态标题 */
const dialogTitle = computed(() => {
  return isEditMode.value ? '编辑订单' : '填充采购成本'
})

/** 计算总销售数量 */
const totalQuantity = computed(() => {
  return costItems.value.reduce((sum, item) => sum + (item.saleQuantity || 0), 0)
})

/** 计算总销售金额 */
const totalSaleAmount = computed(() => {
  return costItems.value.reduce((sum, item) => sum + (item.saleAmount || 0), 0)
})

/** 计算应收金额 */
const payableAmount = computed(() => {
  const discount = orderData.value.discountAmount || 0
  const shipping = orderData.value.shippingFee || 0
  return totalSaleAmount.value + shipping - discount
})

/** 计算汇总 */
const totalPurchaseAmount = computed(() => {
  return costItems.value.reduce((sum, item) => sum + (item.purchaseAmount || 0), 0)
})

const totalGrossProfit = computed(() => {
  return costItems.value.reduce((sum, item) => sum + (item.grossProfit || 0), 0)
})

const totalTaxAmount = computed(() => {
  return costItems.value.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
})

const totalNetProfit = computed(() => {
  return costItems.value.reduce((sum, item) => sum + (item.netProfit || 0), 0)
})

/** 限制最多3位小数（不补零） */
const roundToThreeDecimals = (value: number | undefined): number | undefined => {
  if (value === undefined || value === null) return value
  return Math.round(value * 1000) / 1000
}

/** 计算销售金额（数量×单价） */
const calculateSaleAmount = (row: any) => {
  // 限制销售数量最多3位小数
  row.saleQuantity = roundToThreeDecimals(row.saleQuantity)
  if (row.saleQuantity != null && row.salePrice != null) {
    row.saleAmount = parseFloat((row.saleQuantity * row.salePrice).toFixed(2))
  }
  calculateProfit(row)
}

/** 计算单行利润（从数量×单价计算采购金额） */
const calculateProfit = (row: any) => {
  // 限制进货数量最多3位小数
  row.purchaseQuantity = roundToThreeDecimals(row.purchaseQuantity)
  // 只有当数量和单价都有值时才自动计算采购金额
  if (row.purchaseQuantity != null && row.purchasePrice != null) {
    row.purchaseAmount = row.purchaseQuantity * row.purchasePrice
  }
  // 计算毛利、税额、净利
  calculateProfitFromAmount(row)
}

/** 计算单行利润（从采购金额计算，用于直接输入采购金额的场景） */
const calculateProfitFromAmount = (row: any) => {
  // 计算毛利
  row.grossProfit = (row.saleAmount || 0) - (row.purchaseAmount || 0)
  // 根据税率计算税额（税额 = 采购金额 * 税率%）
  row.taxAmount = ((row.purchaseAmount || 0) * (row.taxRate || 0)) / 100
  // 计算净利
  row.netProfit = (row.grossProfit || 0) - (row.taxAmount || 0)
}

/** 添加商品行 */
const addItem = () => {
  costItems.value.push({
    itemId: undefined, // 新增的商品没有ID
    productName: '',
    spec: '',
    saleUnit: '',
    saleQuantity: undefined,
    salePrice: undefined,
    saleAmount: undefined,
    saleRemark: '',
    purchaseUnit: '',
    purchaseQuantity: undefined,
    purchasePrice: undefined,
    purchaseAmount: undefined,  // 改为 undefined（原来是0），避免毛利显示不正确
    purchaseRemark: '',
    supplierId: undefined,
    taxRate: undefined,
    taxAmount: undefined,       // 改为 undefined（原来是0）
    grossProfit: undefined,     // 改为 undefined（原来是0）
    netProfit: undefined,       // 改为 undefined（原来是0）
    paymentDate: undefined,
    isPaid: false
  })
}

/** 删除商品行 */
const removeItem = (index: number) => {
  if (costItems.value.length <= 1) {
    message.warning('至少保留一个商品')
    return
  }
  costItems.value.splice(index, 1)
}

/** 处理供应商变更 - 自动继承同供应商的付款日期和状态 */
const handleSupplierChange = (row: any) => {
  if (!row.supplierId) {
    return
  }
  // 查找同供应商的其他商品
  const sameSupplierItem = costItems.value.find(
    (item) => item.supplierId === row.supplierId && item.itemId !== row.itemId
  )
  if (sameSupplierItem) {
    // 继承付款日期和状态
    row.paymentDate = sameSupplierItem.paymentDate
    row.isPaid = sameSupplierItem.isPaid
  }
}

/** 处理付款日期变更 - 同步到同供应商的其他商品 */
const handlePaymentDateChange = (row: any) => {
  if (!row.supplierId) {
    return
  }
  // 同步到同供应商的所有商品
  costItems.value.forEach((item) => {
    if (item.supplierId === row.supplierId) {
      item.paymentDate = row.paymentDate
    }
  })
}

/** 处理付款状态变更 - 同步到同供应商的其他商品 */
const handleIsPaidChange = (row: any) => {
  if (!row.supplierId) {
    return
  }
  // 同步到同供应商的所有商品
  costItems.value.forEach((item) => {
    if (item.supplierId === row.supplierId) {
      item.isPaid = row.isPaid
    }
  })
}

/** 打开弹窗 */
const open = async (orderId: number, mode: 'fill' | 'edit' = 'fill') => {
  dialogVisible.value = true
  formLoading.value = true
  isEditMode.value = mode === 'edit'

  try {
    // 获取供应商列表
    supplierList.value = await SupplierApi.getSupplierSimpleList()

    // 获取订单详情
    const data = await OrderApi.getOrder(orderId)
    orderData.value = data

    // 初始化成本填充数据
    costItems.value = (data.items || []).map((item: OrderItemVO) => {
      const purchaseAmount = item.purchaseAmount || 0
      const taxAmount = item.taxAmount || 0
      // 根据已有的税额反算税率（如果有采购金额的话）
      const taxRate = purchaseAmount > 0 ? (taxAmount / purchaseAmount) * 100 : undefined
      // 处理付款日期：支持字符串和数组两种格式
      let paymentDate = item.paymentDate || undefined
      if (paymentDate) {
        if (Array.isArray(paymentDate)) {
          // 数组格式 [2026, 1, 15] -> "2026-01-15"
          const [year, month, day] = paymentDate
          paymentDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        } else if (typeof paymentDate === 'string' && paymentDate.length > 10) {
          // 字符串格式 "2026-01-15 10:30:00" -> "2026-01-15"
          paymentDate = paymentDate.substring(0, 10)
        }
      }
      return {
        ...item,
        itemId: item.id,
        purchaseUnit: item.purchaseUnit || item.saleUnit,
        purchaseQuantity: item.purchaseQuantity ?? item.saleQuantity,
        purchasePrice: item.purchasePrice || undefined,
        purchaseAmount: purchaseAmount,
        purchaseRemark: item.purchaseRemark || '',
        supplierId: item.supplierId,
        taxRate: taxRate,
        taxAmount: taxAmount,
        grossProfit: item.grossProfit || 0,
        netProfit: item.netProfit || 0,
        paymentDate: paymentDate,
        isPaid: item.isPaid || false
      }
    })

    // 重新计算利润
    costItems.value.forEach(calculateProfit)
  } finally {
    formLoading.value = false
  }
}

/** 提交表单 */
const submitForm = async () => {
  // 前端一致性校验：同供应商的付款日期和状态必须一致
  const validationError = validateSupplierPaymentConsistency()
  if (validationError) {
    message.warning(validationError)
    return
  }

  // 编辑模式下，验证商品数据
  if (isEditMode.value) {
    if (costItems.value.length === 0) {
      message.warning('请添加商品明细')
      return
    }
    for (let i = 0; i < costItems.value.length; i++) {
      const item = costItems.value[i]
      if (!item.productName) {
        message.warning(`第${i + 1}行商品名称不能为空`)
        return
      }
      if (!item.saleAmount || item.saleAmount <= 0) {
        message.warning(`第${i + 1}行销售金额必须大于0`)
        return
      }
    }
  }

  formLoading.value = true
  try {
    if (isEditMode.value) {
      // 编辑模式：调用editOrderItems接口，传递完整的商品信息
      const editData = {
        id: orderData.value.id!,
        orderType: orderData.value.orderType,
        shippingFee: orderData.value.shippingFee,
        discountAmount: orderData.value.discountAmount,
        items: costItems.value.map((item) => ({
          id: item.itemId, // 保留原ID用于更新
          productName: item.productName,
          spec: item.spec,
          saleUnit: item.saleUnit,
          saleQuantity: item.saleQuantity,
          salePrice: item.salePrice,
          saleAmount: item.saleAmount,
          saleRemark: item.saleRemark,
          purchaseUnit: item.purchaseUnit,
          purchaseQuantity: item.purchaseQuantity,
          purchasePrice: item.purchasePrice,
          purchaseAmount: item.purchaseAmount,
          purchaseRemark: item.purchaseRemark,
          supplierId: item.supplierId,
          taxAmount: item.taxAmount,
          paymentDate: item.paymentDate,
          isPaid: item.isPaid
        }))
      }
      await OrderApi.editOrderItems(editData)
      message.success('订单编辑成功')
    } else {
      // 填充模式：调用fillOrderCost接口
      const fillData = {
        orderId: orderData.value.id!,
        items: costItems.value.map((item) => ({
          itemId: item.itemId,
          purchaseUnit: item.purchaseUnit,
          purchaseQuantity: item.purchaseQuantity,
          purchasePrice: item.purchasePrice,
          purchaseAmount: item.purchaseAmount,
          purchaseRemark: item.purchaseRemark,
          supplierId: item.supplierId,
          taxAmount: item.taxAmount,
          paymentDate: item.paymentDate,
          isPaid: item.isPaid
        }))
      }
      await OrderApi.fillOrderCost(fillData)
      message.success('成本填充成功')
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 校验同供应商的付款日期和状态一致性 */
const validateSupplierPaymentConsistency = (): string | null => {
  // 按供应商分组
  const supplierItemsMap = new Map<number, any[]>()
  costItems.value.forEach((item) => {
    if (item.supplierId) {
      const items = supplierItemsMap.get(item.supplierId) || []
      items.push(item)
      supplierItemsMap.set(item.supplierId, items)
    }
  })

  // 检查每个供应商组内的一致性
  for (const [supplierId, items] of supplierItemsMap) {
    if (items.length <= 1) {
      continue
    }

    const basePaymentDate = items[0].paymentDate
    const baseIsPaid = items[0].isPaid

    for (let i = 1; i < items.length; i++) {
      const item = items[i]
      const dateMatch = basePaymentDate === item.paymentDate
      const paidMatch = baseIsPaid === item.isPaid

      if (!dateMatch || !paidMatch) {
        const supplierName =
          supplierList.value.find((s) => s.id === supplierId)?.name || '未知供应商'
        return `供应商"${supplierName}"的商品付款日期和付款状态必须一致`
      }
    }
  }

  return null
}

defineExpose({ open })

const emit = defineEmits(['success'])
</script>
