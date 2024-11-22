moudle.exports = async({getNameAccounts, deployments}) => {
    const firstAccount = getNameAccounts()
    const deploy = deployments()

    await deploy("NFTPoolLockAndRelease",{
        cotract: "NFTPoolLockAndRelease",
        fromAccount: firstAccount,
        log: true,
        args:[]
    })
}