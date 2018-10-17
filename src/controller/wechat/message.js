const Conf = require('../../../conf/conf')
const axios = require('axios')

//通知用户上传成功 

module.exports = {
    sendMessage: (ACCESS_TOKEN, OPENID, sendData, template_id) =>{
        let data = {
            "touser": OPENID,
            "template_id": template_id,
            "url": Conf.url + '/jifen',
            "data": {
                "tip": {
                    "value": sendData.tip,
                    "color": "#173177"
                },
                "name": {
                    "value": sendData.name,
                    "color": "#173177"
                },
                "time": {
                    "value": sendData.time,
                    "color": "#173177"
                },
                "intro": {
                    "value": sendData.intro,
                    "color": "#173177"
                }
            }
        }
        let url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" + ACCESS_TOKEN
        return axios.post(url, data)
    }
}