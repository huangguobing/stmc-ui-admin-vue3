import request from '@/config/axios'

// ERP 客户 VO
export interface CustomerVO {
  id?: number
  name: string
  code?: string
  contact?: string
  mobile?: string
  email?: string
  fax?: string
  address?: string
  bankName?: string
  bankAccount?: string
  taxNo?: string
  creditLimit?: number
  status?: number
  sort?: number
  remark?: string
  createTime?: Date
}

// ERP 客户 API
export const CustomerApi = {
  // 查询客户分页
  getCustomerPage: async (params: any) => {
    return await request.get({ url: `/erp/customer/page`, params })
  },

  // 查询客户精简列表
  getCustomerSimpleList: async () => {
    return await request.get({ url: `/erp/customer/simple-list` })
  },

  // 查询客户详情
  getCustomer: async (id: number) => {
    return await request.get({ url: `/erp/customer/get?id=` + id })
  },

  // 新增客户
  createCustomer: async (data: CustomerVO) => {
    return await request.post({ url: `/erp/customer/create`, data })
  },

  // 修改客户
  updateCustomer: async (data: CustomerVO) => {
    return await request.put({ url: `/erp/customer/update`, data })
  },

  // 删除客户
  deleteCustomer: async (id: number) => {
    return await request.delete({ url: `/erp/customer/delete?id=` + id })
  },

  // 批量删除客户
  deleteCustomerList: async (ids: number[]) => {
    return await request.delete({ url: `/erp/customer/delete-list?ids=` + ids.join(',') })
  }
}
