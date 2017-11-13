var Migrations = artifacts.require("./trial.sol");

module.exports = function(deployer) {
    deployer.deploy(Migrations);
};
