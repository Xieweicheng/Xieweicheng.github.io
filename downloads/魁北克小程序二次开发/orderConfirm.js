<link rel="stylesheet" class="aplayer-secondary-style-marker" href="/assets/css/APlayer.min.css"><script src="/assets/js/APlayer.min.js" class="aplayer-secondary-script-marker"></script>var app = getApp()
Page({
  data: {
    deduct: 0,
    deduct2: 0,
    showStore: false,
    showTimes: false,
    timeIndex: [0, 0],
  },
  onLoad (options) {
    console.log(options);
    this.setData({options})
  },
  onShow () {
    if (!app.globalData.noLoad) {
      if (this.data.options.is_team == 1) {
        this.initGroup()
      } else {
        this.initGoods()
      }
    }
  },
  initGroup () {
    let that = this
    let data = that.data.options
    app.request({
      url: 'fightGroups/getGroupsConfirm',
      data,
      success (res) {
        let result = res.result
        if (res.status == 1) {
          let goods = result.goods
          let total = 1
          goods.marketprice = that.toNumber(result.price)
          goods.total = total
          let goods_list = [{shopname: '', goods: [goods]}]
          let dispatchprice = that.toNumber(goods.freight)
          let totalprice = (dispatchprice + goods.marketprice).toFixed(2)
          let address = result.address
          let goodsprice = goods.marketprice * total
          let createInfo = {iscarry: 0}
          that.setData({address, goods_list, total, dispatchprice, totalprice, goodsprice, createInfo})
        } else {
          app.showModal({content: result})
        }
      }
    })
  },
  initGoods () {
    let that = this
    let data = that.data.options
    if (app.globalData.positionType == 1 && app.globalData.positionStore) {
      data.storeid = app.globalData.positionStore.id
    }
    if (app.globalData.selectedStoreData) {
      data.storeid = app.globalData.selectedStoreData.id
    }
    app.request({
      url: 'shop/orderMain', data,
      success (res) {
        if (res.status == 1) {
          res.result.discountprice2 = res.result.discountprice
          res.result.isdiscountprice2 = res.result.isdiscountprice
          res.result.deductcredit22 = res.result.deductcredit2
          that.setData(res.result)
          app.globalData.createInfo = res.result.createInfo
          if (that.data.changenum) {
            that.caculate()
          } else {
            that.totalPrice(0) 
          }
          if (app.globalData.selectedStoreData) {
            let createInfo = that.data.createInfo
            createInfo.iscarry = (app.globalData.createInfo.iscarry >> 0) || 1
            that.setData({createInfo})
          }
        } else {
          app.showModal({
            content: res.result,
            confirm () {
              wx.navigateBack()
            }
          })
        }
      }
    })
  },
  storeToggle (e) {
    this.setData({showStore: !this.data.showStore})
  },
  changeIscarry (e) {
    console.log('changeIscarry')
    let that = this
    let createInfo = that.data.createInfo
    if (createInfo.iscarry != e.currentTarget.dataset.iscarry) {
      createInfo.iscarry = e.currentTarget.dataset.iscarry
      app.globalData.createInfo = {iscarry: createInfo.iscarry}
      app.globalData.selectedStoreData = null
      that.setData({createInfo})
      that.caculate()
    }
  },
  // 积分抵扣
  deductCredit(e) {
    this.setData({ deduct: e.detail.value ? 1 : 0 })
    this.caculateCoupon()
  },
  // 余额抵扣
  deductCredit2(e) {
    this.setData({ deduct2: e.detail.value ? 1 : 0 })
    this.caculateCoupon()
  },
  // 转成数字
  toNumber (n) {
    return parseFloat(n) || 0
  },
  // 计算总价
  totalPrice (couponprice) {
    let that = this
    // 商品小计
    let goodsprice = that.toNumber(that.data.goodsprice)
    // 卡券优惠
    var couponprice = that.toNumber(couponprice)
    // 会员优惠
    let discountprice = that.toNumber(that.data.discountprice2)
    // 促销优惠
    let isdiscountprice = that.toNumber(that.data.isdiscountprice2)
    // 再次购买优惠
    let buyagainprice = that.toNumber(that.data.buyagainprice)
    // 总价
    let totalprice = goodsprice - discountprice - isdiscountprice - couponprice - buyagainprice
    // 运费
    let dispatchprice = that.toNumber(that.data.dispatchprice)
    // 商户立减
    let merch_enoughprice = 0
    if (that.data.merch_saleset) {
       merch_enoughprice = that.toNumber(that.data.merch_saleset.merch_enoughdeduct)
    }
    // 商城立减
    let enoughprice = 0
    if (that.data.saleset) {
      enoughprice = that.toNumber(that.data.saleset.enoughdeduct)
    }
    totalprice = totalprice - merch_enoughprice - enoughprice + dispatchprice    
    // 余额抵扣
    let deductcredit2 = that.toNumber(that.data.deductcredit22)
    // 积分抵扣
    let deductprice = 0
    if (that.data.deduct) {
      deductprice = that.toNumber(that.data.deductmoney)
      if (deductcredit2 > 0) {
        let td = (totalprice - deductprice).toFixed(2)
        if (td >= 0) {
          td > deductcredit2 && (td = deductcredit2)
          deductcredit2 = td
        }
      }
    }
    // 余额抵扣
    let deductprice2 = 0
    that.data.deduct2 && (deductprice2 = deductcredit2)

    // 计算购物袋价格
    let shopbags = app.globalData.shopbags
    let bagprice = 0
    if (that.data.options.fromcart == 1 && shopbags) {
      shopbags.forEach((e, i) => {
        bagprice += (e.total * e.price)
      })
    }
    totalprice += bagprice

    // 总价
    totalprice = (totalprice - deductprice - deductprice2).toFixed(2)
    totalprice <= 0="" &&="" (totalprice="0)" that.setdata({="" deductcredit2,="" totalprice,="" bagprice:="" bagprice.tofixed(2)})="" let="" couponcount="that.data.createInfo.couponcount">> 0
    if (couponcount > 0 && !that.data.if_bargain.bargain) {
      that.fetchAllCoupon()
    }
  },
  // 获取优惠券列表
  fetchAllCoupon () {
    let that = this
    let merchs = JSON.stringify(that.data.createInfo.merchs)
    let goods = JSON.stringify(that.data.createInfo.goods)
    let data = {money: 0, type: 0, merchs, goods}
    app.request({
      url: 'shop/fetchAllCoupon',
      hideLoading: 1,
      data,
      success (res) {
        let coupons = []
        if (res.result.coupons.length > 0) {
          coupons = res.result.coupons
          coupons.unshift({ id: 0, couponname: '不使用优惠券' })
        }
        that.setData({coupons})
      }
    })
  },
  // 选择优惠券
  selectedCoupon (e) {
    let that = this
    let couponIndex = e.detail.value
    let data = that.data.coupons[couponIndex]
    let createInfo = that.data.createInfo
    let coupontext = ''
    let couponname = ''
    createInfo.wxid = 0
    createInfo.wxcardid = ''
    createInfo.wxcode = ''
    createInfo.contype = couponIndex == 0 ? 0 : 2
    if (createInfo.contype == 2) {
      createInfo.couponid = data.id
      createInfo.couponmerchid = data.merchid
      coupontext = '已选择 '
      couponname = data.couponname
    } else {
      createInfo.couponid = 0
      createInfo.couponmerchid = 0
      coupontext = '优惠券'
      couponname = ''
    }
    that.setData({createInfo, coupontext, couponname, couponIndex})
    that.caculateCoupon()
  },
  // 计算优惠券金额
  caculateCoupon () {
    let that = this
    let createInfo = that.data.createInfo
    let goodsprice = that.data.goodsprice
    let discountprice2 = that.data.discountprice
    let isdiscountprice2 = that.data.isdiscountprice
    let coupondeduct_text = ''
    let coupondeduct_price = 0
    if (createInfo.couponid == 0 && createInfo.wxid == 0) {
      that.setData({coupondeduct_text, coupondeduct_price, discountprice2, isdiscountprice2})
      return that.totalPrice(0)
    } else {
      app.request({
        url: 'shop/getCouponPrice',
        hideLoading: 1,
        data: {
          goods: JSON.stringify(createInfo.coupon_goods),
          goodsprice: goodsprice,
          couponid: createInfo.couponid,
          contype: createInfo.contype,
          wxid: createInfo.wxid,
          wxcardid: createInfo.wxcardid,
          wxcode: createInfo.wxcode,
          discountprice: discountprice2,
          isdiscountprice: isdiscountprice2
        },
        success (res) {
          if (res.status == 1) {
            coupondeduct_text = res.result.coupondeduct_text
            coupondeduct_price = res.result.deductprice
            discountprice2 = res.result.discountprice
            isdiscountprice2 = res.result.isdiscountprice
          }
          that.setData({coupondeduct_text, coupondeduct_price, discountprice2, isdiscountprice2})
          that.totalPrice(coupondeduct_price)
        }
      })
    }
  },
  // 减少
  minus (e) {
    this.edit(e, '-')
  },
  // 增加
  plus (e) {
    this.edit(e, '+')
  },
  // 增减
  edit (e, t) {
    let that = this
    let unit = e.currentTarget.dataset.unit || '件'
    let maxbuy = e.currentTarget.dataset.maxbuy >> 0 || 0
    let minbuy = e.currentTarget.dataset.minbuy >> 0 || 0
    let sindex = e.currentTarget.dataset.sindex >> 0 || 0
    let gindex = e.currentTarget.dataset.gindex >> 0 || 0
    let paramid = e.currentTarget.dataset.paramid
    let goods_list = that.data.goods_list
    let total = goods_list[sindex].goods[gindex].total >> 0
    let total2 = that.data.total
    let goodsprice = that.toNumber(that.data.goodsprice)
    if (t == '-') {
      if (total <= 1)="" {="" return="" false="" }="" if="" (minbuy=""> 0 && total <= minbuy)="" {="" app.showmodal({content:="" minbuy="" +="" unit="" '起售'})="" return="" false="" }="" total--="" total2--="" goodsprice="" -="that.toNumber(goods_list[sindex].goods[gindex].marketprice)" else="" if="" (t="=" '+')="" (total="">= 99) {
        // return false
      // }
      if (maxbuy > 0 && total >= maxbuy) {
        app.showModal({content: '最多购买' + maxbuy + unit})
        return false
      }
      total++
      total2++
      goodsprice += that.toNumber(goods_list[sindex].goods[gindex].marketprice)
    }
    goodsprice = goodsprice.toFixed(2)
    goods_list[sindex].goods[gindex].total = total

    let createInfo = that.data.createInfo
    let goods = createInfo.goods
    let coupon_goods = createInfo.coupon_goods
    let i = 0
    let l = goods.length
    for(i, l; i < l; i++) {
      if (goods[i].goodsid+'_'+goods[i].optionid == paramid) {
        createInfo.goods[i].total = total
      }
    }
    let j = 0
    let c = coupon_goods.length
    for(j, c; j < c; j++) {
      if (coupon_goods[j].goodsid+'_'+coupon_goods[j].optionid == paramid) {
        createInfo.coupon_goods[j].total = total
      }
    }
    that.setData({goods_list, createInfo, goodsprice, total: total2})
    that.caculate()
  },
  // 计算订单
  caculate () {
    let that = this
    let createInfo = that.data.createInfo
    let data = that.data.options
    data.addressid = createInfo.addressid
    data.dflag = createInfo.iscarry
    data.goods = JSON.stringify(createInfo.goods)
    app.request({
      url: 'shop/orderCaculate',
      hideLoading: 1,
      data,
      success (res) {
        if (res.status == 1) {
          let data = {}
          if (createInfo.iscarry >> 0) {
            data.dispatchprice = 0.00
          } else {
            data.dispatchprice = res.result.price
          }
          data.discountprice = res.result.discountprice
          data.discountprice2= res.result.discountprice
          data.isdiscountprice = res.result.isdiscountprice
          data.isdiscountprice2= res.result.isdiscountprice
          data.buyagainprice = res.result.buyagain
          data.deductcredit = res.result.deductcredit
          data.deductmoney = res.result.deductmoney
          data.deductcredit22 = res.result.deductcredit2
          data.seckillprice = res.result.seckillprice
          data.saleset = res.result.saleset
          data.merch_saleset = res.result.merch_saleset
          createInfo.merchs = res.result.merchs
          createInfo.isnodispatch = res.result.isnodispatch
          createInfo.nodispatch = res.result.nodispatch
          createInfo.couponcount = res.result.couponcount

          // 初始化优惠券
          createInfo.wxid = 0
          createInfo.wxcardid = ''
          createInfo.wxcode = ''
          createInfo.couponid = 0
          createInfo.couponmerchid = 0
          createInfo.contype = 0
          data.coupontext = '优惠券'
          data.couponname = ''
          data.couponIndex = 0
          data.createInfo = createInfo
          that.setData(data)
          that.caculateCoupon()
        }
      }
    })
  },
  // 创建订单
  submit (e) {
    let that = this
    if (that.data.options.is_team == 1) {
      console.log(e);
      that.submitGroup(e)
      return false
    }
    app.setFormId(e)
    if (that.data.posting == 1) {
      return false
    }
    // 自定义表单
    let diydata = ''
    if (that.data.diyformdata.orderdiyformid != 0) {
      let diyform = that.selectComponent("#diyform")
      diydata = diyform.check()
      if (!diydata) {
        return false
      }
    }
    let createInfo = that.data.createInfo
    let form = e.detail.value
    let data = {
      id: createInfo.id,
      goods: JSON.stringify(createInfo.goods),
      fromcart: createInfo.fromcart,
      diydata,
      dispatchtype: createInfo.iscarry ? 1 : 0,
      carriers: '',
      gdid: that.data.options.gdid,
      carrierid: createInfo.iscarry >> 0 ? createInfo.storeid : 0,
      addressid: !(createInfo.iscarry >> 0) ? createInfo.addressid : 0,
      remark: form.remark || '',
      invoicename: form.invoicename || '',
      contype: createInfo.contype || 0,
      couponid: createInfo.couponid || 0,
      wxid: createInfo.wxid || 0,
      wxcardid: createInfo.wxcardid  || '',
      wxcode: createInfo.wxcode  || '',
      deduct: that.data.deduct ? 1 : 0,
      deduct2: that.data.deduct2 ? 1 : 0,
      cartids: that.data.options.cartids || '',
      bargain_id: createInfo.bargain_id || 0,
      is_convert: that.data.options.is_convert,
      scenegoods: app.globalData.scenegoods,
    }
    
    // 购物袋
    let shopbags = app.globalData.shopbags
    if (that.data.options.fromcart == 1 && shopbags) {
      data.bags = JSON.stringify(shopbags)
    }

    let params = that.data.options
    delete(params.goods)
    if (createInfo.isonlyverifygoods >> 0 || params.isscan == 1) {
    } else if (createInfo.iscarry >> 0 || createInfo.isverify >> 0 || createInfo.isvirtual >> 0) {
      if (createInfo.iscarry && createInfo.isverify >> 0 == 0 && createInfo.storeid == 0) {
        app.showModal({content: '请选择自提点'})
        return false
      }
      if (form.carrier_realname == '' && that.data.trade.set_realname != 1) {
        app.showModal({content: '请填写联系人'})
        return false
      }
      if (form.carrier_mobile == '' && that.data.trade.set_mobile != 1) {
        app.showModal({content: '请填写联系电话'})
        return false
      }
      let carrier_time = ''
      if (that.data.trade.set_time != 1 && that.data.pickuptimes.length) {
        let pickuptime = that.data.pickuptimes[that.data.timeIndex[0]]
        carrier_time = pickuptime.riqi + ' ' + pickuptime.time[that.data.timeIndex[1]]
      }
      let carrier = that.data.carrier
      data.carriers = JSON.stringify({
        carrier_realname: form.carrier_realname,
        carrier_mobile: form.carrier_mobile,
        carrier_time: carrier_time,
        realname: carrier.realname,
        mobile: carrier.mobile,
        storename: carrier.storename,
        address: carrier.address
      })
    } else {
      if (createInfo.addressid == 0) {
        app.showModal({content: '请选择收货地址'})
        return false
      } else {
        if (createInfo.isnodispatch == 1) {
          app.showModal({content: createInfo.nodispatch})
          return false
        }
      }
    }
    that.setData({ posting: 1 })
    app.request({
      url: 'shop/orderSubmit',
      params,
      data,
      success (res) {
        that.setData({ posting: 0 })
        if (res.status == 0) {
          app.showModal({content: res.result})
          return false
        }
        wx.redirectTo({
          url: '/shop/orderPay?module=' + res.result.module + '&orderid=' + res.result.orderid
        })
        // console.log(res)
      }
    })
  },
  submitGroup (e) {
    app.setFormId(e)
    let that = this
    if (that.data.posting == 1) {
      return false
    }
    let form = e.detail.value
    let data = that.data.options
    let remark = form.remark
    data.remark = remark
    that.setData({ posting: 1 })
    app.request({
      url: 'fightGroups/actionGroupsCreateOrder',
      data,
      success (res) {
        if (res.status == 0) {
          app.showModal({content: "请完善联系信息"})
          return false
        }
        let url = '/shop/orderPay?module=' + res.result.module + '&orderid=' + res.result.orderid
        data.teamid && (url += '&teamid=' + data.teamid)
        data.is_team && (url += '&is_team=' + data.is_team)
        wx.redirectTo({url})
      }
    })
  },
  makePhoneCall(e) {
    let tel = e.currentTarget.dataset.tel
    tel && app.makePhoneCall(tel)
  },
  openLocation (e) {
    let d = e.currentTarget.dataset
    let d2 = app.mapDd2Tx(d.lat, d.lng)
    app.openLocation({
      latitude: d2.lat,
      longitude: d2.lon,
      address: d.address
    })
  },
  changeTime (e) {
    this.setData({ timeIndex: e.detail.value})
  },
  toggleTime (e) {
    this.setData({ showTimes: !this.data.showTimes})
  }
})</=></=></=>