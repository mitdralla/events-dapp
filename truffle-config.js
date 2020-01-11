var HDWalletProvider = require("truffle-hdwallet-provider");
var config = require("./config.json");

module.exports = {
	networks: {
		development: {
			host: "localhost",
			port: 7545,
			network_id: "*"
		},
		rinkeby: {
			provider: function () {
				return new HDWalletProvider(config.wallet, "https://rinkeby.infura.io/v3/" + config.infura)
			},
			network_id: 4,
			gas: 7000000,
			solc: {
				optimizer: {
					enabled: true,
					runs: 200
				}
			}
		}
	},
	compilers: {
    solc: {
      version: "0.4.24", // A version or constraint - Ex. "^0.5.0"
    }
  }
};
