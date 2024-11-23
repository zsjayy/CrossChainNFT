const { getNamedAccounts } = require("hardhat")
module.exports = async({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts()
    const {deploy, log} = deployments

    log("wnft contract is deploying")

    await deploy("WrappedMyToken",{
        contract: "WrappedMyToken",
        from:firstAccount,
        args:["WrappedMyToken", "WMT"],
        log: true
    })
    log("wnft contract deployed successfully")

}

module.exports.tags = ["destchain","all"]

