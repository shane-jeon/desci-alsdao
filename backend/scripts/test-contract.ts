import { ethers } from "hardhat";

// Contract interface
interface PatientDataStorageContract {
  storePatientData(
    patientId: number,
    demographicsHash: string,
    medicalHistoryHash: string,
    motorFunctionHash: string,
    speechSwallowingHash: string,
    respiratorySleepHash: string,
    cognitiveHealthHash: string,
  ): Promise<any>;

  getPatientData(patientId: number): Promise<{
    patientId: bigint;
    demographicsHash: string;
    medicalHistoryHash: string;
    motorFunctionHash: string;
    speechSwallowingHash: string;
    respiratorySleepHash: string;
    cognitiveHealthHash: string;
    timestamp: bigint;
  }>;
}

async function main() {
  // Get the contract instance
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const PatientDataStorage = await ethers.getContractFactory(
    "PatientDataStorage",
  );
  const contract = PatientDataStorage.attach(
    contractAddress,
  ) as unknown as PatientDataStorageContract;

  // Test data
  const patientId = 12345;
  const testData = {
    demographics: { name: "John Doe", age: 45 },
    medicalHistory: { diagnosis: "ALS", date: "2024-01-01" },
    motorFunction: { score: 85, lastAssessment: "2024-03-01" },
    speechSwallowing: { speechScore: 90, swallowingScore: 85 },
    respiratorySleep: { fvc: 80, sleepQuality: "Good" },
    cognitiveHealth: { memoryScore: 95, attentionScore: 88 },
  };

  console.log("Storing patient data...");

  // Hash the data
  const hashData = (data: Record<string, unknown>) =>
    ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));

  // Store data
  const tx = await contract.storePatientData(
    patientId,
    hashData(testData.demographics),
    hashData(testData.medicalHistory),
    hashData(testData.motorFunction),
    hashData(testData.speechSwallowing),
    hashData(testData.respiratorySleep),
    hashData(testData.cognitiveHealth),
  );

  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  console.log("Data stored successfully!");

  // Retrieve data
  console.log("\nRetrieving patient data...");
  const storedData = await contract.getPatientData(patientId);

  console.log("\nStored Patient Data:");
  console.log("Patient ID:", storedData.patientId.toString());
  console.log("Demographics Hash:", storedData.demographicsHash);
  console.log("Medical History Hash:", storedData.medicalHistoryHash);
  console.log("Motor Function Hash:", storedData.motorFunctionHash);
  console.log("Speech/Swallowing Hash:", storedData.speechSwallowingHash);
  console.log("Respiratory/Sleep Hash:", storedData.respiratorySleepHash);
  console.log("Cognitive Health Hash:", storedData.cognitiveHealthHash);
  console.log(
    "Timestamp:",
    new Date(Number(storedData.timestamp) * 1000).toLocaleString(),
  );

  // Verify hashes match
  console.log("\nVerifying hashes...");
  const originalDemographicsHash = hashData(testData.demographics);
  console.log(
    "Demographics hash matches:",
    originalDemographicsHash === storedData.demographicsHash,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
