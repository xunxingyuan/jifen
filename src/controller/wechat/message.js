const Conf = require('../../../conf/conf')
const axios = require('axios')

//通知用户上传成功 

module.exports = {
    sendMessage: async (OPENID, sendData, template_id) => {
        let getToken = await axios.get('http://yjl.ty6068.com/CJAPI/CJSys/AccessTokenHandler')
        let ACCESS_TOKEN
        if(getToken.data.Status){
            ACCESS_TOKEN = getToken.data.Data.access_token
        }
        let data = {
            "touser": OPENID,
            "template_id": template_id,
            "url": Conf.server.url + '/jifen',
            "data": {
                "first": {
                    "value": sendData.first,
                    "color": "#173177"
                },
                "keyword1": {
                    "value": sendData.keyword1,
                    "color": "#173177"
                },
                "keyword2": {
                    "value": sendData.keyword2,
                    "color": "#173177"
                },
                "remark": {
                    "value": sendData.remark,
                    "color": "#173177"
                }
            }
        }
        let url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" + ACCESS_TOKEN
        return axios.post(url, data)
    }
}