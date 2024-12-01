const { task } = require("hardhat/config");

task("burn-source-chain-nft").setAction(async(taskArgs,hre)=>{
    const { firstAccount } = await getNamedAccounts()

    const nft = await ethers.getContract("MyToken", firstAccount)
    const nftSupply = await nft.totalSupply()
    console.log(`当前共产生${nftSupply}个nft`)
    if(nftSupply == 0){
        console.log(`当前没有MT代币`)
    }else{
        for(let tokenId=0;tokenId < nftSupply;tokenId++){
            const tokenIdOwner = await nft.ownerOf(tokenId)
            console.log(`当前tokenId为${tokenId}代币的Owner是${tokenIdOwner}`)
            if(tokenIdOwner == firstAccount){
                console.log(`当前tokenId${tokenId}的owner是firstAccount`)
                await nft.burn(tokenId)
                console.log(`当前tokenId${tokenId}的代币被销毁`)
            }else{
                console.log(`当前tokenId${tokenId}的owner不是firstAccount，是${tokenIdOwner}`)
            }
        }
    }
})