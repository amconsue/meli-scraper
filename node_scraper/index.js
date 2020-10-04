const http = require('http');
const server = require('./server');

const bootstrap = async () => {
    /**
     * Add external services init as async operations (db, redis, etc...)
     * e.g.
     * await sequelize.authenticate()
     */
    return http.createServer(server.callback()).listen(process.env.NODE_SCRAPER_PORT || 4000);
};

const startServer = async () => {
    await bootstrap()
        .then(server => console.log(`🚀 Server listening on port ${server.address().port}!`))
        .catch(err => {
            setImmediate(() => {
                console.error('Unable to run the server because of the following error:');
                console.error(err);
                process.exit();
            });
        });
};

startServer();