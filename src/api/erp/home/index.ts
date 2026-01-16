import request from '@/config/axios'

export interface HomeStatisticsVO {
  // 基础统计
  customerCount: number
  supplierCount?: number | null  // 仅管理员可见
  orderCount: number
  pendingPaymentPlanCount?: number | null  // 仅管理员可见

  // 今日统计
  todayOrderCount: number
  todaySalesAmount: number
  todayCostAmount?: number | null  // 仅管理员可见
  todayGrossProfit?: number | null  // 仅管理员可见
  todayNetProfit?: number | null  // 仅管理员可见

  // 本周统计
  weekOrderCount: number
  weekSalesAmount: number
  weekCostAmount?: number | null  // 仅管理员可见
  weekGrossProfit?: number | null  // 仅管理员可见
  weekNetProfit?: number | null  // 仅管理员可见

  // 本月统计
  monthOrderCount: number
  monthSalesAmount: number
  monthCostAmount?: number | null  // 仅管理员可见
  monthGrossProfit?: number | null  // 仅管理员可见
  monthNetProfit?: number | null  // 仅管理员可见

  // 本年统计
  yearOrderCount: number
  yearSalesAmount: number
  yearCostAmount?: number | null  // 仅管理员可见
  yearGrossProfit?: number | null  // 仅管理员可见
  yearNetProfit?: number | null  // 仅管理员可见

  // 待处理事项
  pendingReviewOrderCount: number
  pendingCostOrderCount: number

  // 权限标识
  isAdmin?: boolean  // 是否为管理员
}

// 首页 API
export const HomeApi = {
  // 获取首页统计数据
  getStatistics: async (): Promise<HomeStatisticsVO> => {
    return await request.get({ url: `/erp/home/statistics` })
  }
}
