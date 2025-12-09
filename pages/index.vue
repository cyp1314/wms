<template>
	<view :class="{ 'app-header': isApp }">
		<swiper style="width: 100%;">
			<swiper-item v-for="(item, index) in imgs" :key="index">
				<image style="width: 100%; height: 150px;" mode="scaleToFill" :src="item"></image>
			</swiper-item>
		</swiper>
		<uni-section title="入库作业" type="line" padding>
			<uni-grid :column="2" :highlight="true" @change="(e) => change(1, e)">
				<uni-grid-item v-for="(item, index) in rknavs" :index="index" :key="index">
					<view class="grid-item-box" :style="{ backgroundColor: item.color }">
						<uni-icons color="#FFF" custom-prefix="iconfont" :type="item.icon" size="60"></uni-icons>
						<text class="text">{{ item.text }}</text>
					</view>
				</uni-grid-item>
			</uni-grid>
		</uni-section>
		<uni-section title="出库作业" type="line" padding>
			<uni-grid :column="2" :highlight="true" @change="(e) => change(2, e)">
				<uni-grid-item v-for="(item, index) in cknavs" :index="index" :key="index">
					<view class="grid-item-box" :style="{ backgroundColor: item.color }">
						<uni-icons color="#FFF" custom-prefix="iconfont" :type="item.icon" size="60"></uni-icons>
						<text class="text">{{ item.text }}</text>
					</view>
				</uni-grid-item>
			</uni-grid>
		</uni-section>
		<uni-section title="系统设置" type="line" padding>
			<uni-grid :column="2" :highlight="true" @change="(e) => change(3, e)">
				<uni-grid-item v-for="(item, index) in stnavs" :index="index" :key="index">
					<view class="grid-item-box" :style="{ backgroundColor: item.color }">
						<uni-icons color="#FFF" custom-prefix="iconfont" :type="item.icon" size="60"></uni-icons>
						<text class="text">{{ item.text }}</text>
					</view>
				</uni-grid-item>
			</uni-grid>
		</uni-section>
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
				imgs: ['/static/images/lb1.png', '/static/images/lb2.png'],
				rknavs: [{

					url: '/static/sys.png',
					text: '初次分拣',
					color: '#3FB1E3',
					path: '/pages/inbound/once',
					icon: 'icon-a-rukudan3x'
				}, {
					url: '/static/sys.png',
					text: '二次分拣',
					color: '#6BE6C1',
					path: '/pages/inbound/second',
					icon: 'icon-a-shangjiadan3x'
				},
				],
				cknavs: [
					{
						url: '/static/sys.png',
						text: '下架',
						color: '#626C91',
						path: '/pages/outbound/once',
						icon: 'icon-a-ToBzhuangche3x'
					}, {
						url: '/static/sys.png',
						color: '#A0A7E6',
						path: '/pages/outbound/second',
						text: '捆包',
						icon: 'icon-a-gudingbaobiao3x'
					},
				],
				stnavs: [
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
			change(type, e) {
				let {
					index
				} = e.detail
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
<style lang="scss">
	.app-header {
		margin-top: 24px !important;
	}

	.image {
		width: 25px;
		height: 25px;
	}

	.text {
		font-size: 24px;
		margin-top: 12px;
		color: #FFF;
	}

	.grid-item-box {
		flex: 1;
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 15px 0;
	}
</style>