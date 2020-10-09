const puppeteer = require('puppeteer')
const service = require('./mercadoLibre.service')

module.exports.scrape = async (keyWord, pages, callbackUrl) => {
    let currentPage = 1
    let items = []
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.CHROMIUM_PATH,
        args: ['--no-sandbox'],
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
                let highlightSelector = document.querySelector(
                    `#root-app > div > div > section > ol > li:nth-child(${i+1}) > div > div > div.ui-search-result__content-wrapper > div.ui-search-item__highlight-label.ui-search-item__highlight-label--best_seller > span`)
                let priceNodes = item.getElementsByClassName('price-tag-fraction')
                let discountPercentageNodes = item.getElementsByClassName('ui-search-price__discount')
                let priceGroupNodes = item.getElementsByClassName('ui-search-item__group ui-search-item__group--price')
                let installmentsChildNodes = priceGroupNodes && priceGroupNodes.length ? priceGroupNodes[0].childNodes : null
                let storeNodes = item.getElementsByClassName('ui-search-official-store-item__link ui-search-link')

                itemList.push({
                    name: titleLinkNodes && titleLinkNodes.length ? titleLinkNodes[0].getAttribute('title') : '',
                    highlight: highlightSelector ? highlightSelector.innerText : '',
                    link: titleLinkNodes && titleLinkNodes.length ? titleLinkNodes[0].getAttribute('href') : '',
                    original_price: priceNodes && priceNodes.length ? priceNodes[0].innerText : '',
                    discount_price: priceNodes && priceNodes.length == 3 ? priceNodes[1].innerText : '',
                    discount_percentage: discountPercentageNodes && discountPercentageNodes.length ? discountPercentageNodes[0].innerText.replace(' OFF', '') : '',
                    installments: installmentsChildNodes && installmentsChildNodes.length > 1 ? installmentsChildNodes[1].innerText.split('\n')[0].replace('x', '') : '',
                    price_per_installment: priceNodes && priceNodes.length == 3 ? priceNodes[2].innerText : priceNodes[1].innerText,
                    store_link: storeNodes && storeNodes.length ? storeNodes[0].getAttribute('href') : '',
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

    await service.postExecutionItems(callbackUrl, items)
    
    await browser.close();
};
