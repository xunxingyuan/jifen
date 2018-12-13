const db = require('../../db/index')

const Count = db.Count
const CountDetail = db.CountDetail
const Json = require('../../tools/jsonResponse')



module.exports = {
    enterPage: async (ctx, next) =>{
        let query = ctx.request.query
        let countData = await Count.find({
            name: query.channel
        })
        if(countData.length === 0){
            let create = await new Count({
                name: query.channel,
                total: 1,
                finishTotal: 0,
                shareTotal: 0
            })
        }else{
            let countResult = await Count.updateOne({
                name: query.channel
            },{
                $inc: {
                    'total': 1
                }
            })
        }
        if(query.id){
            let now = new Date().getTime()
            
            let addResult = await  new CountDetail({
                userId: query.id,
                time: now,
                channel: query.channel
            }).save()
            if(addResult){
                Json.res(ctx, 200, '计数成功')
            }else{
                Json.res(ctx, 201, '更新数据失败')
            }
        }else{
            Json.res(ctx, 201, '参数缺失')
        }
    },
    resultEnter: async (ctx, next) =>{
        let query = ctx.request.query
        let countResult = await Count.updateOne({
            name: query.channel
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
        let query = ctx.request.query
        let countResult = await Count.updateOne({
            name: query.channel
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