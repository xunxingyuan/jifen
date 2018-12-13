const db = require('../../db/index')
const Wx = db.Wx
const User = db.User
const Json = require('../../tools/jsonResponse')
const axios = require('axios')
const sign = require('../../tools/sign')
const Conf = require('../../../conf/conf')
const UserInfo = db.UserInfo
const userAuth = db.userAuth

module.exports = {
    getCode: async (ctx, next) => {
        let res = await Wx.findOne({
            id: '1'
        })
        if (res) {
            let APPID = res.appID
            let redirect_uri = Conf.server.url + "/jifen"
            let url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + APPID + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
            Json.res(ctx, 200, '获取成功', {
                url: url
            })
        } else {
            Json.res(ctx, 201, '失败')
        }
    },
    //获取用户个人信息CODE
    getInfoCode: async (ctx, next) => {
        let res = await Wx.findOne({
            id: '1'
        })
        let query = ctx.request.query
        if (res) {
            let APPID = res.appID
            let redirect_uri = Conf.server.url + "/" + query.channel
            let url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + APPID + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect"
            Json.res(ctx, 200, '获取成功', {
                url: url
            })
        } else {
            Json.res(ctx, 201, '失败')
        }
    },

    //渠道测试用户
    getTokenAuth: async (ctx, next) => {
        let res = await Wx.findOne({
            id: '1'
        })
        let query = ctx.request.query
        if (query.code) {
            if (res) {
                let APPID = res.appID
                let SECRET = res.appsecret
                let now = new Date().getTime()
                let url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + APPID + "&secret=" + SECRET + "&code=" + query.code + "&grant_type=authorization_code"
                let response = await axios.get(url)
                if (response.status === 200) {
                    if (response.data.hasOwnProperty('access_token')) {
                        let user = await User.findOne({
                            openid: response.data.openid
                        })
                        if (user) {
                            let refreshData = {
                                access_token: response.data.access_token,
                                expires_time: now + response.data.expires_in * 1000,
                                refresh_token: response.data.refresh_token,
                                scope: response.data.scope
                            }
                            let refreshUser = await User.updateOne({
                                openid: response.data.openid
                            }, {
                                    $set: refreshData
                                })
                            let infoFind = await userAuth.findOne({
                                openid: response.data.openid
                            })
                            if (infoFind) {
                                if (refreshUser) {
                                    let channel = infoFind.channel
                                    if (channel.indexOf(query.channel) === -1) {
                                        channel.push(query.channel)
                                        let authData = {
                                            channel: channel
                                        }
                                        let updateAuth = await userAuth.updateOne({
                                            openid: response.data.openid
                                        }, {
                                                $set: authData
                                            })
                                        if (updateAuth) {
                                            Json.res(ctx, 200, '更新成功', {
                                                id: user._id
                                            })
                                        } else {
                                            Json.res(ctx, 201, '更新用户失败')
                                        }
                                    } else {
                                        Json.res(ctx, 200, '更新成功', {
                                            id: user._id
                                        })
                                    }
                                } else {
                                    Json.res(ctx, 201, '更新用户失败')
                                }
                            } else {
                                let infoUrl = "https://api.weixin.qq.com/sns/userinfo?access_token=" + response.data.access_token + "&openid=" + response.data.openid + "&lang=zh_CN"
                                let responseInfo = await axios.get(infoUrl)
                                if (responseInfo.status === 200) {
                                    let data = responseInfo.data
                                    let channel = []
                                    channel.push(query.channel)
                                    let userInfoData = {
                                        openid: data.openid,
                                        nickname: data.nickname,
                                        sex: data.sex,
                                        province: data.province,
                                        city: data.city,
                                        country: data.country,
                                        headimgurl: data.headimgurl,
                                        channel: channel
                                    }
                                    let infoAdd = await new userAuth(userInfoData).save()
                                    if (infoAdd && refreshUser) {
                                        Json.res(ctx, 200, '新建用户信息成功', {
                                            id: user._id
                                        })
                                    } else {
                                        Json.res(ctx, 201, '更新用户数据失败')
                                    }
                                } else {
                                    Json.res(ctx, 201, '获取微信用户数据失败')
                                }
                            }

                        } else {
                            let userData = {
                                openid: response.data.openid,
                                access_token: response.data.access_token,
                                expires_time: now + response.data.expires_in * 1000,
                                refresh_token: response.data.refresh_token,
                                scope: response.data.scope
                            }
                            let infoUrl = "https://api.weixin.qq.com/sns/userinfo?access_token=" + response.data.access_token + "&openid=" + response.data.openid + "&lang=zh_CN"
                            let responseInfo = await axios.get(infoUrl)

                            if (responseInfo.status === 200) {
                                let data = responseInfo.data
                                let channel = []
                                channel.push(query.channel)
                                let userInfoData = {
                                    openid: data.openid,
                                    nickname: data.nickname,
                                    sex: data.sex,
                                    province: data.province,
                                    city: data.city,
                                    country: data.country,
                                    headimgurl: data.headimgurl,
                                    channel: channel
                                }
                                let infoAdd = await new userAuth(userInfoData).save()
                                let userAdd = await new User(userData).save()
                                if (userAdd && infoAdd) {
                                    Json.res(ctx, 200, '新建成功', {
                                        id: userAdd._id
                                    })
                                } else {
                                    Json.res(ctx, 201, '更新用户数据失败')
                                }
                            } else {
                                Json.res(ctx, 201, '获取微信用户数据失败')
                            }

                        }

                    } else {
                        Json.res(ctx, 201, '微信获取token错误')
                    }
                } else {
                    Json.res(ctx, 201, '微信鉴权错误')
                }
            }
        } else {
            Json.res(ctx, 201, '参数不完整')
        }
    },
    //种草用户
    getToken: async (ctx, next) => {
        let res = await Wx.findOne({
            id: '1'
        })
        let query = ctx.request.query
        if (query.code) {
            if (res) {
                let APPID = res.appID
                let SECRET = res.appsecret
                let now = new Date().getTime()
                let url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + APPID + "&secret=" + SECRET + "&code=" + query.code + "&grant_type=authorization_code"
                let response = await axios.get(url)
                console.log(response)
                if (response.status === 200) {
                    if (response.data.hasOwnProperty('access_token')) {
                        let user = await User.findOne({
                            openid: response.data.openid
                        })
                        if (user) {
                            //更新
                            let refreshData = {
                                access_token: response.data.access_token,
                                expires_time: now + response.data.expires_in * 1000,
                                refresh_token: response.data.refresh_token,
                                scope: response.data.scope
                            }
                            let refreshUser = await User.updateOne({
                                openid: response.data.openid
                            }, {
                                    $set: refreshData
                                })

                            if (refreshUser) {
                                Json.res(ctx, 200, '更新成功', {
                                    id: user._id
                                })
                            } else {
                                Json.res(ctx, 201, '更新用户失败')
                            }
                        } else {
                            let userData = {
                                openid: response.data.openid,
                                access_token: response.data.access_token,
                                expires_time: now + response.data.expires_in * 1000,
                                refresh_token: response.data.refresh_token,
                                scope: response.data.scope
                            }
                            let userInfoData = {
                                openid: response.data.openid,
                                nick: '',
                                phone: '',
                                name: '',
                                areaCode: [],
                                areaName: '',
                                address: '',
                            }

                            let userAdd = await new User(userData).save()
                            let infoAdd = await new UserInfo(userInfoData).save()
                            if (userAdd && infoAdd) {
                                Json.res(ctx, 200, '新建成功', {
                                    id: userAdd._id
                                })
                            } else {
                                Json.res(ctx, 201, '更新用户数据失败')
                            }
                        }
                    } else {
                        Json.res(ctx, 201, '通过code获取token失败')
                    }
                } else {
                    Json.res(ctx, 201, '微信通信失败')
                }
            } else {
                Json.res(ctx, 201, '系统错误')
            }
        } else {
            Json.res(ctx, 201, '参数不完整')
        }

    },
    updateToken: async (ctx, next) => {
        let query = ctx.request.query
        let now = new Date().getTime()
        if (query.id) {
            try {
                let res = await Wx.findOne({
                    id: '1'
                })
                let APPID = res.appID
                let user = await User.findOne({
                    _id: query.id
                })
                console.log(user)
                if (user) {
                    if (user.expires_time > now) {
                        Json.res(ctx, 200, '成功')
                    } else {
                        let refreshUrl = "https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=" + APPID + "&grant_type=refresh_token&refresh_token=" + user.refresh_token
                        let refreshResult = await axios.get(refreshUrl)
                        if (refreshResult.status === 200) {
                            if (refreshResult.data.hasOwnProperty('access_token')) {
                                let refreshData = {
                                    access_token: refreshResult.data.access_token,
                                    expires_time: now + refreshResult.data.expires_in * 1000,
                                    refresh_token: refreshResult.data.refresh_token,
                                    scope: refreshResult.data.scope
                                }
                                try {
                                    let refreshUser = await User.updateOne({
                                        openid: refreshResult.data.openid
                                    }, {
                                            $set: refreshData
                                        })
                                    if (refreshUser) {
                                        Json.res(ctx, 200, '成功')
                                    } else {
                                        Json.res(ctx, 201, '更新用户失败')
                                    }
                                } catch (error) {
                                    Json.res(ctx, 201, '数据查找错误')
                                }
                            } else {
                                Json.res(ctx, 201, '获取token失败')
                            }
                        } else {
                            Json.res(ctx, 201, '刷新token失败')
                        }
                    }
                } else {
                    Json.res(ctx, 201, '用户查找错误')
                }

            } catch (error) {
                Json.res(ctx, 201, '数据查找错误')
            }

        } else {
            Json.res(ctx, 201, '参数不完整')
        }
    },
    getJstoken: async (ctx, next) => {
        let query = ctx.request.query
        let res = await Wx.findOne({
            id: '1'
        })
        let now = new Date().getTime()
        if (res && query.url) {
            if (res.ticket_expires > now) {
                let sighResultfirst = sign(res.ticket, query.url)
                sighResultfirst.appid = res.appID
                Json.res(ctx, 200, '更新成功', {
                    sign: sighResultfirst
                })
            } else {
                let getToken = await axios.get('http://yjl.ty6068.com/CJAPI/CJSys/AccessTokenHandler')
                let ACCESS_TOKEN
                if (getToken.data.Status) {
                    ACCESS_TOKEN = getToken.data.Data.access_token
                }
                // let tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + res.appID + '&secret=' + res.appsecret
                // let tokenResult = await axios.get(tokenUrl)
                let ticketUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + ACCESS_TOKEN + "&type=jsapi"
                let ticketResult = await axios.get(ticketUrl)

                if (ticketResult.status === 200) {
                    let tokenData = {
                        "accessToken": ACCESS_TOKEN,
                        "accessToken_expires": 0,
                        "ticket": ticketResult.data.ticket,
                        "ticket_expires": now + ticketResult.data.expires_in * 1000
                    }
                    let tokenUpdate = await Wx.updateOne({
                        id: '1'
                    }, {
                            $set: tokenData
                        })
                    let sighResult = sign(ticketResult.data.ticket, query.url)
                    sighResult.appid = res.appID
                    if (tokenUpdate) {
                        Json.res(ctx, 200, '更新成功', {
                            sign: sighResult
                        })
                    } else {
                        Json.res(ctx, 201, '失败')
                    }
                } else {
                    Json.res(ctx, 201, '失败')
                }
            }
        } else {
            Json.res(ctx, 201, '失败')
        }
    }
}