const { getNamedAccounts } = require("hardhat");
module.exports = async({getNamedAccounts, deployments}) =>{
    const { firstAccount } = await getNamedAccounts()
    const {deploy,log} = deployments

    log("Deploying CCIPSimulator contract...")
    await deploy("CCIPLocalSimulator",{
        contract: "CCIPLocalSimulator",
        from: firstAccount,
        log: true,
        args:[]
    })
    log("CCIPSimulator contract deployed successfully...")
}

module.exports.tags = ["mock", "test", "all"]

// const { getNamedAccounts } = require("hardhat");

// module.exports = async({getNamedAccounts, deployments}) => { 
//     const { firstAccount } = await getNamedAccounts()
//     const { deploy, log } = deployments
//     log("deploy the CCIP local simulator")
//     await deploy("CCIPLocalSimulator", {
//         contract: "CCIPLocalSimulator",
//         from: firstAccount,
//         log: true,
//         args: []
//     })
//     log("CCIP local simulator deployed!")
// }

// module.exports.tags = ["all", "test"]