// const { getNamedAccounts } = require("hardhat");
const { task } = require("hardhat/config");

task("mint-nft").setAction(async(taskArgs, hre) => {
    const { firstAccount } = await getNamedAccounts()
    const nft = await ethers.getContract("MyToken", firstAccount)

    console.log(`ntf contract address is: ${nft.target}`)

    console.log("nft contract deploying....")
    const mintTx = await nft.safeMint(firstAccount)
    await mintTx.wait(6)

    const tokenAmount = nft.totalSupply()
    //这个tokenId有误导性，被burn掉的tokenId没有被重置，后续铸造的代币tokenId依旧会继续累加，与totalSupply对不上
    const tokenId = await tokenAmount - 1n
    console.log(`nft minted,tokenId is ${tokenId}`)
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