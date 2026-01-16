<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import * as NotifyMessageApi from '@/api/system/notify/message'
import { useUserStoreWithOut } from '@/store/modules/user'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'Message' })

defineProps({
  color: propTypes.string.def('')
})

const { push } = useRouter()
const userStore = useUserStoreWithOut()
const activeName = ref('notice')
const unreadCount = ref(0) // 未读消息数量
const list = ref<any[]>([]) // 消息列表

// 获得消息列表
const getList = async () => {
  list.value = await NotifyMessageApi.getUnreadNotifyMessageList()
}

// 获得未读消息数
const getUnreadCount = async () => {
  NotifyMessageApi.getUnreadNotifyMessageCount().then((data) => {
    unreadCount.value = data
  })
}

// 标记消息为已处理
const handleMarkRead = async (id: number) => {
  await NotifyMessageApi.updateNotifyMessageRead([id])
  // 从列表中移除该消息
  list.value = list.value.filter(item => item.id !== id)
  // 更新未读数量
  if (unreadCount.value > 0) {
    unreadCount.value--
  }
}

// 跳转我的站内信
const goMyList = () => {
  push({
    name: 'MyNotifyMessage'
  })
}

// ========== 初始化 =========
onMounted(() => {
  // 首次加载小红点
  getUnreadCount()
  // 轮询刷新小红点
  setInterval(
    () => {
      if (userStore.getIsSetUser) {
        getUnreadCount()
      } else {
        unreadCount.value = 0
      }
    },
    1000 * 60 * 2
  )
})
</script>
<template>
  <div class="message">
    <ElPopover :width="400" placement="bottom" trigger="click">
      <template #reference>
        <ElBadge
          :value="unreadCount"
          :hidden="unreadCount === 0"
          :max="99"
          class="item"
          :class="{ 'badge-blink': unreadCount > 0 }"
        >
          <Icon :size="18" class="cursor-pointer" icon="ep:bell" :color="color" @click="getList" />
        </ElBadge>
      </template>
      <ElTabs v-model="activeName">
        <ElTabPane label="我的站内信" name="notice">
          <el-scrollbar class="message-list">
            <template v-if="list.length > 0">
              <template v-for="item in list" :key="item.id">
                <div class="message-item">
                  <div class="message-content">
                    <span class="message-title">
                      {{ item.templateNickname }}：{{ item.templateContent }}
                    </span>
                    <span class="message-date">
                      {{ formatDate(item.createTime) }}
                    </span>
                  </div>
                  <el-button type="success" size="small" link @click.stop="handleMarkRead(item.id)">
                    已处理
                  </el-button>
                </div>
              </template>
            </template>
            <template v-else>
              <div class="message-empty">
                <Icon icon="ep:message" :size="48" class="text-gray-300" />
                <span class="text-gray-400">暂无未处理消息</span>
              </div>
            </template>
          </el-scrollbar>
        </ElTabPane>
      </ElTabs>
      <!-- 更多 -->
      <div style="margin-top: 10px; text-align: right">
        <XButton preIcon="ep:view" title="查看全部" type="primary" @click="goMyList" />
      </div>
    </ElPopover>
  </div>
</template>
<style lang="scss" scoped>
// 闪烁动画
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.badge-blink {
  :deep(.el-badge__content) {
    animation: blink 1s infinite;
  }
}

.message-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 260px;
  line-height: 45px;
}

.message-list {
  display: flex;
  height: 400px;
  flex-direction: column;

  .message-item {
    display: flex;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--el-border-color-light);

    &:last-child {
      border: none;
    }

    .message-content {
      display: flex;
      flex: 1;
      flex-direction: column;

      .message-title {
        margin-bottom: 5px;
      }

      .message-date {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>
