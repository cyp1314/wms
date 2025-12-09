<template>
	<view class="inbound-tasks" :class="{ 'app-header': isApp }">
		<uni-nav-bar title="入库任务" left-text="返回" left-icon="left" @clickLeft="navigateBack"></uni-nav-bar>

		<!-- 扫码输入框 -->
		<view class="scan-section">
			<view class="scan-input-wrapper" @click="handleScanInput">
				<view class="scan-input">
					<text v-if="code">{{ code }}</text>
					<text v-else class="placeholder">请扫描条码...</text>
				</view>
				<view class="scan-icon">
					<uni-icons type="scan" size="24" color="#60AEFF"></uni-icons>
				</view>
			</view>
		</view>



		<!-- 任务列表 -->
		<view v-if="tasks && tasks.length > 0" class="task-list">
			<view class="task-item" v-for="(task, index) in tasks" :key="index" @click="navigateToDetails(task)">
				<view class="task-header">
					<text class="task-code">{{ task.code }}</text>
					<view class="task-status" :class="task.statusClass">{{ task.status }}</view>
				</view>
				<text class="task-supplier">{{ task.supplier }}</text>
				<view class="task-info">
					<text class="task-date">{{ task.date }}</text>
				</view>
			</view>
		</view>

		<!-- 无数据时显示empty组件 -->
		<Empty v-else-if="!loading" />
		<!--扫码组件-->
		<pdaScanVue v-if="open" />
	</view>
</template>

<script>
	import {
		scanCode,
		stopScanCode
	} from '@/utils/common.js'
	import pdaScanVue from '@/components/pda-scan/pda-scan.vue'
	import {
		getUncompletedInboundTasks
	} from '@/api/api';
	import Empty from '@/components/empty.vue';
	export default {
		components: {
			Empty,
			pdaScanVue
		},
		data() {
			return {
				open: false,
				tasks: [],
				type: '0',
				loading: false,
				code: '',
				isApp: false // 是否为APP环境
			};
		},
		onLoad(options) {
			// 检测当前平台
			this.isApp = uni.getSystemInfoSync().platform !== 'h5';
			// 从options中获取type参数
			const type = options.type || '0';
			this.type = type;
		},
		onShow() {
			console.log('receive onShow...')
			// 监听扫码结果事件
			uni.$on('scancodedate', (e) => {
				this.open = false
				console.log('监听扫码结果:', e)
				this.code = e;
				this.navigateToDetails({
					dischargeno: e,
					type: this.type
				})
			});
			console.log('receive onShow...')
			this.code = ''
			this.initPage();
		},
		onHide() {
			console.log('receive onHide...')
			this.code = '';
			// 页面隐藏时移除扫码结果事件监听
			uni.$off('scancodedate');
			stopScanCode();
		},
		methods: {
			initPage() {
				// 页面加载时获取入库任务数据
				if (this.type == '0') {
					uni.setNavigationBarTitle({
						title: '初次分拣'
					});
				} else if (this.type == '1') {
					uni.setNavigationBarTitle({
						title: '二次分拣'
					});
				}
				this.fetchInboundTasks(this.type);

			},
			navigateBack() {
				uni.navigateBack();
			},
			// 获取入库任务数据
			fetchInboundTasks(type) {
				this.loading = true;
				getUncompletedInboundTasks({
						status: type
					})
					.then(res => {
						this.loading = false;
						if (res.data && res.data.length) {
							// 将API返回的数据转换为页面所需格式
							this.tasks = res.data.map(item => ({
								dischargeno: item.dischargeno || '',
								code: '卸货单号: ' + (item.dischargeno || ''),
								supplier: '箱号: ' + (item.caseno || ''),
								date: item.createTime,
								status: item.status == '0' ? '未完成分拣' : '已上架',
								statusClass: item.status === '0' ? 'status-processing' : 'status-pending',
							}));
						} else {
							this.tasks = [];
						}
					})
					.catch(err => {
						this.loading = false;
						console.error('获取入库任务失败:', err);
					});
			},
			// 跳转到详情页面
			navigateToDetails(task) {
				uni.navigateTo({
					url: '/pages/inbound/details?dischargeno=' + task.dischargeno + '&type=' + this.type
				});
			},
			handleScanInput() {
				this.open = true
				scanCode();
			}
		}
	}
</script>

<style scoped>
	.inbound-tasks {
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.scan-section {
		background-color: #ffffff;
		padding: 15px;
		margin-bottom: 10px;
	}

	/* APP环境下添加顶部距离 */
	.app-header {
		margin-top: 24px !important;
	}

	.scan-input-wrapper {
		display: flex;
		align-items: center;
		background-color: #f5f5f5;
		border-radius: 8px;
		padding: 0 10px;
		cursor: pointer;
	}

	.scan-input {
		flex: 1;
		height: 40px;
		font-size: 14px;
		background-color: transparent;
		border: none;
		display: flex;
		align-items: center;
		color: #333333;
	}

	.placeholder {
		color: #999999;
	}

	.scan-icon {
		padding: 8px;
	}

	.task-list {
		padding: 10px;
	}

	.task-item {
		background-color: #ffffff;
		border-radius: 8px;
		padding: 15px;
		margin-bottom: 10px;
		border-left: 4px solid #60AEFF;
	}

	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.task-code {
		font-size: 16px;
		font-weight: bold;
		color: #333333;
	}

	.task-status {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		color: #ffffff;
	}

	.status-pending {
		background-color: #F97316;
	}

	.status-processing {
		background-color: #3B82F6;
	}

	.task-supplier {
		display: block;
		font-size: 14px;
		color: #666666;
		margin-bottom: 8px;
	}

	.task-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.task-date {
		font-size: 12px;
		color: #999999;
	}

	.task-progress {
		font-size: 12px;
		color: #3B82F6;
		font-weight: 500;
	}
</style>