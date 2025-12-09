<template>
	<view class="details-container" :class="{ 'app-header': isApp }">
		<uni-nav-bar :title="dischargeno" left-text="返回" left-icon="left" @clickLeft="navigateBack"></uni-nav-bar>

		<!-- 台车号显示区域 -->
		<view v-if="carNumber" class="car-number-section">
			<text class="car-number-label">台车号:</text>
			<text class="car-number-value">{{ carNumber }}</text>
		</view>

		<!-- 有数据时显示content-wrapper -->
		<view v-if="productList && productList.length > 0" class="content-wrapper">
			<!-- 进度条 -->
			<view class="progress-section">
				<view class="progress-header">
					<text class="progress-label">总进度</text>
					<text class="progress-percentage">{{ totalProgress }}%</text>
				</view>
				<view class="progress-bar">
					<view class="progress-fill" :style="{ width: totalProgress + '%' }"></view>
				</view>
			</view>



			<!-- 商品列表 -->
			<view class="product-list">
				<view class="product-item" v-for="(product, index) in productList" :key="index"
					:class="{ 'blinking': product.isBlinking }">
					<view class="product-header">
						<text class="product-code">{{ '零件号:' + product.code }}</text>
						<text class="product-status">{{ product.status }}</text>
					</view>
					<text class="product-name">{{ '零件名称:' + product.name }}</text>
					<view class="product-count">
						<text class="product-receive">应收: {{ product.receiveCount }}</text>
						<text class="product-scanned" :class="{ 'scanned': product.scannedCount > 0 }">已扫: {{ product.scannedCount
						}}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 无数据时显示empty组件 -->
		<Empty v-else-if="!loading" :text="'暂无商品信息'" :subtext="'当前卸货单下暂无零件信息'" />


		<!-- 底部按钮 -->
		<view v-if="productList && productList.length > 0" class="bottom-buttons">
			<button class="simulate-button" @click="simulateScan">扫描</button>
			<button v-if="isOk()" class="submit-button" @click="submit">{{ type == 0 ? '初次分拣完成' : '二次分拣完成' }}</button>
		</view>

		<!-- 台车号扫描弹窗 -->
		<uni-popup ref="carNumberPopup" type="center" :mask-click="false">
			<view class="popup-content">
				<text class="popup-title">请扫描台车号</text>
				<button class="scan-button" @click="scanCarNumber">扫描台车号</button>
			</view>
		</uni-popup>

		<!--扫码组件-->
		<pdaScanVue v-if="open" />
	</view>

</template>

<script>
	import { scanCode, stopScanCode } from '@/utils/common.js'
	import pdaScanVue from '@/components/pda-scan/pda-scan.vue'
	import {
		getInboundDetails,
		firstSort,
		firstSortComplete,
		secondSort,
		secondSortComplete
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
				dischargeno: '',
				totalProgress: 0,
				productList: [],
				loading: false,
				error: '',
				type: 0,
				carNumber: '',
				popupVisible: false,
				flag: '', //使用扫码的标志位
				isApp: false, // 是否为APP环境
			};
		},
		onLoad(options) {
			// 检测当前平台
			this.isApp = uni.getSystemInfoSync().platform !== 'h5';
			// 如果从列表页传递了参数，可以在这里接收
			if (options.dischargeno) {
				this.type = options.type || 0;
				this.dischargeno = options.dischargeno;
				console.log('dischargeno:', this.dischargeno, 'type:', this.type);
				// 从API获取数据
				this.fetchInboundDetails();
				// 如果是二次分拣(type==1)，弹出台车号扫描弹窗
				if (this.type == 1) {
					this.$nextTick(() => {
						this.$refs.carNumberPopup.open();
					});
				}
			} else {
				this.error = '缺少必要的参数';
			}
		},
		onShow() {
			console.log('onShow called');
			// 页面显示时添加扫码结果事件监听
			uni.$on('scancodedate', (partno) => {
				console.log('result:', partno)
				if (this.flag == '1') {
					// 扫描零件号
					this.dealScanCode(partno);
				} else if (this.flag == '2') {
					// 扫描台车号
					this.carNumber = partno;
				}
				this.open = false
			});
		},
		onHide() {
			// 页面隐藏时移除扫码结果事件监听
			uni.$off('scancodedate');
		},
		onUnload() {
			console.log('details onUnload...')
			stopScanCode();
			// 页面卸载时移除扫码结果事件监听
			uni.$off('scancodedate');
		},
		methods: {
			dealScanCode(partno) {
				// 查找扫描到的商品
				let product = this.productList.find(p => p.code === partno);
				console.log(product);
				if (!product) {
					// 商品不存在
					uni.showToast({
						title: '不存在该货物，请重新扫描',
						icon: 'none'
					});
					return;
				}

				// 清除所有商品的闪烁效果
				this.productList.forEach(item => {
					delete item.isBlinking;
				});

				// 将当前商品移到列表第一个位置
				const productIndex = this.productList.findIndex(p => p.code === partno);
				if (productIndex > 0) {
					// 移除当前商品
					const [currentProduct] = this.productList.splice(productIndex, 1);
					// 添加到列表开头
					this.productList.unshift(currentProduct);
					// 更新product引用
					product = currentProduct;
				}

				// 为当前商品添加闪烁效果
				product.isBlinking = true;
				// 3秒后自动移除闪烁效果
				setTimeout(() => {
					product.isBlinking = false;
				}, 3000);

				// 未超过数量，直接增加
				product.scannedCount++;
				// 更新总进度
				this.calculateTotalProgress();
				uni.showToast({
					title: `扫描成功: ${product.code}`,
					icon: 'none'
				});

				// 检查是否超过接收数量
				if (product.scannedCount == product.receiveCount) {
					// 发送请求
					if (this.type == '0') {
						// 初次分拣
						firstSort({
							dischargeno: this.dischargeno,
							warehouseno: product.warehouseno,
							qty: product.scannedCount
						}).then(response => {
							if (response && response.code == 200) {
								// 根据API返回的数据结构调整
								product.status = '完成';
								// 更新总进度
								this.calculateTotalProgress();
								uni.showToast({
									title: `初次分拣成功: ${product.code}`,
									icon: 'none'
								});
							} else {
								uni.showToast({
									title: '初次分拣失败，请重试',
									icon: 'none'
								});
							}
						}).catch(error => {
							uni.showToast({
								title: '初次分拣失败，请重试',
								icon: 'none'
							});
							console.error('初次分拣失败:', error);
						});
					} else {
						// 二次分拣
						secondSort({
							cartno: this.carNumber,
							dischargeno: this.dischargeno,
							warehouseno: product.warehouseno,
							total: product.scannedCount
						}).then(response => {
							if (response && response.code == 200) {
								// 根据API返回的数据结构调整
								product.status = '完成';
								// 更新总进度
								this.calculateTotalProgress();
								uni.showToast({
									title: `二次分拣成功: ${product.code}`,
									icon: 'none'
								});
							} else {
								uni.showToast({
									title: '二次分拣失败，请重试',
									icon: 'none'
								});
							}
						}).catch(error => {
							uni.showToast({
								title: '二次分拣失败，请重试',
								icon: 'none'
							});
							console.error('二次分拣失败:', error);
						});
					}
				}
			},
			isOk() {
				// productList中所有scannedCount和receiveCount都相等
				return this.productList.every(product => product.scannedCount == product.receiveCount);
			},
			// 从API获取入库详情
			fetchInboundDetails() {
				this.error = '';
				this.loading = true;

				getInboundDetails({
					// 使用卸货单号作为参数
					dischargeno: this.dischargeno
				}).then(response => {
					this.loading = false;
					if (response && response.data) {
						// 根据API返回的数据结构调整
						this.productList = response.data.map(item => ({
							...item,
							code: item.partno || '',
							name: item.partname || '',
							receiveCount: item.grndataqty,
							scannedCount: 0,
							status: item.grndataqty == item.scannedCount ? '完成' : '待扫'
						}));
						// 计算总进度
						this.calculateTotalProgress();
					} else {
						this.productList = [];
					}
				}).catch(error => {
					this.loading = false;
					this.error = '获取数据失败，请重试';
					console.error('获取入库详情失败:', error);
				});
			},
			// 返回上一页
			navigateBack() {
				uni.navigateBack();
			},
			// 模拟激光扫描
			simulateScan() {
				this.open = true
				this.flag = '1'
				scanCode();
			},
			// 提交
			submit() {
				uni.showModal({
					title: '确认提交',
					content: '确定要提交当前入库信息吗？',
					success: (res) => {
						if (res.confirm) {
							if (this.type == '0') {
								firstSortComplete({
									dischargeno: this.dischargeno
								}).then(response => {
									if (response && response.code == 200) {
										uni.showToast({
											title: '初次分拣完成成功',
											icon: 'none'
										});
										this.back();
									} else {
										uni.showToast({
											title: '初次分拣完成失败，请重试',
											icon: 'none'
										});
									}
								}).catch(error => {
									uni.showToast({
										title: '初次分拣完成失败，请重试',
										icon: 'none'
									});
									console.error('初次分拣完成失败:', error);
								});
							} else if (this.type == '1') {
								secondSortComplete({
									dischargeno: this.dischargeno
								}).then(response => {
									if (response && response.code == 200) {
										uni.showToast({
											title: '二次分拣完成成功',
											icon: 'none'
										});
										this.back();
									} else {
										uni.showToast({
											title: '二次分拣完成失败，请重试',
											icon: 'none'
										});
									}
								}).catch(error => {
									uni.showToast({
										title: '二次分拣完成失败，请重试',
										icon: 'none'
									});
									console.error('二次分拣完成失败:', error);
								});
							}
						}
					}
				});
			},
			// 返回上一页
			back() {
				// 延迟返回上一页
				setTimeout(() => {
					this.navigateBack();
				}, 1500);
			},
			// 计算总进度
			calculateTotalProgress() {
				const totalReceive = this.productList.reduce((sum, p) => sum + Number.parseInt(p.receiveCount), 0);
				const totalScanned = this.productList.reduce((sum, p) => sum + p.scannedCount, 0);
				console.log(totalReceive, totalScanned);
				if (totalReceive > 0) {
					this.totalProgress = Math.round((totalScanned / totalReceive) * 100);
				} else {
					this.totalProgress = 0;
				}
			},
			// 扫描台车号
			scanCarNumber() {
				this.open = true
				this.flag = '2'
				scanCode();
				// 关闭弹窗
				this.$refs.carNumberPopup.close();
			}
		}
	}
</script>

<style scoped>
	.details-container {
		background-color: #f5f5f5;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* 台车号显示区域样式 */
	.car-number-section {
		background-color: #ffffff;
		padding: 12px 15px;
		margin-bottom: 10px;
		border-bottom: 1px solid #e5e5e5;
	}

	.car-number-label {
		font-size: 14px;
		color: #666666;
		margin-right: 8px;
	}

	.car-number-value {
		font-size: 16px;
		font-weight: bold;
		color: #333333;
	}

	.content-wrapper {
		flex: 1;
		overflow-y: auto;
		padding-bottom: 10px;
	}

	/* APP环境下添加顶部距离 */
	.app-header {
		margin-top: 24px !important;
	}

	.progress-section {
		background-color: #ffffff;
		padding: 15px;
		margin-bottom: 10px;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.progress-label {
		font-size: 14px;
		color: #666666;
	}

	.progress-percentage {
		font-size: 16px;
		font-weight: bold;
		color: #60AEFF;
	}

	.progress-bar {
		height: 8px;
		background-color: #e5e5e5;
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background-color: #60AEFF;
		border-radius: 4px;
		transition: width 0.3s ease;
	}



	.product-list {
		background-color: #ffffff;
		padding: 10px;
		min-height: 0;
		/* 解决flex子元素溢出问题 */
	}

	.product-item {
		padding: 15px;
		border-bottom: 1px solid #f0f0f0;
	}

	.product-item:last-child {
		border-bottom: none;
	}

	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.product-code {
		font-size: 16px;
		font-weight: bold;
		color: #333333;
	}

	.product-status {
		font-size: 12px;
		color: #999999;
		padding: 2px 8px;
		background-color: #f5f5f5;
		border-radius: 10px;
	}

	.product-name {
		display: block;
		font-size: 14px;
		color: #666666;
		margin-bottom: 12px;
	}

	.product-count {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.product-receive {
		font-size: 14px;
		color: #999999;
	}

	.product-scanned {
		font-size: 14px;
		color: #ff4d4f;
	}

	.product-scanned.scanned {
		color: #52c41a;
	}

	/* 闪烁边框动画 */
	.blinking {
		animation: blink-border 1s infinite alternate;
	}

	@keyframes blink-border {
		0% {
			border: 2px solid transparent;
		}

		100% {
			border: 2px solid #60AEFF;
		}
	}

	.bottom-buttons {
		display: flex;
		background-color: #ffffff;
		padding: 10px;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
		z-index: 10;
		position: sticky;
		bottom: 10px;
	}

	.simulate-button {
		flex: 1;
		height: 48px;
		background-color: #ffb703;
		color: #ffffff;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		margin-right: 10px;
	}

	.submit-button {
		flex: 1;
		height: 48px;
		background-color: #60AEFF;
		color: #ffffff;
		border: none;
		border-radius: 8px;
		font-size: 16px;
	}

	/* 弹窗样式 */
	.popup-content {
		width: 60vw;
		padding: 30px 20px;
		background-color: #ffffff;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.popup-title {
		font-size: 18px;
		font-weight: bold;
		color: #333333;
		margin-bottom: 20px;
	}

	.scan-button {
		width: 40vw;
		height: 48px;
		background-color: #60AEFF;
		color: #ffffff;
		border: none;
		border-radius: 24px;
		font-size: 16px;
	}
</style>