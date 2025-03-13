const { ethers } = require("ethers");
require("dotenv").config();

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.ETH_PROVIDER_URL);
    // You'll need to add your contract address and ABI to the .env file
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.contractABI =
      require("../artifacts/contracts/OMIprotocol.sol/PatientDataStorage.json").abi;
    this.contract = new ethers.Contract(
      this.contractAddress,
      this.contractABI,
      this.provider,
    );
  }

  async storePatientData(patientId, data) {
    try {
      const tx = await this.contract.storePatientData(
        patientId,
        JSON.stringify(data),
      );
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error("Error storing patient data:", error);
      throw error;
    }
  }

  async getPatientData(patientId) {
    try {
      const data = await this.contract.getPatientData(patientId);
      return JSON.parse(data);
    } catch (error) {
      console.error("Error getting patient data:", error);
      throw error;
    }
  }

  async updatePatientData(patientId, data) {
    try {
      const tx = await this.contract.updatePatientData(
        patientId,
        JSON.stringify(data),
      );
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error("Error updating patient data:", error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();
