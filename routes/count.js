const router = require('koa-router')()

const Count = require('../src/controller/count/count')


router.prefix('/count')

router.get('/enter',async (ctx,next)=>{
  return Count.enterPage(ctx,next)
})

router.get('/result',async (ctx,next)=>{
  return Count.resultEnter(ctx,next)
})

router.get('/share',async (ctx,next)=>{
  return Count.shareSuccess(ctx,next)
})


module.exports = router