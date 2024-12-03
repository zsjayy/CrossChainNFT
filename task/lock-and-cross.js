const { task } = require("hardhat/config");
const { networkConfig } = require("../helper-hardhat-config");


task("lock-and-cross")
    .addParam("tokenid","tokenId to be locked and crossed")
    .addOptionalParam("chainselector","chain selector of destionation chain")
    .addOptionalParam("receiver","receiver in the destination chain")
    .setAction(async(taskArgs, hre)=>{
        let chainSelector
        let receiver

        const { firstAccount } = await getNamedAccounts()
        console.log(`firstAccount的账户地址: ${firstAccount}`)
        const tokenId = taskArgs.tokenid

        if(taskArgs.chainselector){
            chainSelector = taskArgs.chainselector
        }else{
            //注意这里的配置对应的是amoy的chain selector
            chainSelector = await networkConfig[network.config.chainId].companionChainSelector
            console.log(`未在命令行中添加参数：--chainselector [amoy的chain selector]`)
        }
        console.log(`chainSelector is ${chainSelector}`)

        if(taskArgs.receiver){
            receiver = taskArgs.receiver
        }else{
            //设置目标合约部署的网络amoy:hre.companionNetworks['destChain']
            const nftPoolBurnAndMintDeployment = await hre.companionNetworks["destChain"].deployments.get("NFTPoolBurnAndMint")
            receiver = nftPoolBurnAndMintDeployment.address
            console.log(`未在命令行中添加参数：--receiver [目标链合约的address]`)
        }
        console.log(`目标链合约地址receiver's address is ${receiver}`)


        //条件一：解决部署费用问题,往source pool中转token用来支付ccip的费用
        //调用lockAndSent需要用到Mytoken合约中的transferFrom方法，所以要先部署合约，合约部署需要gas，事先要在对应网络链上预留fee
        const linkTokenAddress = await networkConfig[network.config.chainId].linkToken
        //获取已经被部署过的合约LinkToken
        const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress)
        const linkTokenAddr = await linkToken.target
        console.log(`通证合约linkToken address is ${linkTokenAddr}`)
        const linkTokenBalacneOf = await linkToken.balanceOf(linkToken.target)
        console.log(`通证合约lnikToken's balance is ${linkTokenBalacneOf}`)

        //创建一个新的合约部署
        const nftPoolLockAndRelease = await ethers.getContract("NFTPoolLockAndRelease",firstAccount)
        console.log(`nftPoolLockAndRelease的合约地址 ${nftPoolLockAndRelease.target}`)

        //往nftPoolLockAndRelease合约上转token用以支付fee
        let sourceChainBalanceOfCurrent
        sourceChainBalanceOfCurrent = await linkToken.balanceOf(nftPoolLockAndRelease.target)
        if(sourceChainBalanceOfCurrent==0){
            console.log(`balanceOfBefore balance is ${sourceChainBalanceOfCurrent}`)
            const transferTx = await linkToken.transfer(nftPoolLockAndRelease.target, ethers.parseEther("10"))
            await transferTx.wait(6)
            console.log(`balanceOfAfter balance is ${sourceChainBalanceOfCurrent}`)
        }else{
            console.log(`当前源链Pool合约余额为${sourceChainBalanceOfCurrent}`)
        }
        //条件二：解决NFTPoolLockAndRelease转移MyToken代币问题
        //检查合约部署者和token拥有者是不是一个地址
        const nft = await ethers.getContract("MyToken",firstAccount)
        console.log(`nft合约的owner: ${firstAccount}`)
        const ownerOf = await nft.ownerOf(tokenId)
        console.log(`tokenId为${tokenId}的owner ${ownerOf}`)

        const approveTx = await nft.approve(nftPoolLockAndRelease.target,tokenId)
        await approveTx.wait()
        console.log(`Approved tokenId ${tokenId} for ${nftPoolLockAndRelease.target}, transaction hash: ${approveTx.hash}`)
        const approveOwnerOf = await nft.getApproved(tokenId)
        console.log(`${tokenId} 被授权的owner ${approveOwnerOf}`)

        //开始调用lockAndSentNFT函数
        // ccip send
        // let [account] = await ethers.getSigners()
        const accountBalanceBefore = await ethers.provider.getBalance(firstAccount)
        console.log(`交易前检查账户余额......,账户：${firstAccount},余额：${accountBalanceBefore}`)
        try{

            const lockAndCrossTx = await nftPoolLockAndRelease.lockAndSendNFT(
                tokenId,
                firstAccount,
                chainSelector,
                receiver,
                { gasLimit: 500000 }
            )
            await lockAndCrossTx.wait(6)
            //等待6个区块后，account的balance才会有变化
            console.log(`NFT locked and crossed, transaction hash is ${lockAndCrossTx.hash}`)
            const accountBalanceAfter = await ethers.provider.getBalance(firstAccount)
            console.log(`交易后检查账户余额......,账户：${firstAccount},余额：${accountBalanceAfter}`)
            console.log(`==================================
                "code":200,
                "message":转移成功,
                "转移的tokenId":${tokenId},
                "from":${firstAccount},
                "to":${receiver}
                "执行合约Address":${nftPoolLockAndRelease.target},
                "执行前账户余额":${accountBalanceBefore},
                "执行后账户余额":${accountBalanceAfter},
                "交易hash":${lockAndCrossTx.hash}
==================================`)
        }catch (error){
            console.error("Full error object:", error);
        }
})

module.exports = {}