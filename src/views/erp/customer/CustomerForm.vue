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
          <el-form-item label="客户名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入客户名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入客户编码" />
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
        <el-col :span="12">
          <el-form-item label="信用额度" prop="creditLimit">
            <el-input-number
              v-model="formData.creditLimit"
              :min="0"
              :precision="2"
              placeholder="请输入信用额度"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
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
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" placeholder="请输入排序" />
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
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CustomerApi, CustomerVO } from '@/api/erp/customer'
import { FormRules } from 'element-plus'

defineOptions({ name: 'ErpCustomerForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref<CustomerVO>({
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
  creditLimit: 0,
  status: 0,
  sort: 0,
  remark: ''
})
const formRules = reactive<FormRules>({
  name: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }]
})
const formRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await CustomerApi.getCustomer(id)
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
      await CustomerApi.createCustomer(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await CustomerApi.updateCustomer(formData.value)
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
    creditLimit: 0,
    status: 0,
    sort: 0,
    remark: ''
  }
  formRef.value?.resetFields()
}
</script>
