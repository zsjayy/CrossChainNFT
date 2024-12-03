// const { getNamedAccounts } = require("hardhat");
const { task } = require("hardhat/config");
const { networkConfig } = require("../helper-hardhat-config");

task("burn-and-cross")
    .addParam("tokenid","token should be cross")
    .addOptionalParam("chainSelector","chain selector of source chain")
    .addOptionalParam("receiver","token will be sent target contract")
    .setAction(async(taskArgs, hre)=>{
        //参数1:tokenId
        const tokenId = taskArgs.tokenid
        //参数2:newOwner
        const { firstAccount } = await getNamedAccounts()
        let chainSelector
        let receiver
        let nftPoolLockAndReleaseDeployment

        //参数3:chainSelctor
        if(taskArgs.chainSelector){
            chainSelector = taskArgs.chainSelector
        }else{
            //是amoy对应的‘目标链’，即sepolia链
            chainSelector = await networkConfig[network.config.chainId].companionChainSelector
            console.log("命令行中没有设置--network[参数]")
        }

        //参数4:receiver
        if(taskArgs.receiver){
            receiver = taskArgs.receiver
        }else{
            //receiver--源链合约NFTPoolLockAndRelease的合约地址,所以要用源链的网络sepolia进行部署
            nftPoolLockAndReleaseDeployment = await hre.companionNetworks["destChain"].deployments.get("NFTPoolLockAndRelease")
            receiver = await nftPoolLockAndReleaseDeployment.address
            console.log("命令行中没有设置--recevier[参数]")
        }

        //部署nftPoolBurnAndMint合约
        const nftPoolBurnAndMint = await ethers.getContract("NFTPoolBurnAndMint",firstAccount)
        console.log(`NFTPoolBurnAndMint的合约地址address为${nftPoolBurnAndMint.target}`)
        
        //调用burnAndSendNFT需要满足两个条件
        //条件1:链上交易需要预留余额
        const linkTokenAddress = await networkConfig[network.config.chainId].linkToken
        //获取已经被部署过的合约LinkToken
        const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress)
        let currentDestPoolBalanceOf
        //查看当前目标链的余额
        currentDestPoolBalanceOf = await linkToken.balanceOf(nftPoolBurnAndMint.target)
        console.log(`nftPoolBurnAndMint has fee is ${currentDestPoolBalanceOf}`)
        //整个账户余额是获取到Faucet水龙头转的token
        const firstAccountBalanceOf = await linkToken.balanceOf(firstAccount)
        console.log(`firstAccount linkToken's balanceOf is ${firstAccountBalanceOf}`)
    
        if(currentDestPoolBalanceOf == 0){
            console.log(`正在往目标链合约里转代币`)
            const transferTx = await linkToken.transferFrom(firstAccount,nftPoolBurnAndMint.taeget,ethers.parseEther("10"))
            currentDestPoolBalanceOf =await linkToken.balanceOf(nftPoolBurnAndMint.target)
            console.log(`目标链已接受代币，当前目标链balanceOf is ${currentDestPoolBalanceOf}`)
        }else{
            console.log(`当前目标链Pool合约余额为 ${currentDestPoolBalanceOf}`)
        }
        
        
        //将wnft的approve授权给合约NFTPoolBurnAndMint
        const wnft = await ethers.getContract("WrappedMyToken", firstAccount)
        console.log(`当前tokenId为 ${tokenId} 的代币owner is ${ await wnft.target}`)
        const approveTx = await wnft.approve(nftPoolBurnAndMint.target, tokenId)
        await approveTx.wait()
        const approveResult =await wnft.getApproved(tokenId)
        console.log(`${tokenId} 授权给了 ${approveResult}`)

        
        const accountBalanceBefore = await ethers.provider.getBalance(firstAccount)
        console.log(`交易前检查账户余额......,账户：${firstAccount},余额：${accountBalanceBefore}`)
        //执行burnAndMint函数方法
        try{
            const burnAndCrossTx = await nftPoolBurnAndMint.burnAndSendNFT(
                tokenId,
                firstAccount,
                chainSelector,
                receiver
            )
            await burnAndCrossTx.wait(6)
            console.log(`tokenId为${tokenId}的wnft被burned,并通过ccip发送message给源链,Hx:${burnAndCrossTx.hash}`)
            const accountBalanceAfter = await ethers.provider.getBalance(firstAccount)
            console.log(`交易后检查账户余额......,账户：${firstAccount},余额：${accountBalanceAfter}`)
            console.log(`==================================
                "code":200,
                "message":转移成功,
                "转移的tokenId":${tokenId},
                "from":${firstAccount},
                "to":${receiver}
                "执行合约Address":${nftPoolBurnAndMint.target},
                "执行前账户余额":${accountBalanceBefore},
                "执行后账户余额":${accountBalanceAfter},
                "交易hash":${burnAndCrossTx.hash}
==================================`)
        }catch (error){
            console.error(`报错内容为：`,error)
        }
        
})

exports.module = {}