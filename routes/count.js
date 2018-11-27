const router = require('koa-router')()

const Count = require('../src/controller/count/count')


router.prefix('/count')

router.get('/enter',async (ctx,next)=>{
  return Count.enterPage(ctx,next)
})


module.exports = router