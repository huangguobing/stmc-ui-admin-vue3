<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="付款类型" prop="paymentType">
            <el-select v-model="formData.paymentType" placeholder="请选择付款类型" class="!w-1/1">
              <el-option label="采购付款" :value="1" />
              <el-option label="费用付款" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商" prop="supplierId">
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
          <el-form-item label="关联订单" prop="orderId">
            <el-select
              v-model="formData.orderId"
              placeholder="请选择订单（可选）"
              filterable
              clearable
              class="!w-1/1"
            >
              <el-option
                v-for="item in orderList"
                :key="item.id"
                :label="item.orderNo"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="付款金额" prop="amount">
            <el-input-number
              v-model="formData.amount"
              :min="0"
              :precision="2"
              placeholder="请输入付款金额"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="付款方式" prop="paymentMethod">
            <el-select v-model="formData.paymentMethod" placeholder="请选择付款方式" class="!w-1/1">
              <el-option label="银行转账" :value="1" />
              <el-option label="现金" :value="2" />
              <el-option label="支票" :value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="付款账户" prop="paymentAccount">
            <el-input v-model="formData.paymentAccount" placeholder="请输入付款账户" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="付款日期" prop="paymentDate">
            <el-date-picker
              v-model="formData.paymentDate"
              type="date"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择付款日期"
              class="!w-1/1"
            />
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
import { PaymentApi, PaymentVO } from '@/api/erp/payment'
import { SupplierApi } from '@/api/erp/supplier'
import { OrderApi } from '@/api/erp/order'
import { FormRules } from 'element-plus'

defineOptions({ name: 'ErpPaymentForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref<PaymentVO>({
  paymentType: 1,
  supplierId: undefined as any,
  orderId: undefined,
  amount: 0,
  paymentMethod: 1,
  paymentAccount: '',
  paymentDate: undefined,
  remark: ''
})
const formRules = reactive<FormRules>({
  paymentType: [{ required: true, message: '付款类型不能为空', trigger: 'change' }],
  supplierId: [{ required: true, message: '供应商不能为空', trigger: 'change' }],
  amount: [{ required: true, message: '付款金额不能为空', trigger: 'blur' }]
})
const formRef = ref()
const supplierList = ref<any[]>([])
const orderList = ref<any[]>([])

// 监听供应商变化，加载该供应商的采购订单列表
watch(() => formData.value.supplierId, async (newVal) => {
  if (newVal) {
    try {
      orderList.value = await OrderApi.getOrderSimpleListBySupplierId(newVal)
    } catch (e) {
      orderList.value = []
    }
  } else {
    orderList.value = []
  }
  // 清空订单选择
  formData.value.orderId = undefined
})

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 加载供应商列表
  try {
    supplierList.value = await SupplierApi.getSupplierSimpleList()
  } catch (e) {
    supplierList.value = []
  }
  if (id) {
    formLoading.value = true
    try {
      formData.value = await PaymentApi.getPayment(id)
      // 如果有供应商，加载该供应商的订单列表
      if (formData.value.supplierId) {
        try {
          orderList.value = await OrderApi.getOrderSimpleListBySupplierId(formData.value.supplierId)
        } catch (e) {
          orderList.value = []
        }
      }
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
      await PaymentApi.createPayment(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await PaymentApi.updatePayment(formData.value)
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
    paymentType: 1,
    supplierId: undefined as any,
    orderId: undefined,
    amount: 0,
    paymentMethod: 1,
    paymentAccount: '',
    paymentDate: undefined,
    remark: ''
  }
  orderList.value = []
  formRef.value?.resetFields()
}
</script>
