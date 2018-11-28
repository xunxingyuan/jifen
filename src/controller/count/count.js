const db = require('../../db/index')

const Count = db.Count
const CountDetail = db.CountDetail
const Json = require('../../tools/jsonResponse')



module.exports = {
    enterPage: async (ctx, next) =>{
        let query = ctx.request.query
        if(query.id){
            let now = new Date().getTime()
            let countResult = await Count.updateOne({
                name: 'career'
            },{
                $inc: {
                    'total': 1
                }
            })
            let addResult = await  new CountDetail({
                userId: query.id,
                time: now
            }).save()
            if(countResult&&addResult){
                Json.res(ctx, 200, '计数成功')
            }else{
                Json.res(ctx, 201, '更新数据失败')
            }
        }else{
            Json.res(ctx, 201, '参数缺失')
        }
    },
    resultEnter: async (ctx, next) =>{
        let countResult = await Count.updateOne({
            name: 'career'
        },{
            $inc: {
                'finishTotal': 1
            }
        })
        if(countResult){
            Json.res(ctx, 200, '计数成功')
        }else{
            Json.res(ctx, 201, '更新数据失败')
        }
    },
    shareSuccess: async (ctx, next) =>{
        let countResult = await Count.updateOne({
            name: 'career'
        },{
            $inc: {
                'shareTotal': 1
            }
        })
        if(countResult){
            Json.res(ctx, 200, '计数成功')
        }else{
            Json.res(ctx, 201, '更新数据失败')
        }
    }
}