<template>
	<view class="normal-login-container">
		<view class="logo-content align-center justify-center flex-column">
			<view class="logo-circle">
				<image style="width: 60vw;" :src="globalConfig.appInfo.logo" mode="widthFix">
				</image>
			</view>
		</view>
		<view class="login-form-content">
			<text class="input-label">账号</text>
			<view class="input-item flex align-center">
				<input v-model="loginForm.username" class="input" type="text" placeholder="请输入工号/用户名" maxlength="30" />
			</view>
			<text class="input-label">密码</text>
			<view class="input-item flex align-center">
				<input v-model="loginForm.password" type="password" class="input" placeholder="请输入密码" maxlength="20" />
			</view>
			<view class="action-btn">
				<button @click="handleLogin" class="login-btn cu-btn block bg-blue lg round">登录</button>
			</view>
		</view>
		<view class="device-id" style="display: flex;flex-direction: column;text-align: center;">
			<text class="title">WMS手持终端</text>
			<text class="subtitle">仓库管理系统 v2.0</text>
		</view>
	</view>
</template>

<script>
	import pdaScanVue from '@/components/pda-scan/pda-scan.vue'
	import {
		wechatLogin,
		getWechatPhoneNumber
	} from '@/api/login'
	import {
		getToken,
		setToken
	} from '@/utils/auth'
	export default {
		components: {
			pdaScanVue
		},
		data() {
			return {
				codeUrl: "",
				captchaEnabled: false,
				// 用户注册开关
				register: false,
				globalConfig: getApp().globalData.config,
				loginForm: {
					username: "yg01",
					password: "123456",
					code: "",
					uuid: ""
				},
				activity: null,
			}
		},
		created() {
			this.getCode()
		},
		onLoad() {
			//#ifdef H5
			if (getToken()) {
				this.$tab.reLaunch('/pages/index')
			}
			//#endif
		},
		methods: {
			send() {
				this.activity = plus.android.runtimeMainActivity();
				var Intent = plus.android.importClass("android.content.Intent");
				var intent = new Intent("com.service.scanner.start.scanning");
				this.activity.sendBroadcast(intent);
			},
			// 用户注册
			handleUserRegister() {
				this.$tab.redirectTo(`/pages/register`)
			},
			// 隐私协议
			handlePrivacy() {
				let site = this.globalConfig.appInfo.agreements[0]
				this.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
			},
			// 用户协议
			handleUserAgrement() {
				let site = this.globalConfig.appInfo.agreements[1]
				this.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
			},
			// 获取图形验证码
			getCode() {
				if (this.captchaEnabled) {
					getCodeImg().then(res => {
						this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
						if (this.captchaEnabled) {
							this.codeUrl = 'data:image/gif;base64,' + res.img
							this.loginForm.uuid = res.uuid
						}
					})
				}

			},
			// 登录方法
			async handleLogin() {
				if (this.loginForm.username === "") {
					this.$modal.msgError("请输入账号")
				} else if (this.loginForm.password === "") {
					this.$modal.msgError("请输入密码")
				} else if (this.loginForm.code === "" && this.captchaEnabled) {
					this.$modal.msgError("请输入验证码")
				} else {
					this.$modal.loading("登录中，请耐心等待...")
					this.pwdLogin()
				}
			},
			// 密码登录
			async pwdLogin() {
				this.$store.dispatch('Login', this.loginForm).then(() => {
					this.$modal.closeLoading()
					this.loginSuccess()
				}).catch(() => {
					if (this.captchaEnabled) {
						this.getCode()
					}
				})
			},
			// 登录成功后，处理函数
			loginSuccess(result) {
				// 设置用户信息
				this.$store.dispatch('GetInfo').then(res => {
					this.$tab.reLaunch('/pages/index')
				})
			},

			// 微信一键登录获取手机号
			async onGetPhoneNumber(e) {
				if (e.detail.errMsg === 'getPhoneNumber:ok') {
					try {
						this.$modal.loading('微信登录中...')

						// 调用获取手机号接口
						const {
							encryptedData,
							iv,
							code
						} = e.detail
						const phoneRes = await getWechatPhoneNumber(code, encryptedData, iv)
						console.log('phoneRes', phoneRes)
						if (phoneRes.code === 200) {
							setToken(phoneRes.msg)
							this.$store.commit('SET_TOKEN', phoneRes.msg)
							this.loginSuccess()
						} else {
							this.$modal.msgError(phoneRes.msg || '获取手机号失败')
						}
					} catch (error) {
						console.error('微信登录失败:', error)
						this.$modal.msgError('微信登录失败，请稍后重试')
					} finally {
						this.$modal.closeLoading()
					}
				} else {
					this.$modal.msgError('请允许获取手机号以完成微信登录')
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: #1a1a2e;
		color: #ffffff;
	}

	.normal-login-container {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: -80px;

		.logo-content {
			width: 100%;
			text-align: center;
			margin-bottom: 60rpx;

			.logo-circle {
				display: flex;
				justify-content: center;
				align-items: center;
				margin: 0 auto 30rpx;
			}

			.title {
				font-size: 40rpx;
				font-weight: bold;
				color: #ffffff;
				margin-bottom: 10rpx;
			}

			.subtitle {
				font-size: 24rpx;
				color: #a0a0a0;
			}
		}

		.login-form-content {
			text-align: left;
			width: 80%;
			max-width: 400px;

			.input-label {
				display: block;
				font-size: 40rpx;
				color: #0f3460;
				margin-bottom: 15rpx;
				font-weight: bolder;
			}

			.input-item {
				margin-bottom: 40rpx;
				background-color: #16213e;
				height: 100rpx;
				border-radius: 8rpx;
				border: 1px solid #0f3460;

				.input {
					width: 100%;
					font-size: 40rpx;
					line-height: 20px;
					text-align: left;
					padding: 0 20rpx;
					color: #ffffff;
					font-weight: bolder;
					background-color: transparent;
				}

				.input::placeholder {
					color: #666;
				}

			}

			.login-btn {
				margin-top: 60rpx;
				height: 100rpx;
				font-size: 32rpx;
				font-weight: bold;
				background-color: #0f3460;
				border: none;
			}

			.login-btn::after {
				border: none;
			}
		}

		.device-id {
			position: absolute;
			bottom: 50rpx;
			font-size: 24rpx;
			color: #666;
		}
	}
</style>