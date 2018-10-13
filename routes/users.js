const router = require('koa-router')()

const Register = require('../src/controller/user/register')

router.prefix('/users')


router.post('/register', async (ctx, next) => {
  await Register.register(ctx,next)
})

module.exports = router
