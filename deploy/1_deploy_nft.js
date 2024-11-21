moudle.exports = async({getNameAccounts, deployments}) => {
    const firstAccount = await getNameAccounts()
    const {deploy, log} = await deployments()

    log("nft contract is deploying")

    await deploy("MyToken",{
        contract: "MyToken",
        from:firstAccount,
        args:["MyToken", "MT"],
        log: true
    })
    log("nft contract deployed successfully")

}

moudle.exports.tags["sourcechain","all"]

