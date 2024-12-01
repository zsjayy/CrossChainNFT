const {task} = require("hardhat/config");

task("check-wnft").setAction(async(taskArgs, hre)=>{
    const {firstAccount} = await getNamedAccounts()
    const wnft = await ethers.getContract("WrappedMyToken", firstAccount)
    console.log(`wnft合约被成功部署，合约地址是 ${await wnft.target}`)
    // const tokenId = taskArgs.tokenid
    const totalSupply = await wnft.totalSupply()
    console.log(`there are ${totalSupply} in wnft Pool`)

    // 由于这里的token会被转移到其他链上，所以可能不会从0开始
    for(let tokenId = 0; tokenId < totalSupply; tokenId++) {
        try{
            const owner = await wnft.ownerOf(tokenId)
            console.log(`TokenId: ${tokenId}, Owner is ${owner}`)
        }catch (error){
            if(error.code == 3){
                console.error(`tokenId为${tokenId}的代币不存在当前合约中,错误码为:`,error.code)
            }else{
                console.error(`其他未知错误`,error)
            }
            
        }
    }
})

module.exports = {}