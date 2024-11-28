const {task} = require("hardhat/config");

task("check-wnft")
    .addParam("tokenid","cross token's id")
    .setAction(async(taskArgs, hre)=>{
    const {firstAccount} = await getNamedAccounts()
    const wnft = await ethers.getContract("WrappedMyToken", firstAccount)
    const tokenId = taskArgs.tokenid
    const totalSupply = await wnft.totalSupply()
    console.log(`there are ${totalSupply} in wnft Pool`)

    const wnftOwner = await wnft.ownerOf(tokenId)
    console.log(`${tokenId} 的owner is ${wnftOwner}`)
})

module.exports = {}