const { getNamedAccounts, deployments, ethers } = require("hardhat");
const { expect } = require("chai")
const { BigNumber } = require("ethers");

let firstAccount
let nft
before(async function(){
    firstAccount = (await getNamedAccounts()).firstAccount
    await deployments.fixture("nft")
    nft = await ethers.getContract("MyToken",firstAccount)
})

describe("source chain MT token mint test",async function() {
    //test1-是否成功mint
    it("test if user can mint one nft from MyToken contract successfully",
        async function () {
            const tx = await nft.safeMint(firstAccount)
            const receipt = await tx.wait()

            const receiptToString = JSON.stringify(receipt, null, 2) 
            console.log(`receipt的打印输出为:${receiptToString}`)

            const tokenId = await receipt.logs[0].args.tokenId
            console.log(`当前tokenId为${tokenId}`)
            // const tokenIdStatus = await nft.isTokenIdExitStill(tokenId)
            
            // expect(tokenIdStatus).to.equal(true)   
        }
    )
    it("getTokenIdsByOwner()返回正确",
        async function() {
            const tokenId = await nft.getTokenIdsByOwner(firstAccount)
            console.log(`tokenId为${tokenId}`)
        })

})