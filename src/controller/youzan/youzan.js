const db = require('../../db/index')
const Youzan = db.Youzan
const axios = require('axios')
const Json = require('../../tools/jsonResponse')

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

async function getToken(){
    let now = new Date().getTime()
    let conf = await Youzan.findOne({
        id: '1'
    })
    if (conf.expires_in === "" || conf.expires_in < now) {
        let url = 'https://open.youzan.com/oauth/token'
        let response = await axios.post(url, {
            client_id: conf.client_id,
            client_secret: conf.client_secret,
            grant_type: 'silent',
            kdt_id: conf.kdt_id
        })
        console.log(response)
        if (response.status === 200) {
            let tokenData = {
                access_token: response.data.access_token,
                expires_in: response.data.expires_in * 1000 + now,
                scope: response.data.scope
            }
            let updateData = await Youzan.updateOne({
                id: 1,
            }, {
                    $set: tokenData
                })
            return {
                token: response.data.access_token
            }
        }
    } else {
        return {
            token: conf.access_token
        }
    }
}


module.exports = {
    checkUser: async (phone) => {
        let tokenData = await getToken()
        console.log(tokenData)
        let url = 'https://open.youzan.com/api/oauthentry/youzan.scrm.customer/3.1.0/get'
        let checkUser= await axios.get(url,{
            params: { 
                "access_token": tokenData.token,
                "account":{
                    "account_type": "Mobile", 
                    "account_id": phone 
                }
            }
        })
        return checkUser
        // if(checkUser.data.hasOwnProperty('response')){
        //     let update = await updateUser(phone,nick,tokenData.token)
        //     console.log(update)
        // }else{
        //     let create = await createUser(phone,nick,tokenData.token)
        //     console.log(create)
        // }
    },
     createUser: async (phone,nick) =>{
        let tokenData = await getToken()
        let reqData = {
            "mobile": phone,
            "customer_create":{
                "name": nick
            }
        }
        let url = "https://open.youzan.com/api/oauthentry/youzan.scrm.customer/3.0.0/create?access_token="+ tokenData.token
        return await axios.post(url, reqData)
    },
    updateUser: async (phone,nick) => {
        let tokenData = await getToken()
        let reqData = {
            "account":{
                "account_type": "Mobile", 
                "account_id": phone
            },
            "customer_update":{
                "name": nick
            }
        }
        let url = "https://open.youzan.com/api/oauthentry/youzan.scrm.customer/3.0.0/update?access_token="+ tokenData.token
        return await axios.post(url, reqData)
    }
}
