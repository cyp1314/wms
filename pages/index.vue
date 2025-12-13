<template>
	<view :class="{ 'app-header': isApp }">
		<swiper style="width: 100%;height: 190px;" :autoplay="true" :interval="3000">
			<swiper-item v-for="(item, index) in imgs" :key="index">
				<image style="width: 100%; height: 190px;" mode="scaleToFill" :src="item"></image>
			</swiper-item>
		</swiper>
		<!-- 入库作业 -->
		<view class="section">
			<view class="section-title">入库作业</view>
			<view class="grid-container">
				<view v-for="(item, index) in rknavs" :key="index" class="grid-item" @click="handleItemClick(1, index)">
					<view class="grid-item-box">
						<uni-icons color="#FFF" custom-prefix="iconfont" :type="item.icon" size="80"></uni-icons>
						<text class="text">{{ item.text }}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 出库作业 -->
		<view class="section">
			<view class="section-title">出库作业</view>
			<view class="grid-container">
				<view v-for="(item, index) in cknavs" :key="index" class="grid-item" @click="handleItemClick(2, index)">
					<view class="grid-item-box">
						<uni-icons color="#FFF" custom-prefix="iconfont" :type="item.icon" size="80"></uni-icons>
						<text class="text">{{ item.text }}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 系统设置 -->
		<view class="section" v-if="false">
			<view class="section-title">系统设置</view>
			<view class="grid-container">
				<view v-for="(item, index) in stnavs" :key="index" class="grid-item" @click="handleItemClick(3, index)">
					<view class="grid-item-box">
						<uni-icons color="#FFF" custom-prefix="iconfont" :type="item.icon" size="80"></uni-icons>
						<text class="text">{{ item.text }}</text>
					</view>
				</view>
			</view>
		</view>

				<!-- 版权信息 -->
		<view class="copyright">
			<text>Copyright © 2025 新疆润新技术有限公司 </text>
			<text>All Rights Reserved 版权所有</text>
		</view>
	</view>

	
</template>
<script>
	import {
		mapState
	} from 'vuex'
	import {
		md5
	} from '@/utils/md5.js'
	import {
		scanCode,
		stopScanCode
	} from '@/utils/common.js'

	export default {
		onShow() {
			// 检测当前平台
			this.isApp = uni.getSystemInfoSync().platform !== 'h5';
			console.log('isapp:', this.isApp, uni.getSystemInfoSync().platform)
			stopScanCode()
		},
		computed: {
			...mapState({
				user: state => state.user
			})
		},
		data() {
			return {
				// #96DEE8
				isApp: false,
				imgs: ['/static/images/lb1.png'],
				rknavs: [{

					url: '/static/sys.png',
					text: '初次分拣',
					color: '#3375ed',
					path: '/pages/inbound/once',
					icon: 'icon-a-rukudan3x'
				}, {
					url: '/static/sys.png',
					text: '二次分拣',
					color: '#f5c036',
					path: '/pages/inbound/second',
					icon: 'icon-a-shangjiadan3x'
				},
				],
				cknavs: [
					{
						url: '/static/sys.png',
						text: '下架',
						color: '#419d4a',
						path: '/pages/outbound/once',
						icon: 'icon-a-ToBzhuangche3x'
					}, {
						url: '/static/sys.png',
						color: '#dd4134',
						path: '/pages/outbound/second',
						text: '捆包',
						icon: 'icon-a-gudingbaobiao3x'
					},
				],
				stnavs: [
					{
						url: '/static/sys.png',
						text: '打印测试',
						color: '#C4EBAD',
						path: '/pages/print',
						icon: 'icon-a-xitong3x'
					},
					{
						url: '/static/sys.png',
						text: '系统设置',
						color: '#C4EBAD',
						path: '/pages/mine/index',
						icon: 'icon-a-xitong3x'
					},
				],

			}
		},
		onReady() { },
		onUnload() { },
		methods: {
			// 处理网格项点击事件
			handleItemClick(type, index) {
				const navs = type === 1 ? this.rknavs : type === 2 ? this.cknavs : this.stnavs
				const navItem = navs[index]
				if (navItem.path) {
					uni.navigateTo({
						url: navItem.path
					})
				} else {
					uni.showToast({
						title: `待开发...`,
						icon: 'none'
					})
				}
			},
		}
	}
</script>
<style scoped lang="scss">
	.app-header {
		margin-top: 24px !important;
	}

	.image {
		width: 25px;
		height: 25px;
	}

	.text {
		font-size: 18px;
		margin-top: 12px;
		color: #FFF;
		font-weight: bold;
	}

	/* 自定义section样式 */
	.section {
		padding: 20rpx;
		margin-bottom: 20rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		padding-bottom: 10rpx;
		border-bottom: 1px solid #eee;
	}

	/* 自定义grid布局 */
	.grid-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
	}

	.grid-item {
		padding: 10rpx;
	}

	.grid-item-box {
		height: 160px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}

	/* 入库作业第一个 - 蓝色渐变 */
	.section:nth-of-type(1) .grid-container .grid-item:nth-child(1) .grid-item-box {
		background: linear-gradient(120deg, #1E3A8A 0%, #3B82F6 50%, #60A5FA 100%);
	}
	
	/* 入库作业第二个 - 黄色渐变 */
	.section:nth-of-type(1) .grid-container .grid-item:nth-child(2) .grid-item-box {
		background: linear-gradient(120deg, #B45309 0%, #F59E0B 50%, #FBBF24 100%);
	}
	
	/* 出库作业第一个 - 绿色渐变 */
	.section:nth-of-type(2) .grid-container .grid-item:nth-child(1) .grid-item-box {
		background: linear-gradient(120deg, #166534 0%, #22C55E 50%, #4ADE80 100%);
	}
	
	/* 出库作业第二个 - 红色渐变 */
	.section:nth-of-type(2) .grid-container .grid-item:nth-child(2) .grid-item-box {
		background: linear-gradient(120deg, #991B1B 0%, #EF4444 50%, #F87171 100%);
	}
	/* 版权信息样式 */
	.copyright {
		position: static;
		bottom: 60px;
		height: 40px;

		text-align: center;
		font-size: 14px;
		color: #999999;
		// margin-top: 80px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100vw;
	}
</style>