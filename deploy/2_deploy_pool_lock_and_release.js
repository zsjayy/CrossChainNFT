const { getNamedAccounts } = require("hardhat")
module.exports = async({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts()
    const {deploy,log} = deployments

    log("NFTPoolLockAndRelease contract deploying...")
    //合约部署需要参数_router、_link、_nftAddr
    const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator")
    //获得CCIP的对象（就是在0_deploy_ccip_simulator.js部署后才能获得），方便后面调用CCIP中的函数
    const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator",ccipSimulatorDeployment.address)
    //下面开始调用CCIP中的函数，获取需要的东西
    const ccipConfig = await ccipSimulator.configuration()
    const sourceChainRouter = ccipConfig.sourceRouter_
    const linkTokenAddr = ccipConfig.linkToken_
    const nftDeployment = await deployments.get("MyToken")
    const nftAddr = nftDeployment.address
    await deploy("NFTPoolLockAndRelease",{
        cotract: "NFTPoolLockAndRelease",
        from: firstAccount,
        log: true,
        //这里的传参数_router、_link、_nftAddr
        args:[sourceChainRouter,linkTokenAddr,nftAddr]
    })
    log("NFTPoolLockAndRelease contract deployed")
}

module.exports.tags = ["sourcechain","all"]