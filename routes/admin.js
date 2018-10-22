const router = require('koa-router')()
const Admin = require('../src/controller/admin/admin')

router.prefix('/admin')


router.post('/login', (ctx, next) => {
    return Admin.login(ctx, next)
})

router.get('/getUserList', async (ctx, next) => {
    return Admin.getUserList(ctx, next)
})

router.get('/comfirm', async (ctx, next) => {
    return Admin.comfirmUpload(ctx, next)
})

router.get('/getUploadList', async (ctx, next) => {
    return Admin.getUploadList(ctx, next)
})

router.get('/getJf', async (ctx, next) => {
    return Admin.getJf(ctx, next)
})

router.get('/getLimit', async (ctx, next) => {
    return Admin.getLimt(ctx, next)
})

router.get('/setLimit', async (ctx, next) => {
    return Admin.setLimt(ctx, next)
})

module.exports = router