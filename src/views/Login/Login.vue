<template>
  <div
    :class="prefixCls"
    class="relative h-[100%] lt-md:px-10px lt-sm:px-10px lt-xl:px-10px lt-xl:px-10px"
  >
    <div class="relative mx-auto h-full flex">
      <!-- 左侧区域 - 渐变背景 -->
      <div
        :class="`${prefixCls}__left flex-1 relative p-30px lt-xl:hidden overflow-x-hidden overflow-y-auto`"
      >
        <!-- 左上角的 logo + 系统标题 -->
        <div class="relative flex items-center text-white">
          <!-- <img alt="" class="mr-10px h-48px w-48px" src="@/assets/imgs/logo.png" /> -->
          <span class="text-20px font-bold">{{ underlineToHump(appStore.getTitle) }}</span>
        </div>
        <!-- 左边的背景图 + 欢迎语 -->
        <div class="h-[calc(100%-60px)] flex items-center justify-center">
          <TransitionGroup
            appear
            enter-active-class="animate__animated animate__bounceInLeft"
            tag="div"
            class="text-center"
          >
            <img
              key="1"
              alt=""
              class="w-350px mx-auto mb-20px"
              src="@/assets/svgs/login-box-bg.svg"
            />
            <div key="2" class="text-3xl text-white font-bold">{{ t('login.welcome') }}</div>
            <div key="3" class="mt-10px text-16px font-normal text-white text-opacity-90">
              {{ t('login.message') }}
            </div>
            <div key="4" class="mt-15px text-14px text-white text-opacity-70 tracking-wider">
              {{ t('login.slogan') }}
            </div>
          </TransitionGroup>
        </div>
      </div>
      <!-- 右侧区域 - 登录表单 -->
      <div
        :class="`${prefixCls}__right relative flex-1 p-30px lt-sm:p-10px overflow-x-hidden overflow-y-auto`"
      >
        <!-- 右上角的主题、语言选择 -->
        <div
          class="flex items-center justify-between at-2xl:justify-end at-xl:justify-end"
          style="color: var(--el-text-color-primary)"
        >
          <div class="flex items-center at-2xl:hidden at-xl:hidden">
            <!-- <img alt="" class="mr-10px h-48px w-48px" src="@/assets/imgs/logo.png" /> -->
            <span class="text-20px font-bold">{{ underlineToHump(appStore.getTitle) }}</span>
          </div>
          <div class="flex items-center justify-end space-x-10px h-48px">
            <ThemeSwitch />
            <!-- <LocaleDropdown /> -->
          </div>
        </div>
        <!-- 右边的登录界面 -->
        <Transition appear enter-active-class="animate__animated animate__bounceInRight">
          <div
            class="m-auto h-[calc(100%-60px)] w-[100%] flex items-center at-2xl:max-w-500px at-lg:max-w-500px at-md:max-w-500px at-xl:max-w-500px"
          >
            <!-- 账号登录 - 毛玻璃卡片 -->
            <LoginForm
              :class="`${prefixCls}__card m-auto h-auto p-30px lt-xl:(rounded-3xl light:bg-white)`"
            />
            <!-- SSO单点登录回调 -->
            <SSOLoginVue
              :class="`${prefixCls}__card m-auto h-auto p-30px lt-xl:(rounded-3xl light:bg-white)`"
            />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { underlineToHump } from '@/utils'

import { useDesign } from '@/hooks/web/useDesign'
import { useAppStore } from '@/store/modules/app'
import { ThemeSwitch } from '@/layout/components/ThemeSwitch'
import { LocaleDropdown } from '@/layout/components/LocaleDropdown'

import { LoginForm, SSOLoginVue } from './components'

defineOptions({ name: 'Login' })

const { t } = useI18n()
const appStore = useAppStore()
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('login')
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-login;

.#{$prefix-cls} {
  overflow: auto;

  // 左侧区域 - 蓝紫渐变背景
  &__left {
    position: relative;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      width: 100%;
      height: 100%;
      background-image: url('@/assets/svgs/login-bg.svg');
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      content: '';
      opacity: 0.1;
    }

    // 确保内容在背景之上
    > * {
      position: relative;
      z-index: 1;
    }
  }

  // 右侧区域
  &__right {
    background: #f5f7fa;

    .dark & {
      background: var(--login-bg-color);
    }
  }

  // 登录卡片 - 毛玻璃效果
  &__card {
    background: rgb(255 255 255 / 95%);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgb(0 0 0 / 10%);

    .dark & {
      background: rgb(30 30 30 / 90%);
      box-shadow: 0 8px 32px rgb(0 0 0 / 30%);
    }
  }
}
</style>

<style lang="scss">
.dark .login-form {
  .el-divider__text {
    background-color: var(--login-bg-color);
  }

  .el-card {
    background-color: var(--login-bg-color);
  }
}
</style>
