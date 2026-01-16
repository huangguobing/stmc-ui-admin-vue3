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
          <el-form-item label="收款账户" prop="paymentAccount">
            <div class="w-full">
              <!-- 如果供应商有银行账户，显示快捷选择 -->
              <div v-if="selectedSupplierBank" class="mb-2">
                <el-radio-group v-model="useSupplierBank" @change="onBankSourceChange" size="small">
                  <el-radio :value="true">使用供应商账户</el-radio>
                  <el-radio :value="false">手动输入</el-radio>
                </el-radio-group>
              </div>
              <!-- 显示供应商银行账户信息 -->
              <div v-if="useSupplierBank && selectedSupplierBank" class="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                {{ selectedSupplierBank }}
              </div>
              <!-- 手动输入 -->
              <el-input
                v-else
                v-model="formData.paymentAccount"
                placeholder="请输入收款账户"
              />
            </div>
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
      <!-- 付款计划预览区域 -->
      <el-row v-if="paymentPlanPreview.length > 0 && formType === 'create'">
        <el-col :span="24">
          <el-form-item label="付款计划">
            <div class="w-full">
              <div class="text-xs text-gray-400 mb-2">根据供应商账期配置，将自动生成以下分期付款计划</div>
              <el-table :data="paymentPlanPreview" size="small" border>
                <el-table-column label="期数" prop="stage" width="70" align="center">
                  <template #default="{ row }">第{{ row.stage }}期</template>
                </el-table-column>
                <el-table-column label="比例" prop="percentage" width="80" align="center">
                  <template #default="{ row }">{{ row.percentage }}%</template>
                </el-table-column>
                <el-table-column label="金额" prop="planAmount" width="120" align="right">
                  <template #default="{ row }">{{ formatNumber(row.planAmount) }}</template>
                </el-table-column>
                <el-table-column label="计划日期" prop="planDate" width="120" align="center" />
                <el-table-column label="当期付款" width="120" align="center">
                  <template #default="{ row }">
                    <el-checkbox
                      v-if="row.isToday"
                      v-model="row.isPaid"
                      @change="onPaidChange"
                    >已付款</el-checkbox>
                    <span v-else class="text-gray-400">-</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
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
import { PaymentPlanApi, PaymentPlanPreviewVO } from '@/api/erp/paymentPlan'
import { FormRules } from 'element-plus'
import { formatNumber } from '@/utils'

defineOptions({ name: 'ErpPaymentForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref<PaymentVO>({
  paymentType: 1, // 默认采购付款
  supplierId: undefined as any,
  amount: 0,
  paymentMethod: 1,
  paymentAccount: '',
  paymentDate: undefined,
  remark: ''
})
const formRules = reactive<FormRules>({
  supplierId: [{ required: true, message: '供应商不能为空', trigger: 'change' }],
  amount: [{ required: true, message: '付款金额不能为空', trigger: 'blur' }]
})
const formRef = ref()
const supplierList = ref<any[]>([])
const paymentPlanPreview = ref<PaymentPlanPreviewVO[]>([])

// 供应商银行账户相关
const useSupplierBank = ref(true)  // 是否使用供应商账户
const selectedSupplierBank = ref('')  // 当前选中供应商的银行账户信息

// 获取供应商银行账户信息
const getSupplierBankInfo = (supplierId: number) => {
  const supplier = supplierList.value.find(s => s.id === supplierId)
  if (supplier && supplier.bankName && supplier.bankAccount) {
    return `${supplier.bankName} ${supplier.bankAccount}`
  }
  return ''
}

// 切换银行账户来源
const onBankSourceChange = (useSupplier: boolean) => {
  if (useSupplier && selectedSupplierBank.value) {
    formData.value.paymentAccount = selectedSupplierBank.value
  } else {
    formData.value.paymentAccount = ''
  }
}

// 加载付款计划预览
const loadPaymentPlanPreview = async () => {
  if (!formData.value.supplierId || !formData.value.amount || formData.value.amount <= 0) {
    paymentPlanPreview.value = []
    return
  }
  try {
    // 提取日期部分（如果有）
    let paymentDate: string | undefined
    if (formData.value.paymentDate) {
      // 格式为 'YYYY-MM-DD HH:mm:ss'，只取日期部分
      paymentDate = formData.value.paymentDate.toString().substring(0, 10)
    }
    const result = await PaymentPlanApi.previewPaymentPlans(
      formData.value.supplierId,
      formData.value.amount,
      paymentDate
    )
    // 初始化 isPaid 字段
    paymentPlanPreview.value = (result || []).map((item: PaymentPlanPreviewVO) => ({
      ...item,
      isPaid: false
    }))
  } catch (e) {
    paymentPlanPreview.value = []
  }
}

// 当用户勾选/取消已付款时触发
const onPaidChange = () => {
  // 不需要做什么，isPaid 已经通过 v-model 绑定更新了
}

// 监听供应商变化，加载付款计划预览
watch(() => formData.value.supplierId, async (newVal) => {
  if (newVal) {
    // 获取供应商银行账户信息
    selectedSupplierBank.value = getSupplierBankInfo(newVal)
    if (selectedSupplierBank.value) {
      useSupplierBank.value = true
      formData.value.paymentAccount = selectedSupplierBank.value
    } else {
      useSupplierBank.value = false
      formData.value.paymentAccount = ''
    }
    // 加载付款计划预览
    await loadPaymentPlanPreview()
  } else {
    paymentPlanPreview.value = []
    selectedSupplierBank.value = ''
    useSupplierBank.value = false
  }
})

// 监听金额变化，更新付款计划预览
watch(() => formData.value.amount, async () => {
  if (formType.value === 'create') {
    await loadPaymentPlanPreview()
  }
})

// 监听付款日期变化，更新付款计划预览
watch(() => formData.value.paymentDate, async () => {
  if (formType.value === 'create') {
    await loadPaymentPlanPreview()
  }
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
      // 收集选中的已付款期数
      const paidStages = paymentPlanPreview.value
        .filter(item => item.isPaid && item.isToday)
        .map(item => item.stage)
      // 构建请求数据
      const submitData = {
        ...formData.value,
        paidStages: paidStages.length > 0 ? paidStages : undefined
      }
      await PaymentApi.createPayment(submitData)
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
    paymentType: 1, // 默认采购付款
    supplierId: undefined as any,
    amount: 0,
    paymentMethod: 1,
    paymentAccount: '',
    paymentDate: undefined,
    remark: ''
  }
  paymentPlanPreview.value = []
  formRef.value?.resetFields()
}
</script>
