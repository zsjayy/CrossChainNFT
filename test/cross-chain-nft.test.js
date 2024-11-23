const { getNamedAccounts, ethers, deployments } = require("hardhat");
const { expect } = require("chai");

//把变量提取出来，方便后面的测试函数调用
let firstAccount
let ccipSimulator
let nft
let NFTPoolLockAndRelease
let wnft
let NFTPoolBurnAndMint
let chainSelector
before(async function(){
    //准备变量--账号
    firstAccount = (await getNamedAccounts()).firstAccount
    //准备变量--合约，通过tag，部署所有合约
    await deployments.fixture(["all"])
    ccipSimulator = await ethers.getContract("CCIPLocalSimulator",firstAccount)
    nft = await ethers.getContract("MyToken",firstAccount)
    NFTPoolLockAndRelease = await ethers.getContract("NFTPoolLockAndRelease",firstAccount)
    wnft = await ethers.getContract("WrappedMyToken",firstAccount)
    NFTPoolBurnAndMint = await ethers.getContract("NFTPoolBurnAndMint",firstAccount)
    const ccipConfig = await ccipSimulator.configuration()
    console.log("ccipConfig:",ccipConfig)
    chainSelector = ccipConfig.chainSelector_
    console.log("chainSelector:",chainSelector)

})

//第一步：源链sourcechain--》目标链destchain
describe("source chain -> dest chain test", async function(){
    //test1--是否成功mint
    it("test if user can mint one nft from MyToken contract successfully",
        async function () {
            await nft.safeMint(firstAccount)
            const owner = await nft.ownerOf(0)
            expect(owner).to.equal(firstAccount)    
        }
    )

    //test2--是否将nft已经lock在源链的pool中，并通过ccip将message发送给目标链
    it("test if nft has locked in source pool and send message to dest pool successfully",
        async function(){
            //await nft.transferFrom(firstAccount,NFTPoolLockAndRelease.target,0),不能直接这么用
            //这是在测试NFTPoolLockAndRelease合约中lockAndSendNFT()函数，该函数中使用的nft.transferFrom()，调用的是MyToken合约中的transferFrom()
            //所以NFTPoolLockAndRelease合约本身不具备转移nft的权限
            //先授权--将id为0的nft授权给NFTPoolLockAndRelease合约（执行lockAndSendNFT所需条件一）
            await nft.approve(NFTPoolLockAndRelease.target,0)
            console.log("nft's approval:",await nft.approve(NFTPoolLockAndRelease.target,0))
            //执行lockAndSentNFT需要fee（执行lockAndSendNFT所需条件二）
            await ccipSimulator.requestLinkFromFaucet(NFTPoolLockAndRelease, ethers.parseEther("10"))
            
            //参考合约中的入参进行赋值uint256 tokenId, newOwner, chainSelector, revceiver
            //lockAndSendNFT包含两个步骤：1.将nft从firstAccount转移到NFTPoolLockAndRelease合约；2.通过ccip发送消息
            console.log("newOwner:",firstAccount)
            console.log("chainSelector:",chainSelector)
            
            const receiverAddr = NFTPoolBurnAndMint.target
            console.log("receiver:",receiverAddr)
            await NFTPoolLockAndRelease.lockAndSendNFT(0,firstAccount,chainSelector,receiverAddr)
            //检查是不是完成了第一步的转移
            const owner = await nft.ownerOf(0)
            console.log("newOwner:",owner)
            expect(owner).to.equal(NFTPoolLockAndRelease.target)
        }
    )

    //test3--目标链接收到并mint新的wnft
    it("test if user can get a wrapped nft in dest chain",
        async function(){
            //当源链完成lockAndSendNFT后,会通过CCIP发送消息给目标链，目标链上就会mint一个wnft
            //所以只要验证目标链上是否有id为0的wnft存在,即owner不是空值，且owner为firstAccount
            const owner = await wnft.ownerOf(0)
            expect(owner).to.equal(firstAccount)

    })
})


//第二步：目标链destchain--》源链sourcechain
//目标链的wnft被burn掉，并通过ccip发送message给源链

//源链接收到信息后，nft被unlock