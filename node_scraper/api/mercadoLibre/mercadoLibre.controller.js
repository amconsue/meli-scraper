const helper = require('./mercadoLibre.helper');
const service = require('./mercadoLibre.service');

module.exports.scrape = async ctx => {
    let { keyWord, pages, callbackUrl } = ctx.request.body;

    keyWord = keyWord || 'xiaomi'
    pages = pages || 5

    ctx.assert(!isNaN(pages) && Number.isInteger(pages), 500, 'The \'pages\' parameter must be an integer number')
    ctx.assert(callbackUrl, 500, 'Missing Key: \'callbackUrl\' must be defined in POST body')

    // Asynchronously execute helper method sending the key word, pages and callback url
    helper.scrape(keyWord, pages, callbackUrl)
        .catch(err => {
            service.postExecutionItems(callbackUrl + '?error=1', []);
        })

    ctx.body = { message: 'Scraping proces started' }
    ctx.status = 200
};
