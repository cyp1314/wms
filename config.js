// 应用全局配置
module.exports = {
	// baseUrl: 'http://8.137.9.186:8080',
	baseUrl: 'http://10.1.19.13:8080',
	// 应用信息
	appInfo: {
		// 应用名称
		name: "tms-app",
		// 应用版本
		version: "1.2.0",
		// 应用logo
		logo: "/static/logo.png",
		// 官方网站
		site_url: "http://tms.vip",
		// 政策协议
		agreements: [{
			title: "隐私政策",
			url: "https://tms.vip/protocol.html"
		},
		{
			title: "用户服务协议",
			url: "https://tms.vip/protocol.html"
		}
		],
		// 是否正在配送任务
		startTask: false
	}
}