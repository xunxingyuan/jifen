const db = require('../../db/index')
const User = db.User
const Json = require('../../tools/jsonResponse')

module.exports = {
    register: async (ctx, next) => {
        let req = ctx.request.body
        let phone = req.phone
        let res = await User.find({ phone: phone })
        if (res.length !== 0) {
            Json.res(ctx, 201, '用户已经存在')
        } else {
            let now = new Date().getTime()
            let id = now + '_' + Math.floor(Math.random()*10000)
            let data = {
                "id": id,
                "phone": req.phone,
                "name": req.name,
                "nick": req.nick,
                "email": req.email,
                "level": 1,
                "experience": 0,
                "icon": "",
                "introduce": "",
                "create": now
            }
            const result = await new User(data).save()
            if (result) {
                Json.res(ctx, 200, '新建用户成功')
            } else {
                Json.res(ctx, 10001, '未知错误')
            }
        }
    }
}