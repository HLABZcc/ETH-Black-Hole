const Tx = require('ethereumjs-tx').Transaction
const Common = require('@ethereumjs/common')

// constants
const gasLimit = 100000
const BSC_MAIN = Common.default.forCustomChain(
    'mainnet',
    {
        name: 'bnb',
        networkId: 56,
        chainId: 56,
    },
    'petersburg'
)

const withdrawAllFromKey = async (web3, gasPrice, key) => {
    var weiAmount = parseInt(await web3.eth.getBalance(key.public).catch((err) => {
        console.log('(getBalance) maybe being rate limited... ', err)
        return;
    }))
    if (!weiAmount || weiAmount < 0) return;

    let txCount = await web3.eth.getTransactionCount(key.public).catch((err) => {
        console.log('(getTransactionCount) maybe being rate limited... ', err)
        return;
    })
    let nonce = `${txCount++}`

    weiAmount = weiAmount - gasPrice * gasLimit
    if (weiAmount < 0) return;
    // Convert nonce, ethAmount, gasPrice and gasLimit to hex
    const nonceHex = web3.utils.numberToHex(nonce)
    const weiAmountHex = web3.utils.toHex(weiAmount)
    const gasPriceHex = web3.utils.toHex(gasPrice)
    const gasLimitHex = web3.utils.toHex(gasLimit)

    var transactionOptions = {
        nonce: nonceHex,
        gasPrice: gasPriceHex,
        gasLimit: gasLimitHex,
        from: key.public,
        to: process.env.TO_ADDRESS,
        value: weiAmountHex,
    }

    // Create Transaction instance and sign it
    var tx = new Tx(transactionOptions, { common: BSC_MAIN })
    try {
        tx.sign(Buffer.from(key.private, 'hex'))
    } catch {
        return console.error('Error Signing:', key.private)
    }
    var stx = tx.serialize()

    const hash = await web3.eth
        .sendSignedTransaction('0x' + stx.toString('hex'))
        .catch((err) => {
            if (err) {
                if (
                    !err.message.includes('transaction underpriced') &&
                    !err.message.includes(
                        'insufficient funds for gas * price + value'
                    )
                ) {
                    console.error('Error:', err.message)
                }
                return
            }
        })
    if (hash) console.log('sent tx: ' + hash)
    return
}


module.exports = {
    withdrawAllFromKey,
}
