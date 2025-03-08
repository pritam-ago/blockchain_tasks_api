const hre = require("hardhat");

async function main() {
  const TaskContract = await hre.ethers.getContractFactory("TaskContract");
  const taskContract = await TaskContract.deploy();

  await taskContract.waitForDeployment();

  console.log(`✅ Contract deployed to: ${taskContract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
