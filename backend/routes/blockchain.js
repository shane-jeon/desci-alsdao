const express = require("express");
const router = express.Router();
const blockchainService = require("../services/blockchain");

// Store patient data on blockchain
router.post("/store", async (req, res) => {
  try {
    const { patientId, data } = req.body;
    const result = await blockchainService.storePatientData(patientId, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient data from blockchain
router.get("/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const data = await blockchainService.getPatientData(patientId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update patient data on blockchain
router.put("/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const { data } = req.body;
    const result = await blockchainService.updatePatientData(patientId, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
