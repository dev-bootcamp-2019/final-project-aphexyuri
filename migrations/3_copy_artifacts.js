var fs = require('fs');

module.exports = async(deployer, network, accounts) => {
  console.log('Copying LAFAssetRegistry.json to client/src/contracts...')

  fs.mkdir('client/src/contracts/', 0744, (err) => {})

  fs.copyFile('build/contracts/LAFAssetRegistry.json', 'client/src/contracts/LAFAssetRegistry.json', (err) => {
    if (err) throw err;
  })
}