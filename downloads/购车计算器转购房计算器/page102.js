<link rel="stylesheet" class="aplayer-secondary-style-marker" href="/assets/css/APlayer.min.css"><script src="/assets/js/APlayer.min.js" class="aplayer-secondary-script-marker"></script>const app = getApp()
Page({
    data: {
        result: {},
        classify_id: 11, //品牌分类id
        folder_id: 9, //分类id
        flState: 0, //全款0、贷款1
        isUnfoldNcd: true,
        isUnfoldCid: true,
        thirdPartyIndemnity: [{
                key: '5万',
                value: 516
            },
            {
                key: '10万',
                value: 746
            },
            {
                key: '20万',
                value: 924
            },
            {
                key: '50万',
                value: 1252
            },
            {
                key: '100万',
                value: 1630
            }
        ],
        tpiIndex: 1, //第三方责任险index
        // glass: ['国产玻璃', '进口玻璃'],
        // gIndex: 0,
        scratcharr: [{
                key: '2千',
                value: 400
            },
            {
                key: '5千',
                value: 570
            },
            {
                key: '1万',
                value: 760
            },
            {
                key: '2万',
                value: 1140
            }
        ],
        sIndex: 1,
        dprState: 0,
        rtState: 0,
        id: 0,
        resultCar: [],
        total_price: 0,
        total_price_str: 0,
        price: 0,

        // 商业险
        is_third: 1,
        is_loss: 1,
        is_exempt: 1,
        is_rob: 1,
        is_glass: 1,
        is_nature: 1,
        is_water: 1,
        is_scratch: 1,
        is_without: 1,
        is_passenger: 1,
        // 商业险金额
        business: 0,
        business_str: 0,
        third: 746,
        loss: 0,
        exempt: 0,
        rob: 0,
        glass: 0,
        nature: 0,
        water: 0,
        scratch: 570,
        without: 0,
        passenger: 50,

        must: 0, // 必要花费
        must_str: 0,
        purchase: 0, //购置税
        make_strong: 0, //交强险
        ship: 0, //车船税
        board: 500, //上牌费

        basics: 0, //基础保费

        ratio: [], // 首付比例
        rate: [], //年利率
        one_month: 0, //每月应还
        total_interest: 0, //利息
        total_interest_str: 0,
        annualInterestRate: 0, //年利率
        payment_ratio: 0, //首付比例
        month: 12, //还款期数
        payment: 0, //首付

    },

    onLoad(options) {
        let that = this

    },
    onShow() {
        let that = this
        that.settingVerify()
        let result = that.data.result

        that.setData({ result })


    },
    onHide() {
        clearInterval(app.globalData.timer);

    },
    imageLoad(e) {
        app.imageLoad(e, this)
    },
    makePhoneCall(e) {
        app.makePhoneCall(e.currentTarget.dataset.phonenumber)
    },
    openEvent(e) {
        app.openEvent(e, this)
    },
    backToTop(e) {
        wx.pageScrollTo({ scrollTop: 0 })
    },
    launchAppError(e) {
        if (e.type == 'error') {
            wx.showToast({ title: '场景不正确' })
            return false
        }
    },
    settingVerify() {
        let pages = getCurrentPages()
        let page = pages[pages.length - 1]['route']
        app.getSettingVerify(() => app.settingVerify(page))
    },
    onShareAppMessage() {
        let mid = app.globalData.mid ? 'mid=' + app.globalData.mid + '&' : ''
        return {
            title: '计算器',
            path: 'pages/index/page102?' + mid
        }
    },
    CarCalculatorInit() {
        let that = this
        let configuration_id = that.data.id
        app.request({
            url: 'car/getRatio',
            data: {
                configuration_id
            },
            success(res) {
                let price = parseInt(res.result.list.guide_price)
                let annualInterestRate = parseFloat(res.result.rate[0])
                let payment_ratio = parseInt(res.result.ratio[0])
                that.setData({
                    resultCar: res.result,
                    price: price,
                    ratio: res.result.ratio,
                    rate: res.result.rate,
                    annualInterestRate,
                    payment_ratio
                })
                that.countPrice()
            }
        })
    },
    // 设置价格
    setPrice(e) {
        let that = this
        let price = parseInt(e.detail.value)
        that.setData({ price })
        that.countPrice()
    },

    /**
     * 等额本息 计算并返回月还款本息的方法
     * @param loanAmount            贷款本金(也就是贷了多少款，比如，70万)
     * @param months                还款月数(也就是贷款周期，如20年，则此处为240个月)
     * @param annualInterestRate    年利率(比如，6.55%，则此处传入为6.55,应除以100以后转为0.0665再进行计算)
     */
    getPaymetnsPer(loanAmount, months, annualInterestRate) {
        let that = this
        //月利率
        let rateOfMonth = parseFloat(annualInterestRate) / 100 / 12

        let one_month = parseInt((loanAmount * rateOfMonth * Math.pow((1 + rateOfMonth), months)) / (Math.pow((1 + rateOfMonth), months) - 1))

        //总利息
        let total_interest = parseInt(months * one_month - loanAmount)
        one_month = that.format_number(one_month)
        let total_interest_str = that.format_number(total_interest)
        that.setData({ one_month, total_interest, total_interest_str })
        that.countTotal()
    },
    Cerror() {
        let that = this
        wx.showModal({
            content: '请先选择房型',
            showCancel: false,
            success: function(res) {
                that.addCarModel()
            }
        })
    },
    // 计算总价
    countPrice() {
        let that = this
        if (that.data.resultCar.length == 0) {
            that.Cerror()
            return
        }
        let list = that.data.resultCar.list
        let displacement = parseFloat(list.displacement) //排量
        let price = that.data.price //裸车价
        let seat_count = parseFloat(list.seat_count) //座位数
        let board = that.data.board //上牌费
        let third = that.data.third //第三者责任险
        let make_place = list.make_place //生产
        // 车船税
        let ship = 0
        if (displacement <= 1)="" {="" ship="300" }="" else="" if="" (displacement="" <="1.6)" 购置税="" let="" purchase="parseInt(price" (1="" +="" 0.17)="" *="" 0.1)="" 交强险="" make_strong="950" (seat_count=""> 6) {
            make_strong = 1100
        }
        // 必要花费
        let must = ship + purchase + make_strong + board
        let must_str = that.format_number(must)
        // 基础保费
        let basics = 460
        // 车辆损失险
        let loss = parseInt(basics + price * 0.01088)
        // 不计免赔特约险
        let exempt = parseInt((loss + third) * 0.2)
        // 全车盗抢险
        let rob = parseInt(price * 0.00524)
        // 玻璃单独破碎险
        let glass = 0
        if (make_place == 1) {
            glass = parseInt(price * 0.0015)
        } else if (make_place == 2) {
            glass = parseInt(price * 0.0025)
        }
        // 自燃损失险
        let nature = parseInt(price * 0.0015)
        // 涉水险
        let water = parseInt(price * 0.00075)
        // 无过责任险
        let without = parseInt(third * 0.2)

        that.setData({
            ship,
            purchase,
            make_strong,
            must,
            must_str,
            basics,
            loss,
            exempt,
            rob,
            glass,
            nature,
            water,
            without
        })
        that.setBusinessTotal()
    },
    // 商业险
    setBusinessTotal() {
        let that = this
        if (that.data.resultCar.length == 0) {
            that.Cerror()
            return
        }
        let d = that.data
        let business = 0
        if (d.is_third) {
            business += d.third
        }
        if (d.is_loss) {
            business += d.loss
        }
        if (d.is_exempt) {
            business += d.exempt
        }
        if (d.is_rob) {
            business += d.rob
        }
        if (d.is_glass) {
            business += d.glass
        }
        if (d.is_nature) {
            business += d.nature
        }
        if (d.is_water) {
            business += d.water
        }
        if (d.is_scratch) {
            business += d.scratch
        }
        if (d.is_passenger) {
            business += d.passenger
        }
        business = parseInt(business)
        let business_str = that.format_number(business)
        that.setData({
            business,
            business_str
        })
        that.countTotal()
        that.loansTotal()
    },
    // 总价
    countTotal() {
        let that = this
        let d = that.data
        let total_interest = 0
        if (that.data.flState == 1) {
            total_interest = that.data.total_interest
        }
        let total_price = parseInt(d.business + d.must + d.price + total_interest)
        let total_price_str = that.format_number(total_price)
        that.setData({
            total_price,
            total_price_str
        })
    },
    // 贷款
    loansTotal() {
        let that = this
        let d = that.data
        let price = that.data.price
        let payment_ratio = that.data.payment_ratio / 100
        let payment = that.format_number(price * payment_ratio + d.business + d.must)
        that.setData({ payment })
        that.getPaymetnsPer(price - price * payment_ratio, that.data.month, that.data.annualInterestRate)
    },
    clickflState(e) {
        let that = this
        let flState = e.currentTarget.dataset.flstate
        that.setData({
            flState: flState
        })
        that.countTotal()
    },
    // 必花费详情 展开/收起
    unfoldNcd() {
        let that = this
        that.setData({
            isUnfoldNcd: !that.data.isUnfoldNcd
        })
    },
    // 商业险详情 展开/收起
    unfoldCid() {
        let that = this
        that.setData({
            isUnfoldCid: !that.data.isUnfoldCid
        })
    },
    // 第三者责任险
    thirdPartyChange(e) {
        let that = this
        let tpiIndex = e.detail.value
        let third = that.data.thirdPartyIndemnity[tpiIndex].value
        that.setData({
            third,
            tpiIndex
        })
        that.setBusinessTotal()
    },
    // 玻璃单独破碎险
    // glassChange(e) {
    //   let that = this
    //   that.setData({
    //     gIndex: e.detail.value,
    //   })
    // },
    // 车身划痕险
    scratchChange(e) {
        let that = this
        let sIndex = e.detail.value
        let scratch = that.data.scratcharr[sIndex].value
        that.setData({
            sIndex,
            scratch
        })
        that.setBusinessTotal()
    },
    clickDpr(e) {
        let that = this
        if (that.data.resultCar.length == 0) {
            that.Cerror()
            return
        }
        let dprState = e.currentTarget.dataset.dprstate
        let payment_ratio = parseInt(that.data.ratio[dprState])
        that.setData({
            dprState,
            payment_ratio
        })
        that.loansTotal()
    },
    clickRt(e) {
        let that = this
        if (that.data.resultCar.length == 0) {
            that.Cerror()
            return
        }
        let rtState = e.currentTarget.dataset.rtstate
        let month = parseInt(e.currentTarget.dataset.month)
        let annualInterestRate = parseFloat(that.data.rate[rtState])
        that.setData({
            rtState,
            month,
            annualInterestRate
        })
        that.loansTotal()
    },
    clickBool(e) {
        let that = this
        if (that.data.resultCar.length == 0) {
            that.Cerror()
            return
        }
        let bool = e.currentTarget.dataset.bool
        let decorate = 0
        if (bool == 1) {
            decorate = 30000
        }

        that.setData({
            bool,
            decorate
        })

        that.loansTotal()
    },
    format_number(n) {
        var b = parseInt(n).toString();
        var len = b.length;
        if (len <= 3)="" {="" return="" b;="" }="" var="" r="len" %="" 3;=""> 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",") : b.slice(r, len).match(/\d{3}/g).join(",");
    },
    // 商业险选择
    setInsurance(e) {
        let that = this
        let is_exempt = that.data.is_exempt
        let is_rob = that.data.is_rob
        let is_scratch = that.data.is_scratch
        let is_loss = that.data.is_loss
        let _type = e.currentTarget.dataset.type
        if (_type == 1) {
            that.setData({
                is_third: !that.data.is_third
            })
        } else if (_type == 2) {
            is_loss = !is_loss
            if (is_loss == 0) {
                is_exempt = 0
                is_rob = 0
                is_scratch = 0
            }
            that.setData({
                is_loss,
                is_exempt,
                is_rob,
                is_scratch
            })
        } else if (_type == 3) {
            if (is_loss != 0) {
                that.setData({
                    is_exempt: !that.data.is_exempt
                })
            }
        } else if (_type == 4) {
            if (is_loss != 0) {
                that.setData({
                    is_rob: !that.data.is_rob
                })
            }
        } else if (_type == 5) {
            that.setData({
                is_glass: !that.data.is_glass
            })
        } else if (_type == 6) {
            that.setData({
                is_nature: !that.data.is_nature
            })
        } else if (_type == 7) {
            that.setData({
                is_water: !that.data.is_water
            })
        } else if (_type == 8) {
            if (is_loss != 0) {
                that.setData({
                    is_scratch: !that.data.is_scratch
                })
            }
        } else if (_type == 9) {
            that.setData({
                is_without: !that.data.is_without
            })
        } else if (_type == 10) {
            that.setData({
                is_passenger: !that.data.is_passenger
            })
        }
        that.setBusinessTotal()
    },
    // 选择车型
    addCarModel(e) {
        let that = this
        let classify_id = that.data.classify_id
        let folder_id = that.data.folder_id
        app.navigateTo({
            url: '/car/carBrand?classify_id=' + classify_id + '&folder_id=' + folder_id + '&tid=1'
        })
    },

})</=></=>