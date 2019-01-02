<link rel="stylesheet" class="aplayer-secondary-style-marker" href="/assets/css/APlayer.min.css"><script src="/assets/js/APlayer.min.js" class="aplayer-secondary-script-marker"></script>const app = getApp();
Page({
	data: {
		showAddressType: 1,
		editAddress: [],
		region: []
	},
	onLoad: function (options) {
		let that = this;
		that.showAddressList();
	},
	editAddress (e) {
		let that = this
		let index = e.currentTarget.dataset.index
		let data = { showAddressType: 2 }
		let editAddress = {}
		let region = []
		if (index >= 0) {
			editAddress = that.data.addressList[index]
			region = [editAddress.province, editAddress.city, editAddress.area]
		}
		data.region = region
		data.editAddress = editAddress
		that.setData(data)
	},
	hideAddress () {
		let that = this;
		that.setData({
			showAddressType: 1
		});
	},
	showAddressList () {
		let that = this;
		app.request({
			url: 'shop/addressList',
			success: function (res) {
				let data = { showAddressType: 1, addressList: res.result.list };
				that.setData(data);
			}
		});
	},
	delAddress (e) {
		let that = this;
		let id = e.currentTarget.dataset.id;
		app.showModal({
			content: '确认删除该收货地址?',
			confirm (res) {
				if (res.confirm) {
					app.request({
						url: 'shop/delAddress',
						data: { id: id }, 
						success: function (res) {
							if (res.status == 0) {
								wx.showToast({
								title: res.result,
							})
							} else {
								that.showAddressList();
							}
						}
					});
				}
			}
		})
	},
	defaultAddress (e) {
		let that = this;
		let id = e.detail.value;
		app.request({
			url: 'shop/setDefaultAddress',
			data: { id: id }
		});
	},
	editAddressSubmit (e) {
		let that = this;
		let data = e.detail.value;
		if (!data.realname) {
			wx.showToast({ title: '收货人为空' })
			return false
		}
		if (!data.mobile) {
			wx.showToast({ title: '手机号为空' })
			return false
		}
		let region = that.data.region
		if (!region.length) {
			wx.showToast({ title: '请选择所在地区' })
			return false
		}
		data.province = region[0]
		data.city = region[1]
		data.area = region[2]
		if (!data.address) {
			wx.showToast({ title: '详细地址为空' });
			return false
		}
		that.data.editAddress.id && (data.id = that.data.editAddress.id);
		app.request({
			url: 'shop/editAddress',
			data: data,
			success: function(res){
				if (res.status == 0) {
					wx.showToast({
						title: res.result
					})
				} else {
					wx.showToast({title: '保存成功'})
					setTimeout(function () {
						that.showAddressList();
					}, 1000);
				}
			}
		});
	},
  regionChange (e) {
    this.setData({region: e.detail.value})
  },
	backType1 (){
		wx.navigateBack()
	},
	backType2 () {
		this.hideAddress()
	}

})