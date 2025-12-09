import request from '@/utils/request'

// 登录方法
export function login(username, password, code, uuid) {
	const data = {
		username,
		password,
		code,
		uuid
	}
	return request({
		'url': '/app/login',
		headers: {
			isToken: false
		},
		'method': 'post',
		'data': data
	})
}

// 注册方法
export function register(data) {
	return request({
		url: '/register',
		headers: {
			isToken: false
		},
		method: 'post',
		data: data
	})
}

// 获取用户详细信息
export function getInfo() {
	return request({
		'url': '/getInfo',
		'method': 'get'
	})
}

// 退出方法
export function logout() {
	return request({
		'url': '/logout',
		'method': 'post'
	})
}

// 获取验证码
export function getCodeImg() {
	return request({
		'url': '/captchaImage',
		headers: {
			isToken: false
		},
		method: 'get',
		timeout: 20000
	})
}

// 注册方法
export function postLocal(data) {
	return request({
		url: '/auto/jwd',
		headers: {
			isToken: false
		},
		method: 'post',
		data: data
	})
}

// 微信一键登录
export function wechatLogin(code, encryptedData, iv) {
	const data = {
		code,
		encryptedData,
		iv
	}
	return request({
		url: '/wechat/login',
		headers: {
			isToken: false
		},
		method: 'post',
		data: data
	})
}

// 获取微信手机号
export function getWechatPhoneNumber(code, encryptedData, iv) {
	const data = {
		code,
		encryptedData,
		iv
	}
	return request({
		url: '/wx/login',
		headers: {
			isToken: false
		},
		method: 'get',
		params: data
	})
}