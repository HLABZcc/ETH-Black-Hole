const Web3 = require('web3')
const keys = require('../keys.json')
const fs = require('fs');
require('dotenv').config()

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_SERVER));

async function check() {
    const validKeys = []
    for (key of keys) {
        const balance = await web3.eth.getBalance(key.public)
        if (balance > 0) {
            console.log(`${key.public} has ${balance}`)
            validKeys.push(key)
        }
    }
    console.log(validKeys)
    fs.writeFileSync('./newKeys.json', JSON.stringify(validKeys))
}
check()
