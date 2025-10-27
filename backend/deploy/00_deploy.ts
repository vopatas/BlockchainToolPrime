import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const feeRecipient = deployer;
  const feeBps = 500; // 5%

  await deploy("OnchainDiary", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
};

export default func;
func.tags = ["OnchainDiary"];


