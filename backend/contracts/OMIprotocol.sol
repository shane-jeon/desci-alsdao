// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PatientDataStorage {
    struct PatientData {
        uint256 patientId;
        string demographicsHash; // Hash of patient demographics
        string medicalHistoryHash; // Hash of medical history
        string motorFunctionHash; // Hash of motor function data
        string speechSwallowingHash; // Hash of speech/swallowing data
        string respiratorySleepHash; // Hash of respiratory/sleep data
        string cognitiveHealthHash; // Hash of cognitive health data
        uint256 timestamp;
    }

    mapping(uint256 => PatientData) public patientData;
    uint256 public dataCount;

    event DataStored(uint256 indexed patientId, uint256 timestamp);

    // Function to store patient data on-chain
    function storePatientData(
        uint256 _patientId,
        string memory _demographicsHash,
        string memory _medicalHistoryHash,
        string memory _motorFunctionHash,
        string memory _speechSwallowingHash,
        string memory _respiratorySleepHash,
        string memory _cognitiveHealthHash
    ) public {
        patientData[_patientId] = PatientData({
            patientId: _patientId,
            demographicsHash: _demographicsHash,
            medicalHistoryHash: _medicalHistoryHash,
            motorFunctionHash: _motorFunctionHash,
            speechSwallowingHash: _speechSwallowingHash,
            respiratorySleepHash: _respiratorySleepHash,
            cognitiveHealthHash: _cognitiveHealthHash,
            timestamp: block.timestamp
        });

        dataCount++;
        emit DataStored(_patientId, block.timestamp);
    }

    // Function to retrieve patient data
    function getPatientData(uint256 _patientId) public view returns (PatientData memory) {
        return patientData[_patientId];
    }
}