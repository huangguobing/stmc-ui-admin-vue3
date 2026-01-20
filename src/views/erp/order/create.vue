<template>
  <ContentWrap>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-bold">{{ isUpdate ? '编辑订单' : '销售开单' }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客户" prop="customerId">
              <el-select
                v-model="formData.customerId"
                placeholder="请选择客户"
                filterable
                class="!w-full"
                @change="handleCustomerChange"
              >
                <el-option
                  v-for="item in customerList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="formData.contact" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话" prop="mobile">
              <el-input v-model="formData.mobile" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="订单日期" prop="orderDate">
              <el-date-picker
                v-model="formData.orderDate"
                type="date"
                placeholder="选择日期"
                class="!w-full"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="收货地址" prop="address">
              <el-input v-model="formData.address" placeholder="请输入收货地址" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="付款状态" prop="paymentStatus">
              <el-radio-group v-model="formData.paymentStatus">
                <el-radio :value="0">未付款</el-radio>
                <el-radio :value="1">已付款</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">商品明细</el-divider>

        <!-- 商品列表 -->
        <el-table :data="formData.items" border style="width: 100%">
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="商品名称" prop="productName" width="200">
            <template #default="{ row }">
              <el-input v-model="row.productName" placeholder="请输入商品名称" />
            </template>
          </el-table-column>
          <el-table-column label="规格" prop="spec" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.spec" placeholder="" />
            </template>
          </el-table-column>
          <el-table-column label="单位" prop="saleUnit" width="150">
            <template #default="{ row }">
              <el-input v-model="row.saleUnit" placeholder="单位" />
            </template>
          </el-table-column>
          <el-table-column label="数量" prop="saleQuantity" width="150">
            <template #default="{ row }">
              <el-input-number
                v-model="row.saleQuantity"
                :min="0"
                controls-position="right"
                class="!w-full"
                @change="calculateAmount(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="单价" prop="salePrice" width="150">
            <template #default="{ row }">
              <el-input-number
                v-model="row.salePrice"
                :min="0"
                controls-position="right"
                class="!w-full"
                @change="calculateAmount(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="金额" prop="saleAmount" width="150">
            <template #default="{ row }">
              <el-input-number
                v-model="row.saleAmount"
                :min="0"
                controls-position="right"
                class="!w-full"
              />
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="saleRemark" width="200">
            <template #default="{ row }">
              <el-input v-model="row.saleRemark" placeholder="" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link @click="removeItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-button class="mt-10px" type="primary" plain @click="addItem">
          <Icon icon="ep:plus" class="mr-5px" /> 添加商品
        </el-button>

        <el-row :gutter="20" class="mt-20px">
          <el-col :span="16">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <div class="text-right">
              <div class="mb-10px">
                <span class="text-gray-500">商品总数量：</span>
                <span class="text-lg font-bold">{{ totalQuantity }}</span>
              </div>
              <div>
                <span class="text-gray-500">商品总金额：</span>
                <span class="text-xl font-bold text-red-500">¥{{ formatPrice(totalAmount) }}</span>
              </div>
            </div>
          </el-col>
        </el-row>

        <div class="mt-20px text-center">
          <el-button type="primary" size="large" @click="submitForm">
            <Icon icon="ep:check" class="mr-5px" /> {{ isUpdate ? '保存修改' : '提交订单' }}
          </el-button>
          <el-button size="large" @click="handleCancel">
            <Icon icon="ep:close" class="mr-5px" /> 取消
          </el-button>
        </div>
      </el-form>
    </el-card>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { CustomerApi } from '@/api/erp/customer'
import { OrderApi } from '@/api/erp/order'

defineOptions({ name: 'ErpOrderCreate' })

const message = useMessage()
const router = useRouter()
const route = useRoute()

// 判断是否为编辑模式
const isUpdate = computed(() => !!route.params.id)
const orderId = computed(() => route.params.id)

const formLoading = ref(false)
const customerList = ref<any[]>([])

const formData = ref({
  id: undefined as number | undefined,
  customerId: undefined as number | undefined,
  contact: '',
  mobile: '',
  orderDate: '',
  paymentStatus: 0,
  address: '',
  remark: '',
  items: [] as any[]
})

const formRules = reactive({
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  orderDate: [{ required: true, message: '请选择订单日期', trigger: 'change' }]
})

const formRef = ref()

/** 计算总数量 */
const totalQuantity = computed(() => {
  return formData.value.items
    .filter((item) => item.productName)
    .reduce((sum, item) => sum + (item.saleQuantity || 0), 0)
})

/** 计算总金额 */
const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.saleAmount || 0), 0)
})

/** 限制最多3位小数（不补零） */
const roundToThreeDecimals = (value: number | undefined): number | undefined => {
  if (value === undefined || value === null) return value
  return Math.round(value * 1000) / 1000
}

/** 计算行金额 */
const calculateAmount = (row: any) => {
  // 限制数量最多3位小数
  row.saleQuantity = roundToThreeDecimals(row.saleQuantity)
  if (row.saleQuantity && row.salePrice) {
    row.saleAmount = parseFloat((row.saleQuantity * row.salePrice).toFixed(2))
  }
}

/** 添加商品行 */
const addItem = () => {
  formData.value.items.push({
    productName: '',
    spec: '',
    saleUnit: '',
    saleQuantity: undefined,
    salePrice: undefined,
    saleAmount: undefined,
    saleRemark: ''
  })
}

/** 删除商品行 */
const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

/** 客户变更 */
const handleCustomerChange = (customerId: number) => {
  const customer = customerList.value.find((item) => item.id === customerId)
  if (customer) {
    formData.value.contact = customer.contact || ''
    formData.value.mobile = customer.mobile || ''
    formData.value.address = customer.address || ''
  }
}

/** 提交表单 */
const submitForm = async () => {
  await formRef.value?.validate()

  if (formData.value.items.length === 0) {
    message.warning('请添加商品明细')
    return
  }

  // 验证商品数据
  for (let i = 0; i < formData.value.items.length; i++) {
    const item = formData.value.items[i]
    if (!item.saleAmount || item.saleAmount <= 0) {
      message.warning(`第${i + 1}行金额必须大于0`)
      return
    }
    if (item.salePrice !== undefined && item.salePrice < 0) {
      message.warning(`第${i + 1}行商品单价不能为负数`)
      return
    }
  }

  formLoading.value = true
  try {
    const data = {
      ...formData.value,
      orderType: 1, // 销售订单
      totalQuantity: totalQuantity.value,
      totalAmount: totalAmount.value,
      payableAmount: totalAmount.value,
      paidAmount: formData.value.paymentStatus === 1 ? totalAmount.value : 0,
      orderDate:
        formData.value.orderDate && formData.value.orderDate.length > 0
          ? formData.value.orderDate + ' 00:00:00'
          : new Date().toISOString().split('T')[0] + ' 00:00:00'
    }

    if (isUpdate.value) {
      await OrderApi.updateOrder(data)
      message.success('订单修改成功，等待审核')
    } else {
      await OrderApi.createOrder(data)
      message.success('订单创建成功，等待审核')
    }

    // 跳转到订单管理页
    router.push({
      path: '/order/manage',
      query: { t: Date.now() }
    })
  } finally {
    formLoading.value = false
  }
}

/** 取消 */
const handleCancel = () => {
  router.push('/order/manage')
}

/** 格式化价格 */
const formatPrice = (price: number) => {
  // 如果是整数，不显示小数点；否则保留两位小数
  return price % 1 === 0 ? price.toString() : price.toFixed(2)
}

/** 加载订单详情 */
const loadOrderDetail = async () => {
  if (!orderId.value) return

  formLoading.value = true
  try {
    const data = await OrderApi.getOrder(Number(orderId.value))
    // 根据已付金额和应付金额判断付款状态
    const paymentStatus = (data.paidAmount || 0) >= (data.payableAmount || 0) ? 1 : 0

    formData.value = {
      id: data.id,
      customerId: data.customerId,
      contact: data.contact || '',
      mobile: data.mobile || '',
      orderDate: data.orderDate ? data.orderDate.substring(0, 10) : '',
      paymentStatus: paymentStatus,
      address: data.address || '',
      remark: data.remark || '',
      items: data.items || []
    }
  } finally {
    formLoading.value = false
  }
}

/** 初始化客户列表 */
const loadCustomerList = async () => {
  customerList.value = await CustomerApi.getCustomerSimpleList()
}

/** 初始化 */
onMounted(async () => {
  await loadCustomerList()

  if (isUpdate.value) {
    // 编辑模式：加载订单详情
    await loadOrderDetail()
  } else {
    // 新建模式：添加一行商品，设置默认日期
    addItem()
    formData.value.orderDate = new Date().toISOString().split('T')[0]
    formData.value.deliveryDate = new Date().toISOString().split('T')[0]
  }
})

// 激活时刷新客户列表
onActivated(async () => {
  await loadCustomerList()
})
</script>
