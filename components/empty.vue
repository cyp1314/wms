<template>
  <view class="empty-container">
    <view class="empty-icon">
      <uni-icons custom-prefix="iconfont" type="icon-wushuju" size="180"></uni-icons>
    </view>
    <!--新增返回按钮-->
    <view class="empty-button">
      <uni-button style="width: 60vw;" type="primary" @click="goBack">返回</uni-button>
    </view>
  </view>
</template>

<script>
  export default {
    name: 'Empty',
    methods: {
      goBack() {
        uni.navigateBack({
          delta: 1
        });
      }
    }
  }
</script>

<style scoped>
  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    background-color: #ffffff;
    border-radius: 8px;
    margin: 20px;
  }

  .empty-icon {
    margin-bottom: 20px;
    opacity: 0.7;
  }

  .empty-button {
    margin-top: 64px;
  }
</style>