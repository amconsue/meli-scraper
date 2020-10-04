const controller = require('./mercadoLibre.controller');

module.exports = Router => {
    const router = new Router({
        prefix: '/mercadoLibre',
    });

    router
        .post('/v1/scrape', controller.scrape);

    return router;
};
