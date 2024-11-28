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
            console.log(`chainSelector is not set in comand`)
        }
        console.log(`chainSelector is ${chainSelector}`)

        if(taskArgs.receiver){
            receiver = taskArgs.receiver
        }else{
            //设置目标合约部署的网络amoy:hre.companionNetworks['destChain']
            const nftPoolBurnAndMintDeployment = await hre.companionNetworks["destChain"].deployments.get("NFTPoolBurnAndMint")
            receiver = nftPoolBurnAndMintDeployment.address
            console.log(`receiver is not set in comand`)
        }
        console.log(`receiver's address is ${receiver}`)


        //条件一：解决部署费用问题,往source pool中转token用来支付ccip的费用
        //调用lockAndSent需要用到Mytoken合约中的transferFrom方法，所以要先部署合约，合约部署需要gas，事先要在对应网络链上预留fee
        const linkTokenAddress = await networkConfig[network.config.chainId].linkToken
        //获取已经被部署过的合约LinkToken
        const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress)
        const linkTokenBalacneOf = await linkToken.balanceOf(linkToken.target)
        console.log(`lnikToken's balance is ${linkTokenBalacneOf}`)
        //创建一个新的合约部署
        const nftPoolLockAndRelease = await ethers.getContract("NFTPoolLockAndRelease",firstAccount)
        console.log(`nftPoolLockAndRelease的合约地址 ${nftPoolLockAndRelease.target}`)
        const balanceOfBefore = await linkToken.balanceOf(nftPoolLockAndRelease.target)
        console.log(`balanceOfBefore balance is ${balanceOfBefore}`)
        const transferTx = await linkToken.transfer(nftPoolLockAndRelease.target, ethers.parseEther("10"))
        // const transferTxFirstAccount = await linkToken.transfer(firstAccount, ethers.parseEther("10"))
        await transferTx.wait(6)
        // await transferTxFirstAccount.wait()
        const balanceOfAfter = await linkToken.balanceOf(nftPoolLockAndRelease.target)
        const balanceOfFirstAccountAfter = await linkToken.balanceOf(firstAccount)
        console.log(`balanceOfAfter balance is ${balanceOfAfter}`)
        // const balance = await linkToken.balanceOf()
        // console.log(`balance of pool is ${balance}`)
        console.log('pool have fee')

        //条件二：解决NFTPoolLockAndRelease转移MyToken代币问题
        //检查合约部署者和token拥有者是不是一个地址
        const nft = await ethers.getContract("MyToken",firstAccount)
        console.log(`nft合约的owner: ${firstAccount}`)
        const ownerOf = await nft.ownerOf(tokenId)
        console.log(`tokenId为0的owner ${ownerOf}`)

        const approveTx = await nft.approve(nftPoolLockAndRelease.target,tokenId)
        await approveTx.wait()
        console.log(`Approved tokenId ${tokenId} for ${nftPoolLockAndRelease.target}, transaction hash: ${approveTx.hash}`)
        const approveOwnerOf = await nft.getApproved(tokenId)
        console.log(`${tokenId} 被授权的owner ${approveOwnerOf}`)

        //开始调用lockAndSentNFT函数
        // ccip send
        console.log(`${tokenId}, ${firstAccount}, ${chainSelector}, ${receiver}`)
        try{
            const lockAndCrossTx = await nftPoolLockAndRelease.lockAndSendNFT(
                tokenId,
                firstAccount,
                chainSelector,
                receiver,
                { gasLimit: 8000000 }
            )
            console.log(`NFT locked and crossed, transaction hash is ${lockAndCrossTx.hash}`)
        }catch (error){
            console.error("Full error object:", error);
        }
})

module.exports = {}