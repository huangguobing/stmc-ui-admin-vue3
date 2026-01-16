<template>
  <ContentWrap>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-bold">销售开单</span>
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
            <el-form-item label="交货日期" prop="deliveryDate">
              <el-date-picker
                v-model="formData.deliveryDate"
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
        </el-row>

        <el-divider content-position="left">商品明细</el-divider>

        <!-- 商品列表 -->
        <el-table :data="formData.items" border style="width: 100%">
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="商品名称" prop="productName" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.productName" placeholder="请输入商品名称" />
            </template>
          </el-table-column>
          <el-table-column label="规格" prop="spec" width="120">
            <template #default="{ row }">
              <el-input v-model="row.spec" placeholder="规格" />
            </template>
          </el-table-column>
          <el-table-column label="单位" prop="unit" width="80">
            <template #default="{ row }">
              <el-input v-model="row.unit" placeholder="单位" />
            </template>
          </el-table-column>
          <el-table-column label="数量" prop="quantity" width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantity"
                :min="0"
                :precision="2"
                controls-position="right"
                @change="calculateAmount(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="单价" prop="price" width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.price"
                :min="0"
                :precision="2"
                controls-position="right"
                @change="calculateAmount(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="金额" prop="amount" width="120" align="right">
            <template #default="{ row }">
              {{ (row.amount || 0).toFixed(2) }}
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
              <div class="mb-10px">
                <span class="text-gray-500">商品总金额：</span>
                <span class="text-lg font-bold text-red-500">¥{{ totalAmount.toFixed(2) }}</span>
              </div>
              <div class="mb-10px">
                <span class="text-gray-500">折扣金额：</span>
                <el-input-number
                  v-model="formData.discountAmount"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                  size="small"
                />
              </div>
              <div>
                <span class="text-gray-500">应付金额：</span>
                <span class="text-xl font-bold text-red-500">¥{{ payableAmount.toFixed(2) }}</span>
              </div>
            </div>
          </el-col>
        </el-row>

        <div class="mt-20px text-center">
          <el-button type="primary" size="large" @click="submitForm">
            <Icon icon="ep:check" class="mr-5px" /> 提交订单
          </el-button>
          <el-button size="large" @click="resetForm">
            <Icon icon="ep:refresh" class="mr-5px" /> 重置
          </el-button>
        </div>
      </el-form>
    </el-card>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { CustomerApi } from '@/api/erp/customer'
import * as OrderApi from '@/api/erp/order'

defineOptions({ name: 'ErpOrderCreate' })

const message = useMessage()
const router = useRouter()

const formLoading = ref(false)
const customerList = ref<any[]>([])

const formData = ref({
  customerId: undefined as number | undefined,
  contact: '',
  mobile: '',
  address: '',
  orderDate: '',
  deliveryDate: '',
  remark: '',
  discountAmount: 0,
  items: [] as any[]
})

const formRules = reactive({
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  orderDate: [{ required: true, message: '请选择订单日期', trigger: 'change' }]
})

const formRef = ref()

/** 计算总数量 */
const totalQuantity = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

/** 计算总金额 */
const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.amount || 0), 0)
})

/** 计算应付金额 */
const payableAmount = computed(() => {
  return totalAmount.value - (formData.value.discountAmount || 0)
})

/** 计算行金额 */
const calculateAmount = (row: any) => {
  row.amount = (row.quantity || 0) * (row.price || 0)
}

/** 添加商品行 */
const addItem = () => {
  formData.value.items.push({
    productName: '',
    spec: '',
    unit: '个',
    quantity: 1,
    price: 0,
    amount: 0
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

  formLoading.value = true
  try {
    const data = {
      ...formData.value,
      orderType: 1, // 销售订单
      totalQuantity: totalQuantity.value,
      totalAmount: totalAmount.value,
      payableAmount: payableAmount.value
    }
    await OrderApi.createOrder(data)
    message.success('订单创建成功')
    // 跳转到订单列表
    router.push('/order/list')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    customerId: undefined,
    contact: '',
    mobile: '',
    address: '',
    orderDate: '',
    deliveryDate: '',
    remark: '',
    discountAmount: 0,
    items: []
  }
  formRef.value?.resetFields()
}

/** 初始化 */
onMounted(async () => {
  // 获取客户列表（启用状态）
  customerList.value = await CustomerApi.getCustomerSimpleList()

  // 默认添加一行商品
  addItem()

  // 默认订单日期为今天
  formData.value.orderDate = new Date().toISOString().split('T')[0]
})
</script>
