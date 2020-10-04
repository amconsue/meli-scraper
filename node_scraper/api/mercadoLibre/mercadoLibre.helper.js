const puppeteer = require('puppeteer')

module.exports.scrape = async (ctx, keyWord, pages) => {
    let currentPage = 1
    let items = []
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080',
            '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
        ]
    })

    const page = await browser.newPage()

    await page.goto(`https://listado.mercadolibre.com.co/${keyWord}#D[A:${keyWord}]`);
    while (currentPage <= pages) {
        await page.waitForXPath('/html/body/main/div/div/section/ol');

        let newItems = await page.evaluate(() => {
            itemList = []
            let itemListRaw = document.getElementsByClassName('ui-search-layout__item')
            for (let i = 0; i < itemListRaw.length; i++) {
                item = itemListRaw[i]

                let titleLinkNodes = item.getElementsByClassName('ui-search-item__group__element ui-search-link')
                let highlightNodes = item.getElementsByClassName('ui-search-item__highlight-label__text')
                let priceNodes = item.getElementsByClassName('price-tag-fraction')
                let discountNodes = item.getElementsByClassName('ui-search-price__discount')
                let priceGroupNodes = item.getElementsByClassName('ui-search-item__group ui-search-item__group--price')
                let installmentsChildNodes = priceGroupNodes && priceGroupNodes.length ? priceGroupNodes[0].childNodes : null
                let storeNodes = item.getElementsByClassName('ui-search-official-store-item__link ui-search-link')

                itemList.push({
                    name: titleLinkNodes && titleLinkNodes.length ? titleLinkNodes[0].getAttribute('title') : '',
                    highlight: highlightNodes && highlightNodes.length ? highlightNodes[0].innerText : '',
                    link: titleLinkNodes && titleLinkNodes.length ? titleLinkNodes[0].getAttribute('href') : '',
                    originalPrice: priceNodes && priceNodes.length == 3 ? priceNodes[0].innerText : '',
                    discountPrice: priceNodes && priceNodes.length == 3 ? priceNodes[1].innerText : priceNodes[0].innerText,
                    discount: discountNodes && discountNodes.length ? discountNodes[0].innerText.replace(' OFF', '') : '',
                    installments: installmentsChildNodes && installmentsChildNodes.length > 1 ? installmentsChildNodes[1].innerText.split('\n')[0].replace('x', '') : '',
                    installmentPrice: priceNodes && priceNodes.length == 3 ? priceNodes[2].innerText : priceNodes[1].innerText,
                    storeLink: storeNodes && storeNodes.length ? storeNodes[0].getAttribute('href') : '',
                    store: storeNodes && storeNodes.length ? storeNodes[0].innerText.replace('Vendido por ', '') : ''
                })
            }
            return itemList
        })
        items = items.concat(newItems)

        if (currentPage < pages) {
            await Promise.all([
                await page.click('#root-app > div > div > section > div.ui-search-pagination > ul > li.andes-pagination__button.andes-pagination__button--next > a > span.andes-pagination__arrow-title'),
                await page.waitForXPath('/html/body/main/div/div/section/ol')
            ])
        }
        currentPage++;
    }
    
    console.log(items[items.length-1]);
    await browser.close();

    // ctx.body = { message: 'ok'}
    // ctx.status = 200

    return ctx
};

module.exports.scrape(null, 'xiaomi', 5);
