const router = require('koa-router')()
const wx = require('../src/controller/auth/wx')
router.prefix('/auth')

router.get('/getAuth', async (ctx, next) => {
  return wx.getCode(ctx, next)
})

router.get('/getToken', async (ctx, next) => {
  return wx.getToken(ctx, next)
})

router.get('/getSign', async (ctx, next) => {
  return wx.getJstoken(ctx, next)
})

router.get('/updateToken', async (ctx, next) => {
  return wx.updateToken(ctx, next)
})

module.exports = router