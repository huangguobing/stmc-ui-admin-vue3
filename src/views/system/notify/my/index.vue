<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="状态" prop="readStatus">
        <el-select v-model="queryParams.readStatus" placeholder="全部" clearable class="!w-160px">
          <el-option label="全部" :value="undefined" />
          <el-option label="未处理" :value="false" />
          <el-option label="已处理" :value="true" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" /> 重置
        </el-button>
        <el-button type="success" @click="handleMarkAllRead" :disabled="unreadCount === 0">
          <Icon icon="ep:check" class="mr-5px" /> 全部已处理
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" class="mt-20px">
      <el-table-column label="发送人" align="center" prop="templateNickname" width="120" />
      <el-table-column label="消息内容" align="left" prop="templateContent" min-width="300" show-overflow-tooltip />
      <el-table-column label="发送时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.readStatus" type="success">已处理</el-tag>
          <el-tag v-else type="danger">未处理</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100">
        <template #default="scope">
          <el-button
            v-if="!scope.row.readStatus"
            type="success"
            link
            @click="handleMarkRead(scope.row.id)"
          >
            标记已处理
          </el-button>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script lang="ts" setup>
import * as NotifyMessageApi from '@/api/system/notify/message'
import { formatDate } from '@/utils/formatTime'

defineOptions({ name: 'MyNotifyMessage' })

const message = useMessage()

const loading = ref(false)
const total = ref(0)
const list = ref<any[]>([])
const unreadCount = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  readStatus: undefined as boolean | undefined
})
const queryFormRef = ref()

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await NotifyMessageApi.getMyNotifyMessagePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 获取未读数量 */
const getUnreadCount = async () => {
  unreadCount.value = await NotifyMessageApi.getUnreadNotifyMessageCount()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.readStatus = undefined
  handleQuery()
}

/** 标记单条为已处理 */
const handleMarkRead = async (id: number) => {
  await NotifyMessageApi.updateNotifyMessageRead([id])
  message.success('标记成功')
  getList()
  getUnreadCount()
}

/** 标记全部已处理 */
const handleMarkAllRead = async () => {
  await NotifyMessageApi.updateAllNotifyMessageRead()
  message.success('全部标记成功')
  getList()
  getUnreadCount()
}

/** 初始化 */
onMounted(() => {
  getList()
  getUnreadCount()
})
</script>
