<script>
	import config from './config'
	import {
		getToken
	} from '@/utils/auth'
	import { scanCode, stopScanCode } from '@/utils/common.js'

	export default {
		onLaunch: function() {
			this.initApp()
		},
		onHide() {
			stopScanCode()
		},
		data() {
			return {
				locationRunning: false,
				location: null,
				locationError: null
			}
		},

		methods: {
			// 初始化应用
			initApp() {
				// 初始化应用配置
				this.initConfig()
				// 检查用户登录状态
				//#ifdef H5
				this.checkLogin()
				//#endif
			},
			initConfig() {
				this.globalData.config = config
			},
			checkLogin() {
				if (!getToken()) {
					this.$tab.reLaunch('/pages/login')
				}
			}
		}
	}
</script>

<style lang="scss">
	@import '@/static/scss/index.scss'
</style>