const { getNamedAccounts } = require("hardhat")
module.exports = async({getNamedAccounts,deployments}) =>{
    const {firstAccount} = await getNamedAccounts()
    const {deploy,log} = deployments

    //需要获取相应的参数_router,  _link,  _wnftAddr
    const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator")
    const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator",ccipSimulatorDeployment.address)
    const ccipConfig = await ccipSimulator.configuration()
    const destRouter = ccipConfig.destinationRouter_
    const linkTokenAddr = ccipConfig.linkToken_

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