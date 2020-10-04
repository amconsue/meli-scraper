const Router = require('koa-router');

const mercadoLibre = require('./mercadoLibre/mercadoLibre.routes')(Router);

module.exports = (app) => {
    const router = new Router({
        prefix: `/api`,
    });

    router.use(mercadoLibre.routes());

    app
        .use(router.routes())
        .use(router.allowedMethods());
}
