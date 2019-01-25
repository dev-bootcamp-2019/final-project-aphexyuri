var fs = require('fs');

module.exports = async(deployer, network, accounts) => {
  console.log('Copying LAFItemRegistry.json to client/src/contracts...')

  fs.mkdir('client/src/contracts/', 0744, (err) => {})

  fs.copyFile('build/contracts/LAFItemRegistry.json', 'client/src/contracts/LAFItemRegistry.json', (err) => {
    if (err) throw err;
  })
}