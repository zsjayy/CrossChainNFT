moudle.exports = async({getNameAccounts, deployments}) =>{
    const firstAccount = await getNameAccounts()
    const deploy = await deployments()

    log("Deploying CCIPSimulator contract...")
    await deploy("CCIPLocalSimulator",{
        contract: "CCIPLocalSimulator",
        fromAccount: firstAccount,
        log: true,
        agrs:[]
    })
    log("CCIPSimulator contract deployed successfully...")
}

moudle.exports.tags = ["mock", "test", "all"]