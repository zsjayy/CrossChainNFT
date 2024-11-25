const { getNamedAccounts, network } = require("hardhat")
const { developmentChains,networkConfig } = require("../helper-hardhat-config");

module.exports = async({getNamedAccounts,deployments}) =>{
    const {firstAccount} = await getNamedAccounts()
    const {deploy,log} = deployments

    log("NFTPoolBurnAndMint contract deploying...")
    //需要获取相应的参数_router,  _link,  _wnftAddr
    let destRouter
    let linkTokenAddr
    if(developmentChains.includes(network.name)){
        const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator")
        const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator",ccipSimulatorDeployment.address)
        const ccipConfig = await ccipSimulator.configuration()
        destRouter = ccipConfig.destinationRouter_
        linkTokenAddr = ccipConfig.linkToken_
    }else{
        destRouter = networkConfig[network.config.chainId].router
        linkTokenAddr = networkConfig[network.config.chainId].linkToken
    }
    const wnftDeployment = await deployments.get("WrappedMyToken")
    const wnftAddr = await wnftDeployment.address

    log("NFTPoolBurnAndMint contract deploying...")
    await deploy("NFTPoolBurnAndMint",{
        contract:"NFTPoolBurnAndMint",
        from:firstAccount,
        log:true,
        args:[destRouter, linkTokenAddr, wnftAddr]
    })
    log("NFTPoolBurnAndMint contract deployed successfully")
}

module.exports.tags = ["destchain","all"]