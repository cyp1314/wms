<template>
	<view class="once-inbound" :class="{ 'app-header': isApp }">
		<uni-nav-bar title="入库分拣" left-text="返回" left-icon="left" @clickLeft="navigateBack">

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
				<!-- 入库单号输入 -->
				<view v-if="currentStep === 0" class="input-group">
					<view class="input-label">入库单号</view>
					<view class="input-wrapper">
						<view class="input-icon">
							<uni-icons type="scan" size="20" color="#999999"></uni-icons>
						</view>
						<view class="input" @click="handleScan('slip')">
							{{ dischargeno || '点击扫描入库单号' }}
						</view>
					</view>
				</view>

				<!-- 入库票输入 -->
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

				<!-- 零件号输入 -->
				<view v-if="currentStep === 2" class="input-group">
					<view class="input-label">零件号</view>
					<view class="input-wrapper">
						<view class="input-icon">
							<uni-icons type="scan" size="20" color="#999999"></uni-icons>
						</view>
						<view class="input" @click="handleScan('trace')">
							{{ traceCode || '点击扫描零件号' }}
						</view>
					</view>
				</view>

				<!-- 台车号输入 -->
				<view v-if="currentStep === 3" class="input-group">
					<view class="input-label">台车号</view>
					<view class="input-wrapper">
						<view class="input-icon">
							<uni-icons type="truck" size="20" color="#999999"></uni-icons>
						</view>
						<view class="input" @click="handleScan('cart')">
							{{ cartNo || '点击扫描台车号' }}
						</view>
					</view>
				</view>


			</view>

			<!-- 操作日志 -->
			<view class="logs-card" v-if="inboundDetails.length > 0">
				<view class="logs-title">一次入库列表</view>
				<view class="logs-list">
					<view class="log-item" v-for="inbound in inboundDetails" :key="inbound.id"
						:class="{ 'blink-border': inbound.isBlinking }">
						<view style="display: flex;flex-direction: column;">
							<view class="log-content">
								<view class="log-slip">零件名称：{{ inbound.partname }}</view>
								<view class="log-cart">零件编号：{{ inbound.partno }}</view>
							</view>
							<view style="border: 1px solid #007AFF;margin: 4px 0;"></view>
							<view style="display: flex;flex-direction: row;justify-content: space-between;margin: 0 12px;">
								<view class="log-time">验收数量:{{ inbound.grndataqty }}</view>
								<view class="log-time log_ys">已扫描：{{ inbound.receiveqty }}</view>
							</view>
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
	let timer = 300
	import { scanCode, stopScanCode } from '@/utils/common.js'
	import pdaScanVue from '@/components/pda-scan/pda-scan.vue'
	import { getInboundDetails, getUncompletedInboundTasks, firstSort, firstSortComplete } from '@/api/api';
	export default {
		components: {
			pdaScanVue
		},
		data() {
			return {
				isApp: false, // 是否为APP环境
				steps: ['入库单', '入库票', '零件号', '台车号'],
				stepsOptions: [
					{ title: '入库单' },
					{ title: '入库票' },
					{ title: '零件号' },
					{ title: '台车号' }
				],
				currentStep: 0,
				dischargeno: '',
				inboundTicket: '',
				traceCode: '',
				cartNo: '',
				sortLogs: [],
				inboundDetails: [], // 缓存入库列表
				open: false,
			};
		},
		computed: {
			formTitle() {
				const titles = [
					'第一步：扫描入库单',
					'第二步：扫描入库票',
					'第三步：确认零件号',
					'第四步：扫描台车号'
				];
				return titles[this.currentStep];
			}
		},
		onLoad() {
			getUncompletedInboundTasks({ status: 0 })
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
			async submitCartNo() {
				// 检查是否已达到验收数量
				const index = this.inboundDetails.findIndex(item => item.partno === this.traceCode);
				if (Number(this.inboundDetails[index].receiveqty) === Number(this.inboundDetails[index].grndataqty)) {
					console.log('已验收数量:', this.inboundDetails[index].receiveqty);
				}
				// 调用接口绑定台车号
				await firstSort({
					warehouseno: this.inboundTicket,
					qty: 1,
					partno: this.traceCode,
					cartno: this.cartNo,
				}).then(response => {
					if (response.code === 200) {
						uni.showToast({
							title: '绑定成功',
							icon: 'none'
						});
					} else {
						uni.showToast({
							title: response.msg || '绑定失败',
							icon: 'none'
						});
					}
				});
			},
			// 扫码功能
			async handleScan(type) {
				// 打开扫码组件
				this.open = true;
				scanCode();
			},
			// 获取入库详情
			async fetchInboundDetails(dischargeno) {
				uni.showLoading({
					title: '加载中...'
				});
				await getInboundDetails({ dischargeno: dischargeno })
					.then(response => {
						if (response.data && response.data.length > 0) {
							// 为每个入库详情添加receiveqty字段，默认值为0
							this.inboundDetails = response.data.map(item => ({
								...item,
								receiveqty: 0,
								isBlinking: false
							})).filter(item => Number(item.status) == '0');
							// 判断是否所有货物都已验收
							const allReceived = this.inboundDetails.every(item => Number(item.status) == '1');
							if (allReceived) {
								uni.showModal({
									title: '确认完成入库分拣？',
									content: '确认完成当前批次的入库分拣吗？',
									showCancel: false,
									success: (res) => {
										if (res.confirm) {
											this.inboundDetails = []
											// 通知完成
											firstSortComplete({
												dischargeno: this.dischargeno,
											}).then(response => {
												if (response.code === 200) {
													uni.showToast({
														title: '已完成入库分拣',
														icon: 'none'
													});
												} else {
													uni.showToast({
														title: response.msg || '完成失败',
														icon: 'none'
													});
												}
											});
											// 3秒后自动进入下一步
											setTimeout(() => {
												this.dischargeno = '';
												this.currentStep = 0;
											}, timer);
										}
									}
								});
							} else {
								// 3秒后自动进入下一步
								setTimeout(() => {
									this.currentStep = 1;
								}, timer);
							}
						} else {
							this.dischargeno = '';
							this.inboundDetails = [];
							uni.showToast({
								title: '未获取到入库详情',
								icon: 'none'
							});
						}
					})
					.catch(error => {
						console.error('获取入库详情失败:', error);
						this.dischargeno = '';
						this.inboundDetails = [];
						uni.showToast({
							title: '未获取到入库详情',
							icon: 'none'
						});
					})
					.finally(() => {
						uni.hideLoading();
					});
			},
			// 验证零件号
			validateTraceCode(partno) {
				if (this.inboundDetails.length === 0) {
					return;
				}
				const index = this.inboundDetails.findIndex(item => item.partno === partno);
				if (index === -1) {
					uni.showToast({
						title: '零件号不存在该批货物中',
						icon: 'none'
					});
				} else {
					// 为匹配的项添加闪烁效果
					this.inboundDetails[index].isBlinking = true;

					// 增加receiveqty计数
					this.inboundDetails[index].receiveqty += 1;

					// 3秒后停止闪烁
					setTimeout(() => {
						this.inboundDetails[index].isBlinking = false;
					}, 1000);


					// 3秒后自动进入下一步
					setTimeout(() => {
						this.currentStep = 3;
					}, timer);
				}
			},
			// 处理外部扫码事件
			async handleScanEvent(code) {
				// 关闭扫码组件
				this.open = false;

				if (this.currentStep === 0) {
					this.dischargeno = code;
					// 调用接口获取入库详情
					this.fetchInboundDetails(code);
				} else if (this.currentStep === 1) {
					this.inboundTicket = code;
					uni.showToast({
						title: '入库票扫描成功',
						icon: 'none'
					});
					// 3秒后自动进入下一步
					setTimeout(() => {
						this.currentStep = 2;
					}, timer);
				} else if (this.currentStep === 2) {
					this.traceCode = code;
					// 验证零件号
					this.validateTraceCode(code);
				} else if (this.currentStep === 3) {
					this.cartNo = code;
					// 需要提交
					await this.submitCartNo();
					// 刷新下列表
					this.fetchInboundDetails(this.dischargeno);
					// 3秒后自动完成当前任务并重置状态
					setTimeout(() => {
						// 重置状态，继续下一个物品的处理
						this.inboundTicket = '';
						this.traceCode = '';
						this.cartNo = '';
						this.currentStep = 1;
					}, timer);
				}

				uni.showToast({
					title: '扫码成功',
					icon: 'none'
				});
			},
		},
	}
</script>

<style scoped>
	.once-inbound {
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



	/* 按钮容器样式 */
	.button-container {
		margin-top: 30px;
	}

	.confirm-btn {
		width: 100%;
		height: 48px;
		line-height: 48px;
		background-color: #007aff;
		color: #ffffff;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: bold;
	}

	.confirm-btn:disabled {
		background-color: #cccccc;
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

	.log_ys {
		color: darkgreen;
	}
</style>