<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="订单类型" prop="orderType">
            <el-select v-model="formData.orderType" placeholder="请选择订单类型" class="!w-1/1">
              <el-option label="销售订单" :value="1" />
              <el-option label="采购订单" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 销售订单显示客户选择 -->
          <el-form-item v-if="formData.orderType === 1" label="客户" prop="customerId">
            <el-select
              v-model="formData.customerId"
              placeholder="请选择客户"
              filterable
              class="!w-1/1"
            >
              <el-option
                v-for="item in customerList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <!-- 采购订单显示供应商选择 -->
          <el-form-item v-else label="供应商" prop="supplierId">
            <el-select
              v-model="formData.supplierId"
              placeholder="请选择供应商"
              filterable
              class="!w-1/1"
            >
              <el-option
                v-for="item in supplierList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="订单日期" prop="orderDate">
            <el-date-picker
              v-model="formData.orderDate"
              type="date"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择订单日期"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="交货日期" prop="deliveryDate">
            <el-date-picker
              v-model="formData.deliveryDate"
              type="date"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择交货日期"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="商品数量" prop="totalQuantity">
            <el-input-number
              v-model="formData.totalQuantity"
              :min="0"
              :precision="2"
              placeholder="请输入"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品金额" prop="totalAmount">
            <el-input-number
              v-model="formData.totalAmount"
              :min="0"
              :precision="2"
              placeholder="请输入"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="折扣金额" prop="discountAmount">
            <el-input-number
              v-model="formData.discountAmount"
              :min="0"
              :precision="2"
              placeholder="请输入"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="联系人" prop="contact">
            <el-input v-model="formData.contact" placeholder="请输入联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="mobile">
            <el-input v-model="formData.mobile" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="收货地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入收货地址" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { OrderApi, OrderVO } from '@/api/erp/order'
import { CustomerApi } from '@/api/erp/customer'
import { SupplierApi } from '@/api/erp/supplier'
import { FormRules } from 'element-plus'

defineOptions({ name: 'ErpOrderForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref<OrderVO>({
  orderType: 1,
  customerId: undefined,
  supplierId: undefined,
  orderDate: undefined,
  deliveryDate: undefined,
  totalQuantity: 0,
  totalAmount: 0,
  discountAmount: 0,
  contact: '',
  mobile: '',
  address: '',
  remark: ''
})
const formRules = reactive<FormRules>({
  orderType: [{ required: true, message: '订单类型不能为空', trigger: 'change' }],
  customerId: [{ required: true, message: '客户不能为空', trigger: 'change' }],
  supplierId: [{ required: true, message: '供应商不能为空', trigger: 'change' }]
})
const formRef = ref()
const customerList = ref<any[]>([])
const supplierList = ref<any[]>([])

// 监听订单类型变化，清空不相关的选择
watch(() => formData.value.orderType, (newVal) => {
  if (newVal === 1) {
    formData.value.supplierId = undefined
  } else {
    formData.value.customerId = undefined
  }
})

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 加载客户和供应商列表
  try {
    customerList.value = await CustomerApi.getCustomerSimpleList()
  } catch (e) {
    customerList.value = []
  }
  try {
    supplierList.value = await SupplierApi.getSupplierSimpleList()
  } catch (e) {
    supplierList.value = []
  }
  if (id) {
    formLoading.value = true
    try {
      formData.value = await OrderApi.getOrder(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await OrderApi.createOrder(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await OrderApi.updateOrder(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    orderType: 1,
    customerId: undefined,
    supplierId: undefined,
    orderDate: undefined,
    deliveryDate: undefined,
    totalQuantity: 0,
    totalAmount: 0,
    discountAmount: 0,
    contact: '',
    mobile: '',
    address: '',
    remark: ''
  }
  formRef.value?.resetFields()
}
</script>
