import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("diary:address", "Prints deployed OnchainDiary address").setAction(async (_, hre) => {
  const d = await hre.deployments.get("OnchainDiary");
  console.log("OnchainDiary:", d.address);
});

task("diary:write", "Write a diary entry with encrypted delta=1")
  .addParam("hash", "Entry content hash (0x...)")
  .addOptionalParam("address", "Contract address")
  .setAction(async (args: TaskArguments, hre) => {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const dep = args.address ? { address: args.address } : await deployments.get("OnchainDiary");
    const [signer] = await ethers.getSigners();
    const c = await ethers.getContractAt("OnchainDiary", dep.address);

    const enc = await fhevm.createEncryptedInput(dep.address, signer.address).add32(1).encrypt();
    const tx = await c.connect(signer).writeEntry(args.hash, enc.handles[0], enc.inputProof);
    console.log("tx:", tx.hash);
    await tx.wait();
    console.log("entry written");
  });

task("diary:decrypt", "Decrypt user total entries")
  .addOptionalParam("user", "User address")
  .addOptionalParam("address", "Contract address")
  .setAction(async (args: TaskArguments, hre) => {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const dep = args.address ? { address: args.address } : await deployments.get("OnchainDiary");
    const [signer] = await ethers.getSigners();
    const c = await ethers.getContractAt("OnchainDiary", dep.address);

    const user = args.user || signer.address;
    const handle = await c.getEncryptedTotal(user);
    if (handle === ethers.ZeroHash) {
      console.log("total entries clear: 0");
      return;
    }
    const clear = await fhevm.userDecryptEuint(FhevmType.euint32, handle, dep.address, signer);
    console.log("total entries clear:", clear);
  });


