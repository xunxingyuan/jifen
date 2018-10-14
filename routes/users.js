const router = require('koa-router')()
const User = require('../src/controller/user/user')

router.prefix('/user')


router.get('/checkInfo', async (ctx, next) => {
  return User.checkUser(ctx,next)
})

router.post('/addUser', async (ctx, next) => {
  return User.addUser(ctx,next)
})

router.post('/updateUser', async (ctx, next) => {
  return User.updateUser(ctx,next)
})

router.post('/uploadImg', async (ctx, next) => {
  return User.uploadImg(ctx,next)
})


module.exports = router
