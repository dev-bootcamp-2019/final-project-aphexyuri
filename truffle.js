require('dotenv').config()

var HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
	// See <http://truffleframework.com/docs/advanced/configuration>
	// to customize your Truffle configuration!

	solc: {
		optimizer: {
		  enabled: true,
		  runs: 200
		}
	},

	networks: {
		development: {
			host: "localhost",
			port: 8545,
			network_id: "*"
		},
		ropsten:  {
			// host: "localhost",
			// port:  8545,
			provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/" + process.env.INFURA_ROPSTEN_ACCESS_TOKEN)
      },
			network_id: 3,
			gas: 5000000
		},
		rinkeby: {
      // host: "localhost",
			// port: 8545,
			provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "https://rinkeby.infura.io/" + process.env.INFURA_ROPSTEN_ACCESS_TOKEN)
      },
      network_id: 4,
			gas: 5000000
		}
	}
};
