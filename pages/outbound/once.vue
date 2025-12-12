<template>
	<view class="once-outbound" :class="{ 'app-header': isApp }">
		<uni-nav-bar title="一次出库" left-text="返回" left-icon="left" @clickLeft="navigateBack"></uni-nav-bar>
		<!-- 步骤指示器 -->
		<view style="background-color: #FFF;margin: 10px 0 0 0;padding: 10px;">
			<uni-steps :options="stepsOptions" :active="currentStep" active-color="#FF9500"></uni-steps>
		</view>
		<!-- 页面内容区 -->
		<view class="content">
			<!-- 步骤内容 -->
			<view class="form-card">
				<view class="form-title">
					{{ formTitle }}
				</view>
				<!-- 发票号输入 -->
				<view v-if="currentStep === 0" class="input-group">
					<view class="input-label">发票号</view>
					<view class="input-wrapper">
						<view class="input-icon">
							<uni-icons type="scan" size="20" color="#999999"></uni-icons>
						</view>
						<view class="input" @click="handleScan('saleno')">
							{{ saleno || '点击扫描发票号' }}
						</view>
					</view>
				</view>

				<!-- 出库票据输入 -->
				<view v-if="currentStep === 1" class="input-group">
					<view class="input-label">出库票据</view>
					<view class="input-wrapper">
						<view class="input-icon">
							<uni-icons type="scan" size="20" color="#999999"></uni-icons>
						</view>
						<view class="input" @click="handleScan('ticketno')">
							{{ ticketno || '点击扫描出库票据' }}
						</view>
					</view>
				</view>

				<!-- 零件号输入 -->
				<view v-if="currentStep === 2" class="input-group">
					<view class="input-label">零件号</view>
					<view class="input-wrapper">
						<view class="input-icon">
							<uni-icons type="scan" size="20" color="#999999"></uni-icons>
						</view>
						<view class="input" @click="handleScan('partno')">
							{{ partno || '点击扫描零件号' }}
						</view>
					</view>
				</view>

				<!-- 台车号输入 -->
				<view v-if="currentStep === 3" class="input-group">
					<view class="input-label">台车号</view>
					<view class="input-wrapper">
						<view class="input-icon">
							<uni-icons type="scan" size="20" color="#999999"></uni-icons>
						</view>
						<view class="input" @click="handleScan('cartno')">
							{{ cartNo || '点击扫描台车号' }}
						</view>
					</view>
				</view>
			</view>

			<!-- 出库明细列表 -->
			<view class="logs-card" v-if="outboundDetails.length > 0">
				<view class="logs-title">出库明细列表</view>
				<view class="logs-list">
					<view class="log-item" v-for="item in outboundDetails" :key="item.ticketno"
						:class="{ 'blink-border': item.isBlinking }">
						<view style="display: flex;flex-direction: column;">
							<view class="log-content">
								<view class="log-slip">零件名称：{{ item.partname }}</view>
								<view class="log-cart">零件编号：{{ item.partno }}</view>
							</view>
							<view style="border: 1px solid #FF9500;margin: 4px 0;"></view>
							<view style="display: flex;flex-direction: row;justify-content: space-between;margin: 0 12px;">
								<view class="log-time">出库数量:{{ item.invqty }}</view>
								<view class="log-time log_ys">出库票号：{{ item.ticketno }}</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 扫码组件 -->
		<pdaScanVue v-if="open"></pdaScanVue>
	</view>
</template>

<script>
	let timer = 300
	import { scanCode, stopScanCode } from '@/utils/common.js'
	import pdaScanVue from '@/components/pda-scan/pda-scan.vue';
	import { getOutboundDetails, scanOutbound } from '@/api/api';
	export default {
		components: {
			pdaScanVue
		},
		data() {
			return {
				isApp: false, // 是否为APP环境
				currentStep: 0, // 当前步骤
				saleno: '', // 发票号
				ticketno: '', // 出库票据
				partno: '', // 零件号
				cartNo: '', // 台车号
				steps: ['发票号', '出库票据', '零件号', '台车号'],
				stepsOptions: [
					{ title: '发票号' },
					{ title: '出库票据' },
					{ title: '零件号' },
					{ title: '台车号' }
				], // 步骤配置
				open: false, // 扫码组件显示状态
				outboundDetails: [], // 出库明细列表
				currentItem: null // 当前选中的出库明细项
			};
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
			uni.$off('scancodedate', this.handleScanEvent);
			// 停止扫码
			stopScanCode();
		},
		computed: {
			formTitle() {
				const titles = [
					'第一步：扫描发票号',
					'第二步：扫描出库票据',
					'第三步：确认零件号',
					'第四步：扫描台车号'
				];
				return titles[this.currentStep];
			}
		},
		methods: {
			navigateBack() {
				uni.navigateBack();
			},
			// 扫码
			handleScan(type) {
				this.open = true;
				// 调用扫码工具函数
				scanCode();
			},
			// 处理扫码事件
			handleScanEvent(data) {
				// 关闭扫码组件
				this.open = false;

				if (this.currentStep === 0) {
					this.saleno = data;
					uni.showToast({
						title: '发票号扫描成功！',
						icon: 'none'
					});
					this.handlePickScan('saleno');
				} else if (this.currentStep === 1) {
					this.ticketno = data;
					uni.showToast({
						title: '出库票据扫描成功！',
						icon: 'none'
					});
					this.handlePickScan('ticketno');
				} else if (this.currentStep === 2) {
					this.partno = data;
					uni.showToast({
						title: '零件号扫描成功！',
						icon: 'none'
					});
					this.handlePickScan('partno');
				} else if (this.currentStep === 3) {
					this.cartNo = data;
					uni.showToast({
						title: '台车号扫描成功！',
						icon: 'none'
					});
					this.handlePickScan('cartno');
				}
			},
			// 获取出库明细
			async fetchOutboundDetails(saleno) {
				uni.showLoading({
					title: '加载中...'
				});
				try {
					const response = await getOutboundDetails({ saleno: saleno });
					if (response.data && response.data.length > 0) {
						this.outboundDetails = response.data.map(item => ({
							...item,
							isBlinking: false
						}));
						uni.showToast({
							title: '获取出库明细成功',
							icon: 'none'
						});
						// 3秒后自动进入下一步
						setTimeout(() => {
							this.currentStep = 1;
						}, timer);
					} else {
						this.saleno = '';
						this.outboundDetails = [];
						uni.showToast({
							title: '未获取到出库明细',
							icon: 'none'
						});
					}
				} catch (error) {
					this.saleno = '';
					this.outboundDetails = [];
					console.error('获取出库明细失败:', error);
					uni.showToast({
						title: '获取出库明细失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			// 处理拣货扫描
			handlePickScan(type) {
				if (type === 'saleno') {
					if (!this.saleno) {
						uni.showToast({
							title: '请扫描发票号',
							icon: 'none'
						});
						return;
					}
					// 调用接口获取出库明细
					this.fetchOutboundDetails(this.saleno);
				} else if (type === 'ticketno') {
					if (!this.ticketno) {
						uni.showToast({
							title: '请扫描出库票据',
							icon: 'none'
						});
						return;
					}
					// 根据ticketno查找对应的出库明细
					const item = this.outboundDetails.find(item => item.ticketno === this.ticketno);
					if (item) {
						this.currentItem = item;
						// 为匹配的项添加闪烁效果
						item.isBlinking = true;
						setTimeout(() => {
							item.isBlinking = false;
						}, 3000);
						// 3秒后自动进入下一步
						setTimeout(() => {
							this.currentStep = 2;
						}, timer);
					} else {
						uni.showToast({
							title: '未找到对应的出库票据',
							icon: 'none'
						});
						this.ticketno = ''
					}
				} else if (type === 'partno') {
					if (!this.partno) {
						uni.showToast({
							title: '请扫描零件号',
							icon: 'none'
						});
						return;
					}
					// 验证零件号是否与当前选中的item一致
					if (this.currentItem && this.currentItem.partno === this.partno) {
						// 3秒后自动进入下一步
						setTimeout(() => {
							this.currentStep = 3;
						}, timer);
					} else {
						uni.showToast({
							title: '零件不在本次出库范围',
							icon: 'none'
						});
						this.partno = ''
					}
				} else if (type === 'cartno') {
					if (!this.cartNo) {
						uni.showToast({
							title: '请扫描台车号',
							icon: 'none'
						});
						return;
					}

					// 检查item的invqty是否大于1
					if (this.currentItem && this.currentItem.invqty > 1) {
						// 显示弹窗
						uni.showModal({
							title: '出库提示',
							content: `该出库单的零件号数量为${this.currentItem.invqty}`,
							showCancel: false,
							success: (res) => {
								if (res.confirm) {
									// 调用scanOutbound接口
									this.scanOutbound();
								}
							}
						});
					} else {
						// 直接调用scanOutbound接口
						this.scanOutbound();
					}
				}
			},
			// 调用扫描出库接口
			async scanOutbound() {
				uni.showLoading({
					title: '出库中...'
				});
				try {
					const response = await scanOutbound({
						ticketno: this.ticketno,
						partno: this.partno,
						cartno: this.cartNo,
						qty: this.currentItem.invqty
					});
					if (response.code === 200) {
						uni.showToast({
							title: '出库成功！',
							icon: 'success'
						});
						// 调用getOutboundDetails接口刷新数据
						const refreshResponse = await getOutboundDetails({ saleno: this.saleno });
						this.outboundDetails = refreshResponse.data.map(item => ({
							...item,
							isBlinking: false
						})).filter(item => item.status == '0');
						if (this.outboundDetails.length > 0) {
							// 重置当前步骤，继续下一个出库任务
							setTimeout(() => {
								this.ticketno = '';
								this.partno = '';
								this.cartNo = '';
								this.currentItem = null;
								this.currentStep = 1;
							}, 1500);
						} else {
							// 数据长度为0，回到第一步
							this.outboundDetails = [];
							uni.showToast({
								title: '本次出库任务已完成',
								icon: 'none'
							});
							setTimeout(() => {
								this.saleno = '';
								this.ticketno = '';
								this.partno = '';
								this.cartNo = '';
								this.currentItem = null;
								this.currentStep = 0;
							}, 1500);
						}
					} else {
						uni.showToast({
							title: response.msg || '出库失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('出库失败:', error);
					uni.showToast({
						title: '出库失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			}
		}
	}
</script>

<style scoped>
	.once-outbound {
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	/* APP环境下添加顶部距离 */
	.app-header {
		margin-top: 24px !important;
	}

	.content {
		padding: 20px;
	}



	/* 表单卡片 */
	.form-card {
		background-color: #ffffff;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 20px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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

	/* 当前拣货信息 */
	.current-pick {
		background-color: #f5f5f5;
		border: 1px dashed #e0e0e0;
		border-radius: 8px;
		padding: 15px;
		margin-bottom: 20px;
	}

	.current-pick-label {
		display: block;
		font-size: 12px;
		color: #999999;
		margin-bottom: 8px;
	}

	.current-pick-name {
		display: block;
		font-size: 18px;
		font-weight: bold;
		color: #333333;
		margin-bottom: 4px;
	}

	.current-pick-loc {
		display: block;
		font-size: 16px;
		color: #FF9500;
		margin-bottom: 8px;
	}

	.current-pick-cart {
		display: block;
		font-size: 14px;
		color: #666666;
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
		border-color: #FF9500;
		box-shadow: 0 4px 12px rgba(255, 149, 0, 0.15);
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
		color: #FF9500;
		font-weight: 500;
	}

	/* 数量统计行样式 */
	.log-item>view[style*="flex-direction: column"]>view:nth-child(2) {
		border: none;
		height: 1px;
		background: linear-gradient(to right, transparent, #e0e0e0, transparent);
		margin: 12px 0;
	}

	.log-item>view[style*="flex-direction: column"]>view:nth-child(3) {
		padding: 0;
	}

	.empty-logs {
		text-align: center;
		padding: 40px 0;
		color: #999999;
		font-size: 14px;
	}

	/* 闪烁边框动画 */
	@keyframes blink {
		0% {
			border-color: #FF9500;
		}

		50% {
			border-color: #ff4444;
		}

		100% {
			border-color: #FF9500;
		}
	}

	.blink-border {
		animation: blink 0.5s ease-in-out 5;
		border-width: 2px;
	}

	.log_ys {
		color: darkgreen;
	}
</style>