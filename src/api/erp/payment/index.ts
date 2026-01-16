import request from '@/config/axios'

// 付款类型枚举
export enum PaymentType {
  PURCHASE = 1, // 采购付款
  EXPENSE = 2   // 费用付款
}

// 付款状态枚举
export enum PaymentStatus {
  PENDING = 0,    // 待审批
  APPROVED = 10,  // 已通过
  PAID = 20,      // 已付款
  REJECTED = 30,  // 已拒绝
  CANCELLED = 40  // 已取消
}

// 付款方式枚举
export enum PaymentMethod {
  BANK_TRANSFER = 1, // 银行转账
  CASH = 2,          // 现金
  CHECK = 3          // 支票
}

// ERP 付款 VO
export interface PaymentVO {
  id?: number
  paymentNo?: string
  supplierId: number
  supplierName?: string      // 供应商名称
  orderId?: number
  orderNo?: string           // 关联订单号
  customerName?: string      // 客户名称（从订单获取）
  salesmanName?: string      // 开单业务员（从订单获取）
  paymentType: number
  status?: number
  amount: number
  paymentMethod?: number
  paymentAccount?: string
  paymentDate?: Date
  approver?: number
  approveTime?: Date
  approveRemark?: string
  remark?: string
  createTime?: Date
}

// ERP 付款 API
export const PaymentApi = {
  // 查询付款分页
  getPaymentPage: async (params: any) => {
    return await request.get({ url: `/erp/payment/page`, params })
  },

  // 查询付款详情
  getPayment: async (id: number) => {
    return await request.get({ url: `/erp/payment/get?id=` + id })
  },

  // 新增付款
  createPayment: async (data: PaymentVO) => {
    return await request.post({ url: `/erp/payment/create`, data })
  },

  // 修改付款
  updatePayment: async (data: PaymentVO) => {
    return await request.put({ url: `/erp/payment/update`, data })
  },

  // 审批付款
  approvePayment: async (id: number, approved: boolean, remark?: string) => {
    return await request.put({
      url: `/erp/payment/approve`,
      params: { id, approved, remark }
    })
  },

  // 删除付款
  deletePayment: async (id: number) => {
    return await request.delete({ url: `/erp/payment/delete?id=` + id })
  },

  // 批量删除付款
  deletePaymentList: async (ids: number[]) => {
    return await request.delete({ url: `/erp/payment/delete-list?ids=` + ids.join(',') })
  }
}
