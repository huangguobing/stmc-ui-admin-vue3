import request from '@/config/axios'

// 付款计划状态枚举
export enum PaymentPlanStatus {
  PENDING = 0,    // 待付款
  PAID = 10,      // 已付款
  OVERDUE = 20,   // 已逾期
  CANCELLED = 30  // 已取消
}

// 付款计划 VO
export interface PaymentPlanVO {
  id?: number
  planNo?: string
  paymentId?: number
  paymentNo?: string
  supplierId?: number
  supplierName?: string
  orderId?: number              // 订单ID（从付款单获取）
  orderNo?: string              // 订单号
  customerName?: string         // 客户名称（从订单获取）
  salesmanName?: string         // 开单业务员（从订单获取）
  stage?: number
  planAmount?: number
  planDate?: string
  actualAmount?: number
  actualDate?: Date
  status?: number
  notifyStatus?: number
  remark?: string
  createTime?: Date
}

// 付款计划查询参数
export interface PaymentPlanPageReqVO {
  pageNo: number
  pageSize: number
  paymentNo?: string
  supplierId?: number
  status?: number
  planDateStart?: string
  planDateEnd?: string
}

// 付款计划预览 VO
export interface PaymentPlanPreviewVO {
  stage: number
  percentage: number
  planAmount: number
  planDate: string
  isToday: boolean
  isPaid?: boolean  // 前端使用，标记用户是否勾选已付款
}

// 付款计划 API
export const PaymentPlanApi = {
  // 预览付款计划（根据供应商账期配置预计算分期）
  previewPaymentPlans: async (supplierId: number, amount: number, paymentDate?: string) => {
    const params: any = { supplierId, amount }
    if (paymentDate) {
      params.paymentDate = paymentDate
    }
    return await request.get({ url: `/erp/payment-plan/preview`, params })
  },

  // 分页查询付款计划
  getPaymentPlanPage: async (params: PaymentPlanPageReqVO) => {
    return await request.get({ url: `/erp/payment-plan/page`, params })
  },

  // 获取付款单的付款计划列表
  getPaymentPlansByPaymentId: async (paymentId: number) => {
    return await request.get({ url: `/erp/payment-plan/list-by-payment?paymentId=${paymentId}` })
  },

  // 标记为已付款
  markAsPaid: async (id: number) => {
    return await request.post({
      url: `/erp/payment-plan/mark-paid?id=${id}`
    })
  }
}
