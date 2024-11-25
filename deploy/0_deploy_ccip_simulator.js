const { getNamedAccounts,network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async({getNamedAccounts, deployments}) =>{
    const { firstAccount } = await getNamedAccounts()
    const {deploy,log} = deployments

    log("Deploying CCIPSimulator contract...")
    if(developmentChains.includes(network.name)){
        await deploy("CCIPLocalSimulator",{
            contract: "CCIPLocalSimulator",
            from: firstAccount,
            log: true,
            args:[]
        })
        log("in local,CCIP local deploying")
    }else{
        log("not in local, skip CCIP local")
    }
    log("CCIPSimulator contract deployed successfully...")
}

module.exports.tags = ["mock", "test", "sourcechain", "all"]

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