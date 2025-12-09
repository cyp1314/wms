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
			<view v-if="currentStep === 0" class="form-card">
				<view class="form-title">绑定拣货台车</view>
				<view class="input-group">
					<text class="input-label">扫描台车码</text>
					<view class="input-wrapper">
						<input type="text" v-model="cartNo" placeholder="扫描周转台车" class="input" />
						<button class="scan-btn" @click="handleScan('cart')">扫描</button>
					</view>
				</view>
				<button class="confirm-btn warning" @click="handlePickScan('cart')">开始任务</button>
			</view>

			<view v-else class="form-card">
				<view class="form-title">商品下架扫描</view>
				<view class="current-pick">
					<text class="current-pick-label">Current Pick</text>
					<text class="current-pick-name">后视镜总成 (左)</text>
					<text class="current-pick-loc">Loc: C-05-11</text>
					<text class="current-pick-cart">Target Cart: {{ cartNo }}</text>
				</view>
				<view class="input-group">
					<text class="input-label">扫描货物码</text>
					<view class="input-wrapper">
						<input type="text" v-model="goodsCode" placeholder="确认商品" class="input" />
						<button class="scan-btn" @click="handleScan('goods')">扫描</button>
					</view>
				</view>
				<button class="confirm-btn warning" @click="handlePickScan('goods')">确认下架</button>
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
				cartNo: '', // 台车号
				goodsCode: '', // 货物码
				stepsOptions: [
					{ title: '扫台车' },
					{ title: '扫货物' }
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
				if (type === 'cart') {
					this.cartNo = 'P-CART-01';
					this.handlePickScan('cart');
				} else if (type === 'goods') {
					this.goodsCode = 'G-12345';
					this.handlePickScan('goods');
				}
			},
			// 处理扫码事件
			handleScanEvent(data) {
				if (this.currentStep === 0) {
					this.cartNo = data;
					this.handlePickScan('cart');
				} else {
					this.goodsCode = data;
					this.handlePickScan('goods');
				}
			},
			// 处理拣货扫描
			handlePickScan(type) {
				if (type === 'cart') {
					if (!this.cartNo) {
						uni.showToast({
							title: '请扫描台车',
							icon: 'none'
						});
						return;
					}
					this.currentStep = 1;
				} else if (type === 'goods') {
					uni.showToast({
						title: '下架成功！放入台车。',
						icon: 'none'
					});
					this.goodsCode = ''; // 重置货物码，准备下一个商品
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
		border-radius: 8px;
		padding: 20px;
		margin-top: 20px;
	}

	.form-title {
		font-size: 16px;
		font-weight: bold;
		color: #333333;
		margin-bottom: 20px;
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
		border: none;
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
	}

	.confirm-btn.warning {
		background-color: #FF9500;
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
</style>