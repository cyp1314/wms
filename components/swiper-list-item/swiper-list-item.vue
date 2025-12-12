<!-- 在这个文件对每个tab对应的列表进行渲染 -->
<template>
	<view class="content">
		<z-paging v-if="firstLoaded || isCurrentPage" ref="paging" v-model="dataList" @query="queryList" :fixed="false">
			<view style="padding: 12px 0;" v-for="(item, index) in dataList" :key="index">
				<uni-section :title="`运单号：${item.waybillNo}`" type="line">
					<view style="padding: 0 0 12px 0;position: relative;">
						<view @click="getYdDetailHandler(item.id)" class="item-count">
							<span>查看详情</span>
						</view>
						<uni-card :title="`${item.order.receiverAddress}`" :extra="`承运人:${item.driversName}`">
							<view style="padding: 12px 0;display: flex;flex-direction: column;position: relative">
								<view style="display: flex;gap: 6px;">
									<image src="/static/logo.png" style="width: 24px;height: 24px;"></image>
									<view>收件人:<text class="v_nr">{{ item.order.receiverName }}</text></view>
								</view>
								<view style="display: flex;gap: 6px;">
									<image src="/static/logo.png" style="width: 24px;height: 24px;"></image>
									<view>电话:<text class="v_nr">{{ item.order.receiverPhone }}</text></view>
								</view>
								<view style="display: flex;gap: 6px;">
									<image src="/static/logo.png" style="width: 24px;height: 24px;"></image>
									<view>地址:<text class="v_nr">{{ item.order.receiverAddress }}</text></view>
								</view>
								<view :style="{ color: color, border: ' 1px dotted ' + color }"
									style="right: 0;position: absolute;padding: 6px;border-radius: 50%;font-size: 16px;font-weight: 700;">
									{{ item.waybillStatusDes }}
								</view>
								<view style="display: flex;margin-top: 24px;">
									<view class="footRoute-con">
										<view v-if="user.deptId == 111 && item.waybillStatus == 1" class="btn"
											@click="openPopup('装车', item.id, item.waybillNo)">装车</view>
										<view v-if="user.deptId == 111 && item.waybillStatus == 2"" class=" btn"
											@click="openPopup('发车', item.id, item.waybillNo)">发车</view>
										<view v-if="user.deptId == 111 && item.waybillStatus == 3"" class=" btn"
											@click="openPopup('转单', item.id, item.waybillNo)">转单</view>
										<view v-if="user.deptId == 111 && item.waybillStatus == 3"" class=" btn"
											@click="openPopup('完成', item.id, item.waybillNo)">完成</view>
										<view v-if="user.deptId == 112 && item.waybillStatus == 4"" class=" btn"
											@click="openPopup('签收', item.id, item.waybillNo)">签收</view>
										<view class="btn" @click="itemClick(item)">查看轨迹</view>
									</view>
								</view>
							</view>
						</uni-card>
					</view>
				</uni-section>
			</view>
		</z-paging>
		<!-- 表单弹窗 -->
		<uni-popup ref="formPopup" type="center" :mask-click="false">
			<view class="popup-form-container">
				<view class="popup-title">{{ propTitile }}</view>
				<uni-forms ref="form" :model="formData" :rules="rules">
					<template v-if="propTitile == '装车' || propTitile == '发车' || propTitile == '签收' || propTitile == '完成'">
						<uni-forms-item label="是否异常" name="abnormal" label-width="80px">
							<uni-data-checkbox v-model="formData.abnormal" :localdata="abnormals" />
						</uni-forms-item>
						<uni-forms-item label="备注" name="content" label-width="80px">
							<uni-easyinput v-model="formData.content" type="textarea" placeholder="请输入内容" />
						</uni-forms-item>
						<uni-forms-item label="图片" name="files" label-width="80px">
							<uni-file-picker v-model="formData.files" limit="3" file-mediatype="image" mode="grid" del-icon
								:preview-full-image="true" @select="handleSelect" @success="handleSuccess" @fail="handleFail" />
						</uni-forms-item>
					</template>
					<template v-else>
						<uni-forms-item label="转单人姓名" name="transferName" label-width="120px">
							<uni-easyinput v-model="formData.transferName" type="text" placeholder="请输入转单人姓名" />
						</uni-forms-item>
						<uni-forms-item label="转单人手机号" name="transferPhone" label-width="120px">
							<uni-easyinput v-model="formData.transferPhone" type="number" placeholder="请输入转单人手机号" />
						</uni-forms-item>
						<uni-forms-item label="转单人身份证号" name="transferIdCard" label-width="120px">
							<uni-easyinput v-model="formData.transferIdCard" type="text" placeholder="请输入转单人身份证号码" />
						</uni-forms-item>
						<uni-forms-item label="车牌号码" name="transferPlate" label-width="120px">
							<uni-easyinput v-model="formData.transferPlate" type="text" placeholder="请输入车牌号码" />
						</uni-forms-item>
						<uni-forms-item label="备注" name="content" label-width="120px">
							<uni-easyinput v-model="formData.content" type="textarea" placeholder="请输入内容" />
						</uni-forms-item>
					</template>

				</uni-forms>
				<view class="popup-buttons">
					<button size="mini" type="default" class="btn-cancel" @click="closePopup">取消</button>
					<button size="mini" type="primary" class="btn-submit" @click="submitForm">提交</button>
					<button v-if="propTitile == '转单'" size="mini" type="primary" class="btn-submit" @click="zjzd">直接转单</button>
				</view>
			</view>
		</uni-popup>

		<!-- 二维码弹窗 -->
		<uni-popup ref="qrCodePopup" type="center">
			<view class="qr-code-container">
				<view class="qr-code-header">
					<text class="qr-code-title">转单二维码</text>
					<text class="qr-code-close" @click="closeQrCodePopup">×</text>
				</view>
				<view class="qr-code-body" style="z-index: 9999999;">
					<tki-qrcode v-if="qrResult" :size="300" cid="qrcode1" ref="qrcode" :val="val" :usingComponents="true"
						@result="qrR" />
				</view>
				<view class="qr-code-footer">
					<text class="qr-code-tip">请截图保存二维码</text>
				</view>
			</view>
		</uni-popup>

		<!-- 运单详情弹窗 -->
		<uni-popup ref="detailPopup" type="center" :mask-click="false">
			<view class="detail-popup-container">
				<view class="detail-popup-header">
					<text class="detail-popup-title">运单详情</text>
					<text class="detail-popup-close" @click="closeDetailPopup">×</text>
				</view>
				<view class="detail-popup-body">
					<view>
						<view class="detail-item">
							<text class="detail-label">司机姓名:</text>
							<text class="detail-value">{{ waybillDetail.driversName }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">司机电话:</text>
							<text class="detail-value">{{ waybillDetail.driversPhone }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">司机车牌:</text>
							<text class="detail-value">{{ waybillDetail.licensePlate }}</text>
						</view>
					</view>
					<!-- 步骤条，竖向排列显示数据-->
					<view class="vertical-steps">
						<view class="step-item" v-for="(step, index) in waybillDetail.waybillHistoryList" :key="step.id">
							<!-- 步骤连接线 - 除了最后一个步骤外都显示 -->
							<view class="step-line line-active" v-if="index > stepsData.length - 1"></view>
							<!-- 步骤节点 -->
							<view class="step-node node-active">
								<view class="step-icon-active">
									<text class="iconfont">{{ index + 1 }}</text>
								</view>
							</view>
							<!-- 步骤内容 -->
							<view class="step-content" :class="{
								'content-completed': stepsData.length - 1 === index,
								'content-active': stepsData.length - 1 === index,
								'content-pending': stepsData.length - 1 === index
							}">
								<view class="step-title">{{ step.waybillStatusDes }}</view>
								<view class="step-desc">说明：{{ step.remark }}</view>
								<view class="step-desc">时间：{{ step.createTime }}</view>
							</view>
						</view>
					</view>

				</view>
				<view class="detail-popup-footer">
					<button size="mini" type="primary" class="detail-popup-close-btn" @click="closeDetailPopup">关闭</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import tkiQrcode from '@/components/tki-qrcode/tki-qrcode.vue'
	import config from '@/config'
	import {
		getToken
	} from '@/utils/auth'
	import {
		sC,
		getEwm,
		addSj,
		postLoc,
		getUserOrder,
		getYdDetail,
		submitOrder
	} from '@/api/api.js'
	import {
		startBackgroundLocation,
		stopBackgroundLocation
	} from '@/utils/locationService'
	import {
		mapState
	} from 'vuex'
	export default {
		components: {
			tkiQrcode
		},
		computed: {
			...mapState({
				user: state => state.user
			})
		},
		onHide() {
			// 页面隐藏时停止定位服务
			if (this.isLocationRunning) {
				this.stopLocationService()
			}
		},
		onUnload() {
			// 页面卸载时停止定位服务
			if (this.isLocationRunning) {
				this.stopLocationService()
			}
		},
		data() {
			return {
				qrResult: false,
				fcs: '',
				lastTime: '',
				val: '123456',
				status: '',
				color: '',
				// v-model绑定的这个变量不要在分页请求结束中自己赋值！！！
				dataList: [],
				// 当前组件是否已经加载过了
				firstLoaded: false,
				// 是否滚动到当前页
				isCurrentPage: false,
				// 单选数据源
				abnormals: [{
					text: '正常',
					value: 0
				}, {
					text: '异常',
					value: 1
				}],
				isLocationRunning: false,
				propTitile: '',
				// 表单数据
				formData: {
					waybillNo: '',
					waybillId: '',
					abnormal: '',
					content: '',
					files: [],
					transferName: '',
					transferPhone: '',
					transferIdCard: '',
					transferPlate: ''
				},
				// 上传状态控制
				uploading: false,
				uploadSuccess: false,
				uploadError: false,
				progress: 0,
				errorMsg: '',

				// 一个标识，确保一次只上传一个文件（或者根据需求批量上传）
				isUploading: false,
				qrCodeData: '',
				// 运单详情相关
				detailPopupVisible: false,
				waybillDetail: {},
				detailItems: [],
				detailObjects: [],
				// 步骤条数据
				stepsData: [],
				// 表单验证规则
				rules: {
					abnormal: {
						rules: [{
							required: true,
							errorMessage: '请选择是否异常'
						}]
					},
					transferName: {
						rules: [{
							required: true,
							errorMessage: '请输入转单人姓名'
						}]
					},
					transferPhone: {
						rules: [{
							required: true,
							errorMessage: '请输入转单人手机号'
						},
						{
							format: 'number',
							errorMessage: '请输入正确的手机号'
						}
						]
					},
					transferIdCard: {
						rules: [{
							required: true,
							errorMessage: '请输入转单人身份证号码'
						},
						{
							format: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
							errorMessage: '请输入正确的身份证号码'
						}
						]
					}
				}
			}
		},
		props: {
			// 当前组件的index，也就是当前组件是swiper中的第几个
			tabIndex: {
				type: Number,
				default: function () {
					return 0
				}
			},
			// 当前swiper切换到第几个index
			currentIndex: {
				type: Number,
				default: function () {
					return 0
				}
			}
		},
		watch: {
			currentIndex: {
				handler(newVal) {
					switch (newVal) {
						case 0:
							this.status = '派送中'
							this.color = '#1F9A44'
							break;
						case 1:
							this.status = '待收货'
							this.color = '#1F9A44'
							break;
						case 2:
							this.status = '已完成'
							this.color = '#1F9A44'
							break;
						default:
							break;
					}
					console.log('vvv', newVal)
					if (newVal === this.tabIndex) {
						// 懒加载，当滑动到当前的item时，才去加载
						if (!this.firstLoaded) {
							// 这里需要延迟渲染z-paging的原因是为了避免在一些平台上立即渲染可能引发的底层报错问题
							this.$nextTick(() => {
								setTimeout(() => {
									this.isCurrentPage = true;
								}, 100);
							})
						}
					}
				},
				immediate: true
			},
		},
		methods: {
			zjzd() {
				getEwm(this.formData.waybillId).then(res => {
					if (res && res.code === 200) {
						this.val = res.data // 二维码内容
						this.aaa()
					}
				})
			},
			qrR(e) {
				console.log('pic:', e)
			},
			async aaa() {
				this.$refs.qrCodePopup.open();
				await this.$nextTick();
				this.qrResult = true
				await this.$nextTick();
				this.$nextTick(() => {
					setTimeout(() => {
						this.$refs.qrcode._makeCode()
						console.log('---------------123')
					}, 10)
				})
			},
			getYdDetailHandler(no) {
				// 显示加载中提示
				this.$modal.loading('获取运单详情中...');
				getYdDetail(no).then(res => {
					// 关闭加载提示
					this.$modal.closeLoading();
					// 判断接口返回是否成功
					if (res && res.code === 200) {
						// 保存运单详情数据
						this.waybillDetail = res.data;
						// 打开运单详情弹窗
						this.openDetailPopup();
					} else {
						// 显示接口返回的错误信息
						this.$modal.alert(res.message || '获取运单详情失败', '提示');
					}
				}).catch(err => {
					// 关闭加载提示
					this.$modal.closeLoading();
					// 显示请求失败信息
					console.error('获取运单详情失败:', err);
					this.$modal.msgError('获取运单详情失败，请稍后重试');
				})
			},
			// 打开运单详情弹窗
			openDetailPopup() {
				this.$refs.detailPopup.open();
			},
			// 关闭运单详情弹窗
			closeDetailPopup() {
				this.$refs.detailPopup.close();
			},
			qrR(res) {
				console.log('rrr', res);
			},
			// 接收父组件传过来的刷新列表要求
			reload() {
				this.$nextTick(() => {
					// 刷新列表数据(如果不希望列表pageNum被重置可以用refresh代替reload方法)
					this.$refs.paging && this.$refs.paging.reload();
				})
			},
			queryList(pageNum, pageSize) {
				console.log('user:', this.user)
				const params = {
					pageNum: pageNum,
					pageSize: pageSize,
					status: this.tabIndex + 1
				}
				getUserOrder(params).then(res => {
					//将请求的结果数组传递给z-paging
					this.$refs.paging.complete(res.rows);
					this.firstLoaded = true;
					// 查询是否有再整运行的订单，然后发送定位
					sC().then(res => {
						if (res.code == 200 && res.data) {
							console.log('发车列表:', res.data)
							this.fcs = res.data
							if (this.fcs) {
								this.startLocationService()
							}
						}
					})
				}).catch(res => {
					this.$refs.paging.complete(false);
				})
			},
			itemClick(item) {
				console.log(item)
				// item对下传递下运单详情
				uni.navigateTo({
					url: '/pages/gj?data=' + JSON.stringify(item),
				})
			},
			// 打开弹窗
			openPopup(title, waybillId, waybillNo) {
				if (title == '完成') {
					// 判断是否在附近
					const centerLng = 116.39765;
					const centerLat = 39.90736;

					uni.getLocation({
						type: 'wgs84',
						success(res) {
							const d = haversine(res.longitude, res.latitude, centerLng, centerLat);
							console.log('距离:', d)
							if (d <= 2000) {
								// 在范围内
								uni.showToast({
									title: '在范围内',
									icon: 'none'
								});
							} else {
								// 超出范围
								uni.showToast({
									title: `您当前位置距离目的地较远，不能点击完成`,
									icon: 'none'
								});
								return
							}
						}
					})
				}
				console.log(title, waybillId, waybillNo)
				this.propTitile = title
				this.formData.waybillId = waybillId
				this.formData.waybillNo = waybillNo
				this.$refs.formPopup.open()
			},
			// 关闭弹窗
			closePopup() {
				// 清除表单校验信息
				if (this.$refs.form) {
					this.$refs.form.clearValidate()
				}
				// 重置表单数据
				this.resetForm()
				// 关闭弹窗
				this.$refs.formPopup.close()
			},
			// 提交表单
			async submitForm() {
				console.log('this.formData.waybillId:', this.formData.waybillId)
				// 根据当前操作类型决定要验证的字段
				let fields = ['abnormal', 'content']

				// 如果是转单操作，需要验证转单人相关字段
				if (this.propTitile == '转单') {
					fields = fields.concat(['transferName', 'transferPhone'])
				}

				this.$refs.form.validate(fields).then(async (res) => {
					// 这里可以添加提交逻辑
					console.log('表单数据：', this.formData, res)
					// 显示提交成功提示
					this.$modal.msgSuccess('提交成功')

					// 发送请求
					let data = {}
					if (this.propTitile == '转单') {
						// 先注册用户
						addSj({
							"name": this.formData.transferName,
							"phone": this.formData.transferPhone,
							"idNumber": this.formData.transferIdCard,
							"licensePlate": this.formData.transferPlate
						}).then(res => {
							if (res && res.code === 200) {
								// 注册成功
								console.log('注册成功')
							} else {
								// 注册失败
								console.log('注册失败:', res.message || '注册失败')
							}
						}).catch(err => {
							// 注册请求失败
							console.error('注册请求失败:', err)
						})
						getEwm(this.formData.waybillId).then(res => {
							if (res && res.code === 200) {
								this.val = res.data // 二维码内容
								this.aaa()
							}
						})
					} else {
						data.waybillId = this.formData.waybillId
						data.remark = this.formData.content
						data.attachment = this.formData.files.map(item => item.name).join(',')
						data.abnormal = this.formData.abnormal
					}
					// 如果是转单操作，获取并显示二维码
					if (this.propTitile == '转单') {
						// 关闭表单弹窗
						this.$refs.formPopup.close()
					} else {
						submitOrder(data, this.propTitile).then(res => {
							// 判断接口返回是否成功
							if (res && res.code === 200) {
								// 显示接口返回的成功信息
								this.$modal.alert(res.message || '操作成功', '提示');
								// 刷新列表数据
								this.reload();
							} else {
								// 显示接口返回的错误信息
								this.$modal.alert(res.message || '操作失败', '提示');
							}
						}).catch(err => {
							// 显示请求失败信息
							console.error('操作失败:', err);
							this.$modal.msgError('操作失败，请稍后重试');
						})

						// 关闭弹窗
						this.closePopup()
					}

					// 重置表单
					this.resetForm()

					if (this.propTitile == '发车') {
						// 发车获取列表
						sC().then(res => {
							if (res.code == 200) {
								this.fcs = res.data.waybillNo
							}
						})
						this.startLocationService()
					}
					if (this.propTitile == '完成') {
						this.stopLocationService()
					}
				})
			},
			// 关闭二维码弹窗
			closeQrCodePopup() {
				this.$refs.qrCodePopup.close();
				this.qrResult = false
				// 关闭二维码弹窗后重置表单状态
				this.resetForm();
			},
			// 重置表单
			resetForm() {
				this.formData = {
					abnormal: '',
					content: '',
					files: [],
					transferName: '',
					transferPhone: '',
					transferIdCard: '',
					waybillId: '',
					waybillNo: ''
				}
			},
			// 文件选择回调,选择文件后触发
			handleSelect(e) {
				console.log('用户选择的文件信息:', e);

				if (this.isUploading) {
					uni.showToast({
						title: '请等待当前上传完成',
						icon: 'none'
					});
					return;
				}
				// 获取选中的临时文件路径
				const tempFiles = e.tempFiles;
				if (!tempFiles || tempFiles.length === 0) {
					return;
				}

				const tempFilePath = tempFiles[0].path;

				// 开始上传
				this.uploadFileToMyServer(tempFilePath);
				console.log(this.formData.files)
			},
			uploadFileToMyServer(tempFilePath) {
				this.isUploading = true;
				this.uploading = true;
				this.uploadSuccess = false;
				this.uploadError = false;

				// 【重要】替换成你的后端上传接口地址
				const uploadUrl = config.baseUrl + '/common//upload';
				uni.uploadFile({
					url: uploadUrl, // 你的上传地址
					filePath: tempFilePath, // 小程序临时文件路径
					name: 'file', // 后端接收文件的字段名，例如 PHP 用 $_FILES['file']，Java 用 MultipartFile file
					header: {
						// 如果你的接口需要认证，在这里添加 header
						'Authorization': 'Bearer ' + getToken(),
						'Content-Type': 'multipart/form-data' // 通常不需要手动设置，uni-app会自动处理
					},
					// 可以额外上传一些其他表单数据
					formData: {
						'userId': '12345',
						'type': 'avatar'
					},
					success: (res) => {
						this.uploading = false;
						// **关键步骤：处理后端返回的数据**
						// res.data 是一个字符串，你需要用 JSON.parse 解析
						try {
							const serverResponse = JSON.parse(res.data);
							if (serverResponse.code === 200) {
								// 将后端返回的文件URL更新到 imageList 中
								// @input 事件会因此被触发，你也可以在这里手动更新
								this.formData.files.push({
									"name": serverResponse.url,
									"extname": "png,jpg",
									"url": serverResponse.url
								});
								this.uploadSuccess = true;

								// 1秒后重置成功状态，方便下次上传
								setTimeout(() => {
									this.uploadSuccess = false;
								}, 2000);
							} else {
								// 后端返回了业务逻辑错误
								throw new Error(serverResponse.message || '上传失败');
							}
						} catch (e) {
							this.uploadError = true;
							this.errorMsg = e.message || '解析服务器响应失败';
							console.error(e);
						}
					},
					fail: (err) => {
						console.error('上传失败:', err);
						this.uploading = false;
						this.uploadError = true;
						this.errorMsg = err.errMsg || '网络请求失败，请重试';
					},
					complete: () => {
						this.isUploading = false;
					}
				});
			},
			// 文件上传成功回调,上传成功触发
			handleSuccess(e) {
				console.log('上传成功：', e)
			},
			// 文件上传失败回调,上传失败触发
			handleFail(e) {
				console.log('上传失败：', e)
				this.$modal.msgError('文件上传失败，请重试')
			},
			// 启动定位服务
			startLocationService() {
				try {
					startBackgroundLocation(this.handleLocationUpdate, 5)
					this.isLocationRunning = true
					console.log('后台定位服务已启动')
				} catch (error) {
					console.error('启动定位服务失败', error)
				}
			},
			// 停止定位服务
			stopLocationService() {
				stopBackgroundLocation()
				this.isLocationRunning = false
				console.log('后台定位服务已停止')
			},
			// 处理位置更新
			handleLocationUpdate(location) {
				if (this.lastTime == location.timestamp) {
					return
				}
				this.lastTime = location.timestamp
				if (location.error) {
					console.error('定位错误', location.error)
					return
				}

				if (location.stopped) {
					console.log('定位服务已停止')
					this.isLocationRunning = false
					return
				}
				postLoc({
					"waybillNo": this.fcs,
					"latitude": location.latitude,
					"longitude": location.longitude,
					"collectTime": this.fmtTs(location.timestamp)
				})
			},
			fmtTs(ms) {
				const d = new Date(ms);
				const pad = n => n.toString().padStart(2, '0');
				return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
					`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
			},
			haversine(lon1, lat1, lon2, lat2) {
				const R = 6371000;                 // 地球平均半径，单位：米
				const φ1 = lat1 * Math.PI / 180;
				const φ2 = lat2 * Math.PI / 180;
				const Δφ = (lat2 - lat1) * Math.PI / 180;
				const Δλ = (lon2 - lon1) * Math.PI / 180;

				const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
					Math.cos(φ1) * Math.cos(φ2) *
					Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
				const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

				return R * c;   // 单位：米
			}
		}
	}
</script>

<style scoped>
	.item-count {
		position: absolute;
		top: -48px;
		right: 24px;
		z-index: 1;
		color: #FFF;
		background: $uni-color-custom;
		padding: 2px 8px;
		border-radius: 10px;
	}

	.qr-code-container {
		width: 70vw;
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.qr-code-header {
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1rpx solid #eee;
	}

	.qr-code-title {
		font-size: 36rpx;
		font-weight: bold;
	}

	.qr-code-close {
		font-size: 48rpx;
		color: #999;
		padding: 0 10rpx;
	}

	.qr-code-body {
		padding: 40rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.qr-code-image {
		width: 400rpx;
		height: 400rpx;
	}

	.qr-code-loading {
		font-size: 32rpx;
		color: #999;
	}

	.qr-code-footer {
		padding: 30rpx;
		text-align: center;
		border-top: 1rpx solid #eee;
	}

	.qr-code-tip {
		font-size: 28rpx;
		color: #666;
	}
</style>

<style scoped lang="scss">

	/* 注意:父节点需要固定高度，z-paging的height:100%才会生效 */
	.content {
		height: 100%;
	}

	.item {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 0rpx 30rpx;
	}

	.item-line {
		position: absolute;
		bottom: 0rpx;
		left: 0rpx;
		height: 1px;
		width: 100%;
		background-color: #eeeeee;
	}

	.v_nr {
		color: #000;
		font-size: 15px;
		font-weight: 400;
	}

	.footRoute-con {
		width: 100%;
		height: 60rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 auto;
		color: #ffffff;
		gap: 12px;

		.btn {
			width: 140rpx;
			height: 60rpx;
			line-height: 60rpx;
			background-color: #1F9A44;
			color: #ffffff;
			text-align: center;
			font-size: 28rpx;
			border-radius: 12rpx;
		}
	}

	/* 弹窗样式 */
	.popup-form-container {
		width: 90vw;
		margin: 0 auto;
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
	}

	.popup-title {
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 30rpx;
		color: #333333;
	}

	.popup-buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 40rpx;
		gap: 12px;
	}

	.btn-cancel {
		flex: 1;
	}

	.btn-submit {
		flex: 1;
	}

	/* 表单样式调整 */
	.uni-forms {
		width: 100%;
	}

	.uni-forms-item {
		margin-bottom: 24rpx;
	}

	.uni-easyinput {
		border: 1rpx solid #eee;
		border-radius: 8rpx;
	}

	/* 单选按钮组样式 */
	.radio-group {
		display: flex;
		align-items: center;
	}

	.radio-label {
		display: flex;
		align-items: center;
		margin-right: 40rpx;
		font-size: 28rpx;
		color: #333333;
	}

	.radio-label:last-child {
		margin-right: 0;
	}

	/* 调整单选按钮大小 */
	.radio-label radio {
		transform: scale(0.8);
		margin-right: 8rpx;
	}

	/* 竖向步骤条样式 */
	.vertical-steps {
		padding: 20rpx 0;
	}

	.step-item {
		display: flex;
		position: relative;
		padding-bottom: 30rpx;
	}

	/* 步骤连接线 */
	.step-line {
		position: absolute;
		left: 32rpx;
		top: 60rpx;
		bottom: 0;
		width: 4rpx;
	}

	.line-completed {
		background-color: #1F9A44;
	}

	.line-active {
		background-color: #1F9A44;
	}

	.line-pending {
		background-color: #cccccc;
	}

	/* 步骤节点 */
	.step-node {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}

	.node-completed {
		background-color: #1F9A44;
	}

	.node-active {
		background-color: #1F9A44;
	}

	.node-pending {
		background-color: #ffffff;
		border: 4rpx solid #cccccc;
	}

	/* 步骤图标 */
	.step-icon-completed,
	.step-icon-active,
	.step-icon-pending {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.step-icon-completed .iconfont,
	.step-icon-active .iconfont {
		color: #ffffff;
		font-size: 32rpx;
	}

	.step-icon-pending .iconfont {
		color: #cccccc;
		font-size: 32rpx;
	}

	/* 步骤内容 */
	.step-content {
		flex: 1;
		margin-left: 24rpx;
		padding: 12rpx 0;
	}

	.step-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 8rpx;
	}

	.step-desc {
		font-size: 26rpx;
		line-height: 1.4;
	}

	/* 不同状态的内容样式 */
	.content-completed .step-title {
		color: #1F9A44;
	}

	.content-completed .step-desc {
		color: #666666;
	}

	.content-active .step-title {
		color: #1F9A44;
	}

	.content-active .step-desc {
		color: #333333;
	}

	.content-pending .step-title {
		color: #999999;
	}

	.content-pending .step-desc {
		color: #999999;
	}

	/* 运单详情弹窗样式 */
	.detail-popup-container {
		width: 90vw;
		max-width: 700rpx;
		max-height: 70vh;
		background-color: #ffffff;
		border-radius: 16rpx;
		display: flex;
		flex-direction: column;
	}

	.detail-popup-header {
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.detail-popup-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}

	.detail-popup-close {
		font-size: 48rpx;
		color: #999999;
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.detail-popup-close:active {
		background-color: #f5f5f5;
		border-radius: 50%;
	}

	.detail-popup-body {
		padding: 30rpx;
		flex: 1;
		overflow-y: auto;
		max-height: 50vh;
	}

	.detail-item {
		display: flex;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f8f8f8;
	}

	.detail-label {
		color: #666666;
		font-size: 28rpx;
		width: 180rpx;
	}

	.detail-value {
		color: #333333;
		font-size: 28rpx;
		flex: 1;
		word-break: break-all;
	}


	.detail-popup-footer {
		padding: 30rpx;
		border-top: 1rpx solid #f0f0f0;
		display: flex;
		justify-content: center;
	}

	.detail-popup-close-btn {
		width: 200rpx;
	}
</style>