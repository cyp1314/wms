<template>
	<view class="content"></view>
</template>
<script>
	export default {
		data() {
			return {
				main: ''
			}
		},
		onHide: function () {
			console.log('pda-scan onHide...')
			if (uni.getSystemInfoSync().platform === 'android') {
				this.stopScan();
			}
		},
		destroyed: function () {
			console.log('pda-scan destroyed...')
			// 页面退出时一定要卸载监听,否则下次进来时会重复，造成扫一次出2个以上的结果
			if (uni.getSystemInfoSync().platform === 'android') {
				this.stopScan();
			}
		},
		created() {
			console.log('pda-scan created...', uni.getSystemInfoSync().platform)
			if (uni.getSystemInfoSync().platform === 'android') {
				this.init();
			}
		},
		methods: {
			init() {
				this.main = plus.android.runtimeMainActivity(); //获取activity
				let context = plus.android.importClass('android.content.Context'); //上下文
				let receiver = plus.android.implements('io.dcloud.feature.internal.reflect.BroadcastReceiver', {
					onReceive: this.doReceive
				});
				this.receiver = receiver;
				let IntentFilter = plus.android.importClass('android.content.IntentFilter');
				let Intent = plus.android.importClass('android.content.Intent');
				let filter = new IntentFilter();

				filter.addAction("com.service.scanner.data"); //监听扫描,根据设备的广播动作进行更换


				this.doS(receiver, filter);
			},
			doS(receiver, filter) {
				this.main.registerReceiver(receiver, filter);
			},
			doReceive(context, intent) {
				//通过intent实例引入intent类，方便以后的‘.’操作
				plus.android.importClass(intent);
				let barcodeData = intent.getStringExtra("ScanCode"); //获取扫描结果
				uni.$emit('scancodedate', barcodeData)
			},
			stopScan() {
				this.main.unregisterReceiver(this.receiver);
			},
		}
	}
</script>

<style>
	.content {
		text-align: center;
	}
</style>
