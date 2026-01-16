import request from '@/config/axios'

// 订单类型枚举
export enum OrderType {
  SALE = 1,     // 销售订单
  PURCHASE = 2  // 采购订单
}

// 订单状态枚举（新）
export enum OrderStatus {
  PENDING_REVIEW = 0,   // 待审核
  PENDING_COST = 10,    // 待填充成本
  COMPLETED = 20,       // 已完成
  CANCELLED = 50        // 已取消
}

// 订单状态标签
export const OrderStatusLabels = {
  [OrderStatus.PENDING_REVIEW]: '待审核',
  [OrderStatus.PENDING_COST]: '待填充成本',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消'
}

// 订单明细 VO
export interface OrderItemVO {
  id?: number
  orderId?: number
  // 销售信息（业务员填写）
  productName: string
  spec?: string
  saleUnit?: string
  saleQuantity: number
  salePrice: number
  saleAmount?: number
  saleRemark?: string
  // 采购成本信息（管理员填写）
  purchaseUnit?: string
  purchaseQuantity?: number
  purchasePrice?: number
  purchaseAmount?: number
  purchaseRemark?: string
  supplierId?: number
  supplierName?: string
  // 利润信息
  grossProfit?: number
  taxAmount?: number
  netProfit?: number
  // 付款信息
  paymentDate?: string
  isPaid?: boolean
}

// ERP 订单 VO
export interface OrderVO {
  id?: number
  orderNo?: string
  customerId?: number
  customerName?: string
  supplierId?: number
  supplierName?: string
  orderType: number
  status?: number
  orderDate?: Date | string
  deliveryDate?: Date | string
  totalQuantity?: number
  totalAmount?: number
  discountAmount?: number
  payableAmount?: number
  paidAmount?: number
  shippingFee?: number
  // 成本信息
  totalPurchaseAmount?: number
  totalGrossProfit?: number
  totalTaxAmount?: number
  totalNetProfit?: number
  costFilled?: boolean
  costFilledBy?: number
  costFilledByName?: string
  costFilledTime?: Date
  // 业务员信息
  salesmanId?: number
  salesmanName?: string
  // 其他
  contact?: string
  mobile?: string
  address?: string
  remark?: string
  createTime?: Date
  // 明细列表
  items?: OrderItemVO[]
}

// 成本填充请求
export interface OrderCostFillReqVO {
  orderId: number
  items: {
    itemId: number
    purchaseUnit?: string
    purchaseQuantity?: number
    purchasePrice?: number
    purchaseAmount?: number
    purchaseRemark?: string
    supplierId?: number
    taxAmount?: number
    paymentDate?: string
    isPaid?: boolean
  }[]
}

// ERP 订单 API
export const OrderApi = {
  // 查询订单分页
  getOrderPage: async (params: any) => {
    return await request.get({ url: `/erp/order/page`, params })
  },

  // 查询订单详情（含明细）
  getOrder: async (id: number) => {
    return await request.get({ url: `/erp/order/get?id=` + id })
  },

  // 新增订单
  createOrder: async (data: OrderVO) => {
    return await request.post({ url: `/erp/order/create`, data })
  },

  // 修改订单
  updateOrder: async (data: OrderVO) => {
    return await request.put({ url: `/erp/order/update`, data })
  },

  // 更新订单状态
  updateOrderStatus: async (id: number, status: number) => {
    return await request.put({ url: `/erp/order/update-status?id=${id}&status=${status}` })
  },

  // 删除订单
  deleteOrder: async (id: number) => {
    return await request.delete({ url: `/erp/order/delete?id=` + id })
  },

  // 批量删除订单
  deleteOrderList: async (ids: number[]) => {
    return await request.delete({ url: `/erp/order/delete-list?ids=` + ids.join(',') })
  },

  // 获取订单精简列表
  getOrderSimpleList: async () => {
    return await request.get({ url: `/erp/order/simple-list` })
  },

  // 根据供应商获取采购订单精简列表
  getOrderSimpleListBySupplierId: async (supplierId: number) => {
    return await request.get({ url: `/erp/order/simple-list-by-supplier?supplierId=` + supplierId })
  },

  // 审核通过订单
  approveOrder: async (id: number) => {
    return await request.put({ url: `/erp/order/approve?id=` + id })
  },

  // 审核拒绝订单
  rejectOrder: async (id: number, reason?: string) => {
    const params = reason ? `?id=${id}&reason=${encodeURIComponent(reason)}` : `?id=${id}`
    return await request.put({ url: `/erp/order/reject` + params })
  },

  // 填充订单成本
  fillOrderCost: async (data: OrderCostFillReqVO) => {
    return await request.put({ url: `/erp/order/fill-cost`, data })
  },

  // 编辑订单成本
  editOrderCost: async (data: OrderCostFillReqVO) => {
    return await request.put({ url: `/erp/order/edit-cost`, data })
  },

  // 打印导出订单数据（客户联开单）
  printExport: async (id: number) => {
    return await request.download({ url: `/erp/order/print-export?id=${id}` })
  },

  // 标注订单为已付款
  markOrderAsPaid: async (id: number) => {
    return await request.put({ url: `/erp/order/mark-paid?id=${id}` })
  }
}
