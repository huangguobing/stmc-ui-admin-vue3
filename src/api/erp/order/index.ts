import request from '@/config/axios'

// 订单类型枚举
export enum OrderType {
  SALE = 1,     // 销售订单
  PURCHASE = 2  // 采购订单
}

// 订单状态枚举
export enum OrderStatus {
  DRAFT = 0,        // 草稿
  PENDING = 10,     // 待确认
  CONFIRMED = 20,   // 已确认
  PROCESSING = 30,  // 处理中
  COMPLETED = 40,   // 已完成
  CANCELLED = 50    // 已取消
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
  orderDate?: Date
  deliveryDate?: Date
  totalQuantity?: number
  totalAmount?: number
  discountAmount?: number
  payableAmount?: number
  paidAmount?: number
  contact?: string
  mobile?: string
  address?: string
  remark?: string
  createTime?: Date
}

// ERP 订单 API
export const OrderApi = {
  // 查询订单分页
  getOrderPage: async (params: any) => {
    return await request.get({ url: `/erp/order/page`, params })
  },

  // 查询订单详情
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
  }
}
