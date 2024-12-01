// const { getNamedAccounts } = require("hardhat")
const { task } = require("hardhat/config")

task("check-nft").setAction(async(taskArgs, hre) => {
    const { firstAccount } =await getNamedAccounts()
    let nft
    let totalSupply
    nft = await ethers.getContract("MyToken", firstAccount)
    console.log(`当前MyToken合约的address为${nft.target}`) 

    console.log("checking status of ERC-721")
    totalSupply = await nft.totalSupply()
    console.log(`there are ${totalSupply} tokens under the collection`)
    for(let tokenId = 0; tokenId <=5; tokenId++) {
        try{
            const owner = await nft.ownerOf(tokenId)
            console.log(`TokenId: ${tokenId}, Owner is ${owner}`)
        }catch (error){
            if(error.code == 3){
                console.error(`tokenId为${tokenId}的代币不存在当前合约中,错误码为:`,error,error.message)
            }else{
                console.error(`其他未知错误`,error)
            }
            
        }

    }
})

module.exports = {}