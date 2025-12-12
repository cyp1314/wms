<template>
  <view class="second-inbound" :class="{ 'app-header': isApp }">
    <uni-nav-bar title="入库上架" left-text="返回" left-icon="left" @clickLeft="navigateBack">
      <!-- <view class="status" slot="right">进行中</view> -->
    </uni-nav-bar>
    <!-- 步骤指示器 -->
    <view style="background-color: #FFF;margin: 10px 0 0 0;padding: 10px;">
      <uni-steps :options="stepsOptions" :active="currentStep" active-color="#007AFF" />
    </view>

    <!-- 页面内容区 -->
    <view class="content">
      <!-- 输入表单 -->
      <view class="form-card">
        <view class="form-title">
          {{ formTitle }}
        </view>

        <!-- 台车号扫描 -->
        <view v-if="currentStep === 0" class="input-group">
          <view class="input-label">台车号</view>
          <view class="input-wrapper">
            <view class="input-icon">
              <uni-icons type="scan" size="20" color="#999999"></uni-icons>
            </view>
            <view class="input" @click="handleScan('cart')">
              {{ cartNo || '点击扫描台车号' }}
            </view>
          </view>
        </view>

        <!-- 入库票扫描 -->
        <view v-if="currentStep === 1" class="input-group">
          <view class="input-label">入库票</view>
          <view class="input-wrapper">
            <view class="input-icon">
              <uni-icons type="scan" size="20" color="#999999"></uni-icons>
            </view>
            <view class="input" @click="handleScan('ticket')">
              {{ inboundTicket || '点击扫描入库票' }}
            </view>
          </view>
        </view>

        <!-- 零件号扫描 -->
        <view v-if="currentStep === 2" class="input-group">
          <view class="input-label">零件号</view>
          <view class="input-wrapper">
            <view class="input-icon">
              <uni-icons type="scan" size="20" color="#999999"></uni-icons>
            </view>
            <view class="input" @click="handleScan('part')">
              {{ partNo || '点击扫描零件号' }}
            </view>
          </view>
        </view>

        <!-- 库位号扫描 -->
        <view v-if="currentStep === 3" class="input-group">
          <view class="input-label">库位号</view>
          <view class="input-wrapper">
            <view class="input-icon">
              <uni-icons type="scan" size="20" color="#999999"></uni-icons>
            </view>
            <view class="input" @click="handleScan('location')">
              {{ location || '点击扫描库位号' }}
            </view>
          </view>
        </view>
      </view>

      <!-- 操作日志 -->
      <view class="logs-card" v-if="cartParts && cartParts.length > 0">
        <view class="logs-title">台车货物列表</view>
        <view class="logs-list">
          <view class="log-item" v-for="(item, index) in cartParts" :key="index"
            :class="{ 'blink-border': item.isBlinking }">
            <view class="log-content">
              <view class="log-slip">零件名称：{{ item.partname }}</view>
              <view class="log-cart">零件编号：{{ item.partno }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!--扫码组件-->
    <pdaScanVue v-if="open" />
  </view>
</template>

<script>
  import { secondSort, getCartParts } from '@/api/api.js';
  import { scanCode, stopScanCode } from '@/utils/common.js'
  import pdaScanVue from '@/components/pda-scan/pda-scan.vue'
  let timer = 300 // 自动跳转延迟时间
  export default {
    components: {
      pdaScanVue
    },
    data() {
      return {
        isApp: false, // 是否为APP环境
        steps: ['台车号', '入库票', '零件号', '扫描货位'],
        stepsOptions: [
          { title: '台车号' },
          { title: '入库票' },
          { title: '零件号' },
          { title: '扫描货位' }
        ],
        currentStep: 0,
        cartNo: '',
        inboundTicket: '',
        partNo: '',
        location: '',
        cartParts: [], // 台车号上的货物信息
        selectedPart: null, // 选中的零件对象
        open: false,
      };
    },
    computed: {
      formTitle() {
        const titles = [
          '第一步：扫描台车号',
          '第二步：扫描入库票',
          '第三步：扫描零件号',
          '第四步：扫描库位号'
        ];
        return titles[this.currentStep];
      }
    },
    onLoad() {
      // 检测当前平台
      this.isApp = uni.getSystemInfoSync().platform !== 'h5';
    },
    onShow() {
      // 监听扫码事件
      uni.$on('scancodedate', this.handleScanEvent);
    },
    onHide() {
      // 移除扫码事件监听
      uni.$off('scancodedate', this.handleScanEvent);
      // 停止扫码
      stopScanCode();
    },
    onUnload() {
      // 移除扫码事件监听
      uni.$off('scancodedate', this.handleScanEvent);
      // 停止扫码
      stopScanCode();
    },
    methods: {
      navigateBack() {
        uni.navigateBack();
      },
      // 获取台车号上的货物信息
      async fetchCartParts() {
        await getCartParts({ cartno: this.cartNo })
          .then(response => {
            if (response.code === 200) {
              // 为每个货物添加isBlinking字段，默认值为false
              this.cartParts = response.data.map(item => ({
                ...item,
                isBlinking: false
              }));

              // 判断是否所有货物都已验收
              const allReceived = this.cartParts.length == 0;
              if (allReceived) {
                uni.showModal({
                  title: '提示',
                  content: '当前批次的入库分拣已完成，未找到暂未验收的零件号？',
                  showCancel: false,
                  success: (res) => {
                    if (res.confirm) {
                      this.inboundDetails = []
                      // 3秒后自动进入下一步
                      setTimeout(() => {
                        this.currentStep = 0;
                        this.cartNo = ''
                        this.inboundTicket = '';
                        this.partNo = '';
                        this.location = '';
                        this.selectedPart = null;
                      }, timer);
                    }
                  }
                })
              } else {
                // 3秒后自动进入下一步
                setTimeout(() => {
                  this.currentStep = 1;
                }, timer);
              }
            } else {
              uni.showToast({
                title: response.msg || '获取货物信息失败',
                icon: 'none'
              });
              this.cartNo = ''
            }
          })
      },
      // 提交上架数据
      async submitSecondSort() {
        // 提交数据
        const formData = {
          cartno: this.cartNo,
          dischargeno: this.selectedPart.dischargeno || '',
          warehouseno: this.inboundTicket || '',
          partno: this.partNo,
          total: 1,
          goodsNo: this.location,
        };
        secondSort(formData).then(response => {
          if (response.code === 200) {
            uni.showToast({
              title: '上架成功！',
              icon: 'none',
            });
            // 3秒后自动完成当前任务并重置状态
            setTimeout(() => {
              // 重置状态，继续下一个物品的处理
              this.inboundTicket = '';
              this.partNo = '';
              this.location = '';
              this.selectedPart = null;
              this.currentStep = 1;
            }, timer);
          } else {
            uni.showToast({
              title: response.msg || '上架失败',
              icon: 'none'
            });
          }
        }).catch(error => {
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          });
        }).finally(() => {
          // 刷新列表
          this.fetchCartParts();
        })
      },
      // 扫码功能
      async handleScan(type) {
        // 打开扫码组件
        this.open = true;
        scanCode();
      },
      // 处理外部扫码事件
      async handleScanEvent(code) {
        // 关闭扫码组件
        this.open = false;

        if (this.currentStep === 0) {
          this.cartNo = code;
          // 获取台车号上的货物信息
          await this.fetchCartParts();
        } else if (this.currentStep === 1) {
          this.inboundTicket = code;
          // 找到匹配的零件对象
          this.selectedPart = this.cartParts.find(item => item.warehouseno === code);
          console.log('selectedPart:', this.selectedPart)
          // 3秒后自动进入下一步
          setTimeout(() => {
            this.currentStep = 2;
          }, timer);
        } else if (this.currentStep === 2) {
          this.partNo = code;
          if (this.selectedPart.partno !== code) {
            uni.showToast({
              title: '零件号与入库票不匹配',
              icon: 'none'
            });
            return;
          }
          // 为匹配的项添加闪烁效果
          const index = this.cartParts.findIndex(item => item.partno === code);
          if (index !== -1) {
            this.cartParts[index].isBlinking = true;
            // 3秒后停止闪烁
            setTimeout(() => {
              this.cartParts[index].isBlinking = false;
            }, 3000);
          }
          // 3秒后自动进入下一步
          setTimeout(() => {
            this.currentStep = 3;
          }, timer);
        } else if (this.currentStep === 3) {
          this.location = code;
          if (this.selectedPart.goodsNo != null && this.selectedPart.goodsNo !== code) {
            uni.showToast({
              title: '库位号与零件号不匹配',
              icon: 'none'
            });
            return;
          }
          // 直接提交数据
          await this.submitSecondSort();
        }

        uni.showToast({
          title: '扫码成功',
          icon: 'none'
        });
      }
    }
  }
</script>

<style scoped>
  .second-inbound {
    background-color: #f5f5f5;
    min-height: 100vh;
  }

  /* APP环境下添加顶部距离 */
  .app-header {
    margin-top: 24px !important;
  }

  /* 状态栏样式 */
  .status {
    color: #007aff;
    font-size: 14px;
    padding-right: 10px;
  }

  /* 页面内容区 */
  .content {
    padding: 20px;
  }

  /* 步骤指示器使用uni-steps组件，无需自定义样式 */

  /* 表单卡片样式 */
  .form-card {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;
  }

  .form-card:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }

  .form-title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 20px;
  }

  /* 输入组样式 */
  .input-group {
    margin-bottom: 20px;
  }

  .input-label {
    font-size: 14px;
    color: #666666;
    margin-bottom: 8px;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    overflow: hidden;
  }

  .input-icon {
    padding: 0 12px;
  }

  .input {
    flex: 1;
    height: 44px;
    line-height: 44px;
    padding: 0 12px;
    font-size: 16px;
    color: #333333;
    border: none;
    outline: none;
  }

  /* 日志卡片样式 */
  .logs-card {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 20px;
    margin-top: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;
  }

  /* 闪烁边框动画 */
  @keyframes blink {
    0% {
      border-color: #007aff;
    }

    50% {
      border-color: #ff4444;
    }

    100% {
      border-color: #007aff;
    }
  }

  .blink-border {
    animation: blink 0.5s ease-in-out 5;
    border-width: 2px;
  }

  .logs-card:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }

  .logs-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;
  }

  .logs-list {
    max-height: 350px;
    overflow-y: auto;
    padding-right: 8px;
  }

  /* 自定义滚动条 */
  .logs-list::-webkit-scrollbar {
    width: 6px;
  }

  .logs-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .logs-list::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .logs-list::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  .log-item {
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .log-item:hover {
    border-color: #007aff;
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
    transform: translateY(-2px);
  }

  .log-content {
    flex: 1;
    margin-bottom: 12px;
  }

  .log-slip {
    font-size: 15px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
  }

  .log-cart {
    font-size: 14px;
    color: #555555;
  }

  .log-time {
    font-size: 13px;
    color: #007aff;
    font-weight: 500;
  }
</style>