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
          <el-form-item label="供应商名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入供应商名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入供应商编码" />
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
        <el-col :span="12">
          <el-form-item label="电子邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入电子邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="传真" prop="fax">
            <el-input v-model="formData.fax" placeholder="请输入传真" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入地址" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="开户银行" prop="bankName">
            <el-input v-model="formData.bankName" placeholder="请输入开户银行" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="银行账号" prop="bankAccount">
            <el-input v-model="formData.bankAccount" placeholder="请输入银行账号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="税号" prop="taxNo">
            <el-input v-model="formData.taxNo" placeholder="请输入税号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :value="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
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

      <!-- 【暂时屏蔽】账期分期配置 - 后期可能恢复
      <el-divider content-position="left">账期分期配置</el-divider>
      <el-row>
        <el-col :span="24">
          <el-form-item label-width="0">
            <el-table :data="paymentTermConfigs" border style="width: 100%">
              <el-table-column label="期数" align="center" width="80">
                <template #default="{ $index }">第{{ $index + 1 }}期</template>
              </el-table-column>
              <el-table-column label="订单后天数" align="center" width="150">
                <template #default="{ row }">
                  <el-input-number v-model="row.daysAfterOrder" :min="0" :max="365" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="付款比例(%)" align="center" width="150">
                <template #default="{ row }">
                  <el-input-number v-model="row.percentage" :min="0" :max="100" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="备注" align="center">
                <template #default="{ row }">
                  <el-input v-model="row.remark" placeholder="请输入备注" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="80">
                <template #default="{ $index }">
                  <el-button type="danger" link size="small" @click="removePaymentTerm($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="mt-10px">
              <el-button type="primary" plain size="small" @click="addPaymentTerm">
                <Icon icon="ep:plus" class="mr-5px" /> 添加分期
              </el-button>
              <span class="ml-10px text-gray-400 text-12px">
                提示：所有期数的付款比例总和必须等于100% (当前: {{ totalPercentage }}%)
              </span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      -->
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { SupplierApi, SupplierVO } from '@/api/erp/supplier'
import { PaymentTermConfigApi, PaymentTermConfigVO } from '@/api/erp/paymentTermConfig'
import { FormRules } from 'element-plus'

defineOptions({ name: 'ErpSupplierForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref<SupplierVO>({
  name: '',
  code: '',
  contact: '',
  mobile: '',
  email: '',
  fax: '',
  address: '',
  bankName: '',
  bankAccount: '',
  taxNo: '',
  paymentDays: 0,
  status: 0,
  sort: 0,
  remark: ''
})
const formRules = reactive<FormRules>({
  name: [{ required: true, message: '供应商名称不能为空', trigger: 'blur' }]
})
const formRef = ref()

// 账期分期配置
const paymentTermConfigs = ref<PaymentTermConfigVO[]>([])

// 计算总比例
const totalPercentage = computed(() => {
  return paymentTermConfigs.value.reduce((sum, item) => sum + (item.percentage || 0), 0)
})

// 添加分期
const addPaymentTerm = () => {
  paymentTermConfigs.value.push({
    daysAfterOrder: undefined,
    percentage: undefined,
    remark: ''
  })
}

// 删除分期
const removePaymentTerm = (index: number) => {
  paymentTermConfigs.value.splice(index, 1)
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await SupplierApi.getSupplier(id)
      // 加载账期配置
      const configs = await PaymentTermConfigApi.getConfigList(id)
      paymentTermConfigs.value = configs || []
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

  // 校验账期配置比例
  if (paymentTermConfigs.value.length > 0 && totalPercentage.value !== 100) {
    message.warning('分期付款比例总和必须等于100%')
    return
  }

  formLoading.value = true
  try {
    let supplierId: number
    if (formType.value === 'create') {
      supplierId = await SupplierApi.createSupplier(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await SupplierApi.updateSupplier(formData.value)
      supplierId = formData.value.id!
      message.success(t('common.updateSuccess'))
    }

    // 保存账期配置
    if (paymentTermConfigs.value.length > 0) {
      await PaymentTermConfigApi.saveConfigs(supplierId, paymentTermConfigs.value)
    } else {
      // 如果没有配置，清空原有配置
      await PaymentTermConfigApi.saveConfigs(supplierId, [])
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
    name: '',
    code: '',
    contact: '',
    mobile: '',
    email: '',
    fax: '',
    address: '',
    bankName: '',
    bankAccount: '',
    taxNo: '',
    paymentDays: 0,
    status: 0,
    sort: 0,
    remark: ''
  }
  paymentTermConfigs.value = []
  formRef.value?.resetFields()
}
</script>
