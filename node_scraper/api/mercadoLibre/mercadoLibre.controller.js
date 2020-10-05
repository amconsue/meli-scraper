const helper = require('./mercadoLibre.helper');

module.exports.scrape = async ctx => {
    // Receive data from POST body and assign them to variables
    let { keyWord, pages, callbackUrl } = ctx.request.body;

    keyWord = keyWord || 'xiaomi'
    pages = pages || 5

    ctx.assert(!isNaN(pages) && Number.isInteger(pages), 500, 'The \'pages\' parameter must be an integer number')
    ctx.assert(callbackUrl, 500, 'Missing Key: \'callbackUrl\' must be defined in POST body')

    // Asynchronously execute helper method sending the key word, pages and callback url
    try {
        helper.scrape(keyWord, pages, callbackUrl);
    }
    catch {
        // TODO Call scraper-admin and update execution status to failed
    }

    ctx.body = { message: 'Scraping proces started' }
    ctx.status = 200
};
