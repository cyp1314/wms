export function scanCode() {
  let activity = plus.android.runtimeMainActivity();
  var Intent = plus.android.importClass("android.content.Intent");
  var intent = new Intent("com.service.scanner.start.scanning");
  activity.sendBroadcast(intent);
}
export function stopScanCode() {
  let activity = plus.android.runtimeMainActivity();
  var Intent = plus.android.importClass("android.content.Intent");
  var intent = new Intent("com.service.scanner.stop.scanning");
  activity.sendBroadcast(intent);
}
/**
* 显示消息提示框
* @param content 提示的标题
*/
export function toast(content) {
  uni.showToast({
    icon: 'none',
    title: content
  })
}

/**
* 显示模态弹窗
* @param content 提示的标题
*/
export function showConfirm(content) {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: '提示',
      content: content,
      cancelText: '取消',
      confirmText: '确定',
      success: function (res) {
        resolve(res)
      }
    })
  })
}

/**
* 参数处理
* @param params 参数
*/
export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    var part = encodeURIComponent(propName) + "="
    if (value !== null && value !== "" && typeof (value) !== "undefined") {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
            let params = propName + '[' + key + ']'
            var subPart = encodeURIComponent(params) + "="
            result += subPart + encodeURIComponent(value[key]) + "&"
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&"
      }
    }
  }
  return result
}

/**
* 显示加载提示
* @param title 提示文本
* @param mask 是否显示透明遮罩，防止触摸穿透
*/
export function showLoading(title = '加载中...', mask = true) {
  uni.showLoading({
    title: title,
    mask: mask
  })
}

/**
* 隐藏加载提示
*/
export function hideLoading() {
  uni.hideLoading()
}