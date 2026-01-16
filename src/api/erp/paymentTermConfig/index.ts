import request from '@/config/axios'

// 账期配置 VO
export interface PaymentTermConfigVO {
  id?: number
  supplierId?: number
  stage?: number
  daysAfterOrder: number
  percentage: number
  status?: number
  remark?: string
  createTime?: Date
}

// 账期配置 API
export const PaymentTermConfigApi = {
  // 保存供应商账期配置
  saveConfigs: async (supplierId: number, configs: PaymentTermConfigVO[]) => {
    return await request.post({
      url: `/erp/payment-term-config/save?supplierId=${supplierId}`,
      data: configs
    })
  },

  // 获取供应商账期配置列表
  getConfigList: async (supplierId: number) => {
    return await request.get({ url: `/erp/payment-term-config/list?supplierId=${supplierId}` })
  }
}
