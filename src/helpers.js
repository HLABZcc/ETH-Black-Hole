const updateGasPrice = async (web3) => {
    const newGasPrice =
        (await web3.eth.getGasPrice().catch(() => {
            console.log(
                'Error getting gas price, maybe being rate limited...\nFuck it, will just use 15 lol'
            )
        })) || 15
    return parseInt((newGasPrice / 10 ** 9 + 10).toFixed(0))
}

module.exports = {
    updateGasPrice,
}
