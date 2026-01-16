<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px" label-width="80px">
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
          type="date"
          placeholder="请选择开始日期"
          value-format="YYYY-MM-DD"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          type="date"
          placeholder="请选择结束日期"
          value-format="YYYY-MM-DD"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierName">
        <el-input
          v-model="queryParams.supplierName"
          placeholder="请输入供应商名称"
          clearable
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" row-key="supplierId" @expand-change="handleExpandChange">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="px-20px py-10px">
            <el-table
              v-loading="row.detailLoading"
              :data="row.details"
              border
              size="small"
            >
              <el-table-column align="center" label="订单号" prop="orderNo" width="180" />
              <el-table-column align="center" label="商品名称" prop="productName" min-width="150" :show-overflow-tooltip="true" />
              <el-table-column align="center" label="规格" prop="spec" width="120" />
              <el-table-column align="right" label="采购数量" prop="purchaseQuantity" width="100">
                <template #default="{ row: item }">{{ formatNumber(item.purchaseQuantity) }}</template>
              </el-table-column>
              <el-table-column align="center" label="采购单位" prop="purchaseUnit" width="80" />
              <el-table-column align="right" label="采购单价" prop="purchasePrice" width="100">
                <template #default="{ row: item }">{{ formatNumber(item.purchasePrice) }}</template>
              </el-table-column>
              <el-table-column align="right" label="采购金额" prop="purchaseAmount" width="120">
                <template #default="{ row: item }">{{ formatNumber(item.purchaseAmount) }}</template>
              </el-table-column>
              <el-table-column align="center" label="创建时间" prop="createTime" width="180">
                <template #default="{ row: item }">{{ formatDate(item.createTime) }}</template>
              </el-table-column>
            </el-table>
            <!-- 明细分页 -->
            <div class="mt-10px flex justify-end" v-if="row.detailTotal > 0">
              <el-pagination
                v-model:current-page="row.detailPageNo"
                v-model:page-size="row.detailPageSize"
                :total="row.detailTotal"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                small
                @size-change="() => loadDetail(row)"
                @current-change="() => loadDetail(row)"
              />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="供应商名称" prop="supplierName" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="供应商编号" prop="supplierCode" width="120" />
      <el-table-column align="center" label="联系人" prop="contact" width="100" />
      <el-table-column align="center" label="联系电话" prop="mobile" width="130" />
      <el-table-column align="center" label="地址" prop="address" min-width="180" :show-overflow-tooltip="true" />
      <el-table-column align="right" label="采购总额" prop="totalPurchaseAmount" width="130">
        <template #default="{ row }">
          <span class="text-primary font-bold">{{ formatNumber(row.totalPurchaseAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="采购明细数" prop="orderItemCount" width="100" />
    </el-table>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { StatisticsApi, SupplierStatisticsVO, OrderItemStatisticsVO } from '@/api/erp/statistics'
import { formatDate } from '@/utils/formatTime'
import { formatNumber } from '@/utils'

defineOptions({ name: 'ErpSupplierPurchaseStatistics' })

const loading = ref(true)

interface SupplierStatisticsRow extends SupplierStatisticsVO {
  details?: OrderItemStatisticsVO[]
  detailLoading?: boolean
  detailPageNo?: number
  detailPageSize?: number
  detailTotal?: number
  expanded?: boolean
}

const list = ref<SupplierStatisticsRow[]>([])

/** 获取本月第一天 */
const getMonthFirstDay = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

const queryParams = reactive({
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined,
  supplierName: undefined as string | undefined
})

const queryFormRef = ref()

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await StatisticsApi.getSupplierPurchaseStatistics(queryParams)
    // 初始化每行的明细相关字段
    list.value = (data || []).map((item: SupplierStatisticsVO) => ({
      ...item,
      details: [],
      detailLoading: false,
      detailPageNo: 1,
      detailPageSize: 10,
      detailTotal: 0,
      expanded: false
    }))
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  // 重置为本月日期
  queryParams.startDate = formatDate(getMonthFirstDay(), 'YYYY-MM-DD')
  queryParams.endDate = formatDate(new Date(), 'YYYY-MM-DD')
  queryParams.supplierName = undefined
  handleQuery()
}

/** 展开行事件 */
const handleExpandChange = async (row: SupplierStatisticsRow, expandedRows: SupplierStatisticsRow[]) => {
  const isExpanded = expandedRows.includes(row)
  row.expanded = isExpanded
  if (isExpanded && !row.details?.length) {
    await loadDetail(row)
  }
}

/** 加载明细数据 */
const loadDetail = async (row: SupplierStatisticsRow) => {
  row.detailLoading = true
  try {
    const data = await StatisticsApi.getSupplierPurchaseDetail({
      supplierId: row.supplierId,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      pageNo: row.detailPageNo || 1,
      pageSize: row.detailPageSize || 10
    })
    row.details = data.list || []
    row.detailTotal = data.total || 0
  } finally {
    row.detailLoading = false
  }
}

/** 初始化 - 默认填充本月日期 */
onMounted(async () => {
  queryParams.startDate = formatDate(getMonthFirstDay(), 'YYYY-MM-DD')
  queryParams.endDate = formatDate(new Date(), 'YYYY-MM-DD')
  await getList()
})
</script>

<style scoped>
.text-primary {
  color: var(--el-color-primary);
}
</style>
