<template>
	<view class="container">
		<uni-list>
			<uni-list-item showExtraIcon="true" :extraIcon="{type: 'person-filled'}" title="昵称"
				:rightText="user.nickName" />
			<uni-list-item showExtraIcon="true" :extraIcon="{type: 'phone-filled'}" title="手机号码"
				:rightText="user.phonenumber" />
<uni-list-item showExtraIcon="true" :extraIcon="{type: 'calendar-filled'}" title="创建日期"
				:rightText="user.createTime" />
		</uni-list>
	</view>
</template>

<script>
	import {
		getUserProfile
	} from "@/api/system/user"

	export default {
		data() {
			return {
				user: {},
			}
		},
		onLoad() {
			this.getUser()
		},
		methods: {
			getUser() {
				getUserProfile().then(data => {
					console.log('ddd',data)
					let response = data.data.user
					this.user = response
					console.log('uuu',response)
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #ffffff;
	}
</style>