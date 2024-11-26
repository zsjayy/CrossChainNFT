const { getNamedAccounts, network } = require("hardhat")
const { developmentChains,networkConfig } = require("../helper-hardhat-config");

module.exports = async({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts()
    const {deploy,log} = deployments

    log("NFTPoolLockAndRelease contract deploying...")
    //如果使用的网络在developmentChains，及local就走mock获取对应的参数值
    let sourceChainRouter //根据测试网络的不同赋值
    let linkTokenAddr //根据测试网络的不同赋值
    //这个if判断是去helper-hardhat-config.js找到developmentChains，并且查看developmentChains的里面的值是否包含当前的网络名称
    //developmentChains = ["local", "harhat"]，当前network是根据部署命令 --network [网络名称]确定的
    if(developmentChains.includes(network.name)){
        //合约部署需要参数_router、_link、_nftAddr
        const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator")
        //获得CCIP的对象（就是在0_deploy_ccip_simulator.js部署后才能获得），方便后面调用CCIP中的函数
        const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator",ccipSimulatorDeployment.address)
        const ccipConfig = await ccipSimulator.configuration()
        //把sourceChainRouter、linkTokenAddr两个参数提炼出来，改变作用域
        sourceChainRouter = ccipConfig.sourceRouter_
        linkTokenAddr = ccipConfig.linkToken_
    }else{
        sourceChainRouter = networkConfig[network.config.chainId].router
        linkTokenAddr = networkConfig[network.config.chainId].linkToken
    }
    //下面开始调用CCIP中的函数，获取需要的东西
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