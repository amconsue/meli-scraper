const helper = require('./mercadoLibre.helper');

module.exports.scrape = async ctx => {
    // Receive data from POST body and assign them to variables
    let { keyWord, pages } = ctx.request.body;

    keyWord = keyWord || 'xiaomi'
    pages = pages || 5

    ctx.assert(!isNaN(pages) && Number.isInteger(pages), 500, 'The \'pages\' parameter must be an integer number')

    // Execute helper method sending the context, token, roles list and permissions list
    await helper.scrape(ctx, keyWord, pages);
};
