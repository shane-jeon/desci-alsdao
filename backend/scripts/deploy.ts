import { ethers } from "hardhat";

async function main() {
  const PatientDataStorage = await ethers.getContractFactory(
    "PatientDataStorage",
  );
  const patientDataStorage = await PatientDataStorage.deploy();

  await patientDataStorage.waitForDeployment();

  console.log(
    `PatientDataStorage deployed to ${await patientDataStorage.getAddress()}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
