import request from '@/utils/request'
// 查询未完成入库的卸货单箱号信息
export function getUncompletedInboundTasks(params) {
  return request({
    url: '/api/app/query/put/list',
    method: 'get',
    params
  })
}
//根据箱号或者卸货单号来获取所有需要分拣的零件信息
export function getInboundDetails(params) {
  return request({
    url: '/api/app/query/part/info',
    method: 'get',
    params
  })
}
//初次分拣 - 根据卸货入库票号、卸货单号、分拣数量
export function firstSort(params) {
  return request({
    url: '/api/app/put/pickone',
    method: 'get',
    params
  })
}
//分拣（一次）完成 - 卸货单号
export function firstSortComplete(params) {
  return request({
    url: '/api/app/pickone/complete',
    method: 'get',
    params
  })
}
//上架（二次分拣） - 台车号、货入库票号、卸货单号、分拣数量
export function secondSort(params) {
  return request({
    url: '/api/app/put/picktwo',
    method: 'get',
    params
  })
}
//上架（二次）完成 - 卸货单号
export function secondSortComplete(params) {
  return request({
    url: '/api/app/put/complete',
    method: 'get',
    params
  })
}
//待出库销售清单
export function getOutboundTasks(params) {
  return request({
    url: '/api/app/query/output/list',
    method: 'get',
    params
  })
}
// 出库明细
export function getOutboundDetails(params) {
  return request({
    url: '/api/app/query/sale/detail',
    method: 'get',
    params
  })
}
//扫描出库
export function scanOutbound(params) {
  return request({
    url: '/api/app/output/pick',
    method: 'get',
    params
  })
}
// 扫码完成
export function scanOutboundComplete(params) {
  return request({
    url: '/api/app/output/complete',
    method: 'get',
    params
  })
}
// 获取台车号上的货物信息
export function getCartParts(params) {
  return request({
    url: '/api/app/cartno/list',
    method: 'get',
    params
  })
}
//捆包-1-获取台车上的数据
export function getCartPartsForBundle(params) {
  return request({
    url: '/api/app/output/cartno/list',
    method: 'get',
    params
  })
}
//捆包-2-将货物捆包到箱号里
export function bundleParts(params) {
  return request({
    url: '/api/app/output/bundle',
    method: 'get',
    params
  })
}















