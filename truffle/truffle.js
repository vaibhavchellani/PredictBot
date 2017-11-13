// Allows us to use ES6 in our migrations and tests.
require('babel-register')


var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "HwjyD3vCS1EU9YZ0vqvP";
var mnemonic = "couple apart bounce foil october market home rigid arrest filter upon master";

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        ropsten: {
            provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"+infura_apikey),
            network_id: 3
        }
    }
};