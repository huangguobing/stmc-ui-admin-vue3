<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="部门名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入部门名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="请选择状态">
          <el-option label="开启" :value="0" />
          <el-option label="停用" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button
          v-hasPermi="['system:dept:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
        <el-button plain type="danger" @click="toggleExpandAll">
          <Icon class="mr-5px" icon="ep:sort" />
          展开/折叠
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="list"
      :default-expand-all="isExpandAll"
      row-key="id"
    >
      <el-table-column label="部门名称" prop="name" width="260" />
      <el-table-column align="center" label="负责人" prop="leaderUserId" width="120">
        <template #default="scope">
          {{ getUserName(scope.row.leaderUserId) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" prop="sort" width="80" />
      <el-table-column align="center" label="状态" prop="status" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" type="success">开启</el-tag>
          <el-tag v-else type="danger">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" fixed="right" label="操作" width="200">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:dept:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['system:dept:create']"
            link
            type="primary"
            @click="openForm('create', undefined, scope.row.id)"
          >
            新增
          </el-button>
          <el-button
            v-hasPermi="['system:dept:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <DeptForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { handleTree } from '@/utils/tree'
import DeptForm from './DeptForm.vue'

defineOptions({ name: 'SystemDept' })

const message = useMessage()

const loading = ref(true)
const list = ref<any[]>([])
const queryParams = reactive({
  name: undefined,
  status: undefined
})
const queryFormRef = ref()
const isExpandAll = ref(true)
const refreshTable = ref(true)
const userList = ref<any[]>([])

/** 查询部门列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await DeptApi.getDeptPage(queryParams)
    list.value = handleTree(data, 'id', 'parentId')
  } finally {
    loading.value = false
  }
}

/** 获取用户名称 */
const getUserName = (userId: number) => {
  if (!userId) return ''
  const user = userList.value.find((item) => item.id === userId)
  return user ? user.nickname : ''
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 展开/折叠操作 */
const toggleExpandAll = () => {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number, parentId?: number) => {
  formRef.value.open(type, id, parentId)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await DeptApi.deleteDept(id)
    message.success('删除成功')
    await getList()
  } catch {}
}

/** 初始化 */
onMounted(async () => {
  await getList()
  // 获取用户列表
  const res = await UserApi.getSimpleUserList()
  userList.value = Array.isArray(res) ? res : (res.list || [])
})
</script>
