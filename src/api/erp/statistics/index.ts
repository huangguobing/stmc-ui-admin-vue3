import request from '@/config/axios'

// 供应商采购统计 VO
export interface SupplierStatisticsVO {
  supplierId: number
  supplierName: string
  supplierCode: string
  contact: string
  mobile: string
  address: string
  totalPurchaseAmount: number
  orderItemCount: number
}

// 采购明细统计 VO
export interface OrderItemStatisticsVO {
  id: number
  orderNo: string
  productName: string
  spec: string
  purchaseQuantity: number
  purchaseUnit: string
  purchasePrice: number
  purchaseAmount: number
  createTime: Date
}

// 员工销售统计 VO
export interface SalesmanStatisticsVO {
  salesmanId: number
  salesmanName: string
  deptName: string
  mobile: string
  orderCount: number
  salesAmount: number
  costAmount: number
  grossProfit: number
  netProfit: number
}

// 客户销售统计 VO
export interface CustomerStatisticsVO {
  customerId: number
  customerName: string
  customerCode: string
  contact: string
  mobile: string
  orderCount: number
  salesAmount: number
  costAmount: number
  grossProfit: number
  netProfit: number
}

// 统计报表 API
export const StatisticsApi = {
  // 获取供应商采购统计
  getSupplierPurchaseStatistics: async (params: {
    startDate?: string
    endDate?: string
    supplierName?: string
  }) => {
    return await request.get<SupplierStatisticsVO[]>({ url: '/erp/statistics/supplier-purchase', params })
  },

  // 获取供应商采购明细
  getSupplierPurchaseDetail: async (params: {
    supplierId: number
    startDate?: string
    endDate?: string
    pageNo: number
    pageSize: number
  }) => {
    return await request.get({ url: '/erp/statistics/supplier-purchase-detail', params })
  },

  // 获取员工销售统计
  getSalesmanSalesStatistics: async (params: {
    startDate?: string
    endDate?: string
    salesmanName?: string
    mobile?: string
  }) => {
    return await request.get<SalesmanStatisticsVO[]>({ url: '/erp/statistics/salesman-sales', params })
  },

  // 获取客户销售统计
  getCustomerSalesStatistics: async (params: {
    startDate?: string
    endDate?: string
    customerName?: string
    mobile?: string
  }) => {
    return await request.get<CustomerStatisticsVO[]>({ url: '/erp/statistics/customer-sales', params })
  }
}
