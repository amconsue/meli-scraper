const axios = require('axios')

module.exports.postExecutionItems = async (callbackUrl, items) => {
    axios({
        url: callbackUrl,
        method: 'post',
        data: items
    }).then(resp => {
        console.log(`Post to ${callbackUrl} successfull`)
    }).catch(err => {
        console.log(`Post to ${callbackUrl} failed`)
    })
}
