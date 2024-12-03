// const { getNamedAccounts } = require("hardhat");
const { task } = require("hardhat/config");

task("mint-nft").setAction(async(taskArgs, hre) => {
    const { firstAccount } = await getNamedAccounts()
    const nft = await ethers.getContract("MyToken", firstAccount)

    console.log(`ntf contract address is: ${nft.target}`)

    console.log("nft contract deploying....")
    //尝试1:通过交易日志查询到tokenId
    const mintTx = await nft.safeMint(firstAccount)
    // const mintReceipt = await mintTx.wait()
    // const mintReceiptString = JSON.stringify(mintReceipt,null,2)
    // console.log(`合约交易信息内容是：${mintReceiptString}`)
    // const tokenId = await mintReceiptString.logs[0].args.tokenId

    //尝试2:通过合约新增getTokenIdsByOwner()方法查询tokenId
    // await nft.safeMint(firstAccount)
    await mintTx.wait()
    //这里得到的结果是个list
    const gettokenIdList = await nft.getTokenIdsByOwner(firstAccount)
    //当前用户拥有的tokenId数量
    const gettokenIdAmount = gettokenIdList.length
    const gettokenId = gettokenIdList.toString() 
    console.log(`当前用户${firstAccount}一共拥有的${gettokenIdAmount}个tokenId,分别为${gettokenId}`)


    // const tokenAmount = await nft.totalSupply()
    // const tokenIdMax = tokenId + tokenAmount
    //这个tokenId有误导性，被burn掉的tokenId没有被重置，后续铸造的代币tokenId依旧会继续累加，与totalSupply对不上
    // const tokenId = await tokenAmount - 1n
    // console.log(`nft minted,当前共有${tokenAmount}个MT代币,tokenId 为 ${tokenId}`)
})

module.exports = {}

// const { deployments } = require("hardhat")
// const { task } = require("hardhat/config")

// task("mint-nft").setAction(async(taskArgs, hre) => {
//     const {firstAccount} = await getNamedAccounts()
//     const nft = await ethers.getContract("MyToken", firstAccount)

//     console.log(`nft address is ${nft.target}`)
  
//     console.log("minting NFT...")
//     const mintTx = await nft.safeMint(firstAccount)
//     await mintTx.wait(6)
//     const tokenAmount = await nft.totalSupply()
//     const tokenId = tokenAmount - 1n
//     console.log(`NFT minted, tokenId is ${tokenId}`)
// })


// module.exports = {}