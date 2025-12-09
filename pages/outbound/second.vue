<template>
	<view class="second-outbound" :class="{ 'app-header': isApp }">
		<uni-nav-bar title="二次出库" left-text="返回" left-icon="left" @clickLeft="navigateBack"></uni-nav-bar>

		<!-- 页面内容区 -->
		<view class="content">
			<!-- 步骤指示器 -->
			<uni-steps :options="stepsOptions" :active="currentStep" active-color="#FF9500"></uni-steps>

			<!-- 步骤内容 -->
			<view class="form-card" :class="{ 'step-active': currentStep === 0 }">
				<view class="input-group">
					<text class="input-label">1. 扫描箱号</text>
					<view class="input-wrapper">
						<input type="text" v-model="boxNo" placeholder="关联包装箱" class="input" :autofocus="currentStep === 0" />
						<button class="scan-btn" @click="handleScan('box')">扫描</button>
					</view>
				</view>
				<button v-if="currentStep === 0" class="confirm-btn secondary" @click="handlePackScan('box')">
					<text class="btn-icon">🖨️</text> 打印箱贴 & 确认
				</button>
			</view>

			<view v-if="currentStep >= 1" class="form-card" :class="{ 'step-active': currentStep === 1 }">
				<view class="input-group">
					<text class="input-label">2. 录入容积 (可选)</text>
					<input type="number" v-model="volume" placeholder="输入体积 m³" class="input" :autofocus="currentStep === 1" />
				</view>
				<button v-if="currentStep === 1" class="confirm-btn warning" @click="handlePackScan('volume')">确认容积</button>
			</view>

			<view v-if="currentStep >= 2" class="form-card" :class="{ 'step-active': currentStep === 2 }">
				<view class="input-group">
					<text class="input-label">3. 扫描出库单货物码</text>
					<view class="input-wrapper">
						<input type="text" v-model="packGoods" placeholder="核对商品" class="input" :autofocus="currentStep === 2" />
						<button class="scan-btn" @click="handleScan('goods')">扫描</button>
					</view>
				</view>
			</view>

			<view v-if="currentStep >= 3" class="form-card" :class="{ 'step-active': currentStep === 3 }">
				<view class="input-group">
					<text class="input-label">4. 扫描零件号</text>
					<view class="input-wrapper">
						<input type="text" v-model="packTrace" placeholder="最终溯源" class="input" :autofocus="currentStep === 3" />
						<button class="scan-btn" @click="handleScan('trace')">扫描</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		components: {},
		data() {
			return {
				isApp: false, // 是否为APP环境
				currentStep: 0, // 当前步骤
				boxNo: '', // 箱号
				volume: '', // 容积
				packGoods: '', // 商品码
				packTrace: '', // 零件号
				stepsOptions: [
					{ title: '箱号/打印' },
					{ title: '容积' },
					{ title: '商品' },
					{ title: '溯源' }
				] // 步骤配置
			};
		},
		onLoad() {
			// 检测当前平台
			this.isApp = uni.getSystemInfoSync().platform !== 'h5';
			// 监听扫码事件
			if (this.isApp) {
				// APP环境下监听扫码事件
				uni.$on('scanCode', this.handleScanEvent);
			}
		},
		onUnload() {
			// 移除扫码事件监听
			if (this.isApp) {
				uni.$off('scanCode', this.handleScanEvent);
			}
		},
		methods: {
			navigateBack() {
				uni.navigateBack();
			},
			// 模拟扫码
			handleScan(type) {
				if (type === 'box') {
					this.boxNo = 'BOX-2023-999';
				} else if (type === 'goods') {
					this.packGoods = 'OUT-G-001';
					this.handlePackScan('goods');
				} else if (type === 'trace') {
					this.packTrace = 'TR-OUT-999';
					this.handlePackScan('trace');
				}
			},
			// 处理扫码事件
			handleScanEvent(data) {
				if (this.currentStep === 0) {
					this.boxNo = data;
				} else if (this.currentStep === 2) {
					this.packGoods = data;
					this.handlePackScan('goods');
				} else if (this.currentStep === 3) {
					this.packTrace = data;
					this.handlePackScan('trace');
				}
			},
			// 处理捆包扫描
			handlePackScan(type) {
				if (type === 'box') {
					if (!this.boxNo) {
						uni.showToast({
							title: '请输入或扫描箱号',
							icon: 'none'
						});
						return;
					}
					// 模拟打印
					uni.showToast({
						title: `箱号 ${this.boxNo} 标签打印中...`,
						icon: 'none'
					});
					this.currentStep = 1;
				} else if (type === 'volume') {
					this.currentStep = 2;
				} else if (type === 'goods') {
					this.currentStep = 3;
				} else if (type === 'trace') {
					uni.showToast({
						title: '装箱校验通过！封箱。',
						icon: 'none'
					});
					// 重置表单，准备下一个箱子
					this.currentStep = 0;
					this.boxNo = '';
					this.volume = '';
					this.packGoods = '';
					this.packTrace = '';
				}
			}
		}
	}
</script>

<style scoped>
	.second-outbound {
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
		border-radius: 8px;
		padding: 20px;
		margin-top: 20px;
	}

	/* 当前步骤高亮 */
	.step-active {
		border: 2px solid #FF9500;
	}

	/* 输入组 */
	.input-group {
		margin-bottom: 20px;
	}

	.input-label {
		display: block;
		font-size: 14px;
		color: #666666;
		margin-bottom: 8px;
	}

	.input-wrapper {
		display: flex;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		overflow: hidden;
	}

	.input {
		flex: 1;
		height: 44px;
		padding: 0 15px;
		font-size: 14px;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		outline: none;
	}

	.scan-btn {
		height: 44px;
		line-height: 44px;
		padding: 0 20px;
		background-color: #f5f5f5;
		border: none;
		border-left: 1px solid #e0e0e0;
		font-size: 14px;
		color: #666666;
	}

	/* 确认按钮 */
	.confirm-btn {
		height: 44px;
		line-height: 44px;
		width: 100%;
		border: none;
		border-radius: 4px;
		font-size: 16px;
		font-weight: bold;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.confirm-btn.secondary {
		background-color: #f5f5f5;
		color: #333333;
		border: 1px solid #e0e0e0;
	}

	.confirm-btn.warning {
		background-color: #FF9500;
	}

	/* 按钮图标 */
	.btn-icon {
		margin-right: 8px;
	}
</style>