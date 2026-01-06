import request from '@/config/axios'

// ERP 供应商 VO
export interface SupplierVO {
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
  paymentDays?: number
  status?: number
  sort?: number
  remark?: string
  createTime?: Date
}

// ERP 供应商 API
export const SupplierApi = {
  // 查询供应商分页
  getSupplierPage: async (params: any) => {
    return await request.get({ url: `/erp/supplier/page`, params })
  },

  // 查询供应商精简列表
  getSupplierSimpleList: async () => {
    return await request.get({ url: `/erp/supplier/simple-list` })
  },

  // 查询供应商详情
  getSupplier: async (id: number) => {
    return await request.get({ url: `/erp/supplier/get?id=` + id })
  },

  // 新增供应商
  createSupplier: async (data: SupplierVO) => {
    return await request.post({ url: `/erp/supplier/create`, data })
  },

  // 修改供应商
  updateSupplier: async (data: SupplierVO) => {
    return await request.put({ url: `/erp/supplier/update`, data })
  },

  // 删除供应商
  deleteSupplier: async (id: number) => {
    return await request.delete({ url: `/erp/supplier/delete?id=` + id })
  },

  // 批量删除供应商
  deleteSupplierList: async (ids: number[]) => {
    return await request.delete({ url: `/erp/supplier/delete-list?ids=` + ids.join(',') })
  }
}
