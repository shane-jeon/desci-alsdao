# Caregiving Assistant

A decentralized application for ALS patients to track their symptoms and receive personalized caregiver advice.

## About the Application

Desci ALS DAO is a comprehensive patient monitoring and caregiver support platform designed specifically for ALS (Amyotrophic Lateral Sclerosis) patients and their caregivers. The application combines blockchain technology with traditional healthcare monitoring to provide a secure, transparent, and efficient way to track patient progress and manage care.

### Key Features

#### 1. Patient Assessment & Monitoring

- **Demographics & Medical History**

  - Patient information (name, age, gender)
  - Diagnosis details and disease stage tracking
  - Medical history and comorbidities
  - Current medications and dosages
  - Family history tracking
  - Caregiver information management

- **Motor & Physical Function**

  - Gait and balance metrics
  - Muscle weakness monitoring
  - Assistive device usage tracking
  - Integration with wearable devices
  - Motion sensor data collection

- **Speech & Swallowing**

  - Speech clarity assessment
  - Swallowing difficulty tracking
  - Facial muscle control monitoring
  - Audio analysis capabilities

- **Respiratory & Sleep Health**

  - Breathing pattern monitoring
  - Sleep quality tracking
  - Integration with pulse oximeters
  - Sleep tracker data collection

- **Cognitive Health**
  - Memory and cognitive function tracking
  - Hallucination/psychosis episode monitoring
  - Regular assessment scheduling

#### 2. Caregiver Support System

- **Medication Management**

  - Daily medication reminders
  - Side effects tracking
  - Missed dose alerts
  - Smart pill dispenser integration

- **Emergency Response**

  - Real-time fall detection
  - Breathing emergency alerts
  - Cognitive confusion monitoring
  - Panic button functionality

- **Caregiver Resources**
  - AI-generated care plans
  - Daily task reminders
  - Educational materials
  - Emergency protocols
  - Integration with established caregiver resources

#### 3. Blockchain Integration

- Secure storage of patient data
- Transparent tracking of care metrics
- Decentralized access control
- Smart contract-based data sharing

#### 4. AI-Powered Features

- Sentiment analysis for caregiver support
- Predictive care recommendations
- Automated emergency detection
- Personalized care plan generation

### Technology Stack

- **Frontend**: Next.js with TypeScript
- **Backend**: Express.js and Flask
- **Database**: MongoDB
- **Authentication**: Clerk
- **Blockchain**: Ethereum (Sepolia) and Polygon (Mumbai)
- **Smart Contracts**: Solidity with Hardhat

## Project Structure

```
desci-ALSDAO/
├── frontend/          # Next.js frontend application
├── backend/          # Express.js backend server
└── contracts/        # Smart contracts for blockchain integration
```

## Prerequisites

- Node.js (v18 or higher)
- Python 3.9 or higher
- MongoDB Atlas account
- Clerk account for authentication
- MetaMask or similar Web3 wallet

## Setup Instructions

### 1. Environment Setup

#### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_DOMAIN=your_clerk_domain

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Blockchain Configuration
NEXT_PUBLIC_RPC_URL=your_ethereum_rpc_url
NEXT_PUBLIC_TOKEN_ADDRESS=your_token_contract_address
NEXT_PUBLIC_DAO_ADDRESS=your_dao_contract_address
```

#### Web3 Setup

1. Install required dependencies:

   ```bash
   cd frontend
   npm install web3 @web3-react/core @web3-react/injected-connector
   ```

2. Create the Web3 configuration:

   - Create `src/lib/web3.ts` file
   - Add your contract ABIs
   - Configure Web3 provider and contract instances

3. Update contract addresses:

   - After deploying your contracts, update the addresses in `.env.local`
   - Make sure to use the correct network (testnet/mainnet) addresses

4. Test Web3 connection:

   ```typescript
   // Example test in any component
   import { neuroToken, neuroGrantDAO } from "../lib/web3";

   // Test token contract
   const totalSupply = await neuroToken.methods.totalSupply().call();
   console.log("Total supply:", totalSupply);

   // Test DAO contract
   const proposals = await neuroGrantDAO.methods.getProposals().call();
   console.log("Proposals:", proposals);
   ```

Note: Make sure your MetaMask is connected to the correct network (Sepolia/Mumbai for testing) and has the necessary permissions enabled.

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Server
PORT=3001

# Blockchain
ETH_PROVIDER_URL=your_ethereum_rpc_url
CONTRACT_ADDRESS=your_contract_address
```

### 2. MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is sufficient for development)
3. Set up database access:
   - Create a database user with read/write permissions
   - Add your IP address to the IP whitelist
4. Get your connection string from MongoDB Atlas
5. Replace `your_mongodb_connection_string` in both frontend and backend `.env` files

#### Connecting MongoDB with VS Code

1. Install the "MongoDB for VS Code" extension
2. Click the MongoDB icon in the sidebar
3. Click "Connect" and paste your connection string
4. You can now browse your database, collections, and documents directly in VS Code

### 3. Clerk Authentication Setup

1. Create a Clerk account at https://clerk.dev
2. Create a new application:

   - Click "Add Application"
   - Name it "ALS DAO"
   - Select "Next.js" as the framework
   - Choose "Development" environment

3. Configure your application:

   - Go to "JWT Templates" and enable JWT support
   - Navigate to "Web3" settings:
     - Enable Web3 authentication
     - Add MetaMask as an allowed provider
     - Configure the following settings:
       - Enable "Sign in with Ethereum"
       - Set "Chain ID" to 1 (Ethereum mainnet)
       - Add testnet chain IDs (11155111 for Sepolia, 80001 for Mumbai)
       - Enable "Require signature for authentication"

4. Set up authentication pages:

   - Go to "Pages" section
   - Configure sign-in and sign-up pages:
     - Set sign-in URL: `/sign-in`
     - Set sign-up URL: `/sign-up`
     - Set after sign-in URL: `/`
     - Set after sign-up URL: `/`

5. Configure allowed origins:

   - Go to "CORS" settings
   - Add the following origins:
     ```
     http://localhost:3000
     http://localhost:3001
     http://localhost:5000
     ```

6. Get your API keys:

   - Navigate to "API Keys" section
   - Copy the following keys:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY` (keep this secure, only needed in backend)
   - Update your frontend `.env.local` file with these keys

7. Update frontend environment variables:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   NEXT_PUBLIC_CLERK_DOMAIN=your-app.clerk.accounts.dev
   ```

8. Test the authentication:
   - Start your frontend application
   - Visit http://localhost:3000
   - Try signing in with MetaMask
   - Verify that Web3 authentication works correctly

Note: Make sure to keep your Clerk secret key secure and never commit it to version control. The publishable key is safe to use in the frontend, but the secret key should only be used in the backend.

### 4. Installation

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

#### Backend Setup

```bash
cd backend
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

### 5. Smart Contract Setup and Deployment

#### Prerequisites

- Node.js (v18 or higher)
- MetaMask or similar Web3 wallet
- Some test ETH (for testnet deployment)

#### Hardhat Setup

1. Navigate to the contracts directory:

   ```bash
   cd contracts
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `contracts` directory:

   ```env
   # Your wallet private key (without 0x prefix)
   PRIVATE_KEY=your_private_key_here

   # Network RPC URLs
   SEPOLIA_RPC_URL=your_sepolia_rpc_url
   MUMBAI_RPC_URL=your_mumbai_rpc_url

   # Etherscan API Key (for contract verification)
   ETHERSCAN_API_KEY=your_etherscan_api_key
   POLYGONSCAN_API_KEY=your_polygonscan_api_key
   ```

4. Get test ETH:
   - Sepolia: Use a faucet like https://sepoliafaucet.com/
   - Mumbai: Use a faucet like https://faucet.polygon.technology/

#### Contract Deployment

1. Compile contracts:

   ```bash
   npx hardhat compile
   ```

2. Deploy to testnet:

   ```bash
   # Deploy to Sepolia
   npx hardhat run scripts/deploy.js --network sepolia

   # Deploy to Mumbai
   npx hardhat run scripts/deploy.js --network mumbai
   ```

3. Verify contracts:

   ```bash
   # Verify on Sepolia
   npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS

   # Verify on Mumbai
   npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
   ```

4. Update contract addresses:
   - After deployment, copy the deployed contract address
   - Update the following files with the new address:
     - Frontend: `.env.local`:
       ```env
       NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
       ```
     - Backend: `.env`:
       ```env
       CONTRACT_ADDRESS=your_deployed_contract_address
       ```

#### Testing Contracts

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/YourTest.js

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test
```

#### Contract Interaction

1. Using Hardhat console:

   ```bash
   npx hardhat console --network sepolia
   ```

2. Example interaction:
   ```javascript
   const contract = await ethers.getContractAt(
     "YourContract",
     "CONTRACT_ADDRESS",
   );
   await contract.yourFunction();
   ```

#### Security Considerations

1. Never commit your `.env` file containing private keys
2. Use different wallets for development and production
3. Keep your private keys secure and never share them
4. Consider using a hardware wallet for production deployments

## Current Issues and Blockers

### Form Submission Issues

1. Assessment form not submitting to database
   - Frontend makes request to `/api/assessment`
   - Request is forwarded to Express server (port 3001)
   - Express server proxies to Flask server (port 5000)
   - Current status: Request fails during forwarding

#### Debugging Steps

1. Check browser console for CORS errors
2. Verify all servers are running:
   - Frontend: http://localhost:3000
   - Express: http://localhost:3001
   - Flask: http://localhost:5000
3. Check MongoDB connection:
   - Verify connection string is correct
   - Ensure IP is whitelisted
   - Test connection in VS Code MongoDB extension

### Database Connection Issues

1. MongoDB connection not established
   - Check connection string format
   - Verify network access
   - Test connection using MongoDB Compass or VS Code extension

## Development Workflow

1. Start all servers:

   ```bash
   # Terminal 1 - Frontend
   cd frontend
   npm run dev

   # Terminal 2 - Backend
   cd backend
   source venv/bin/activate
   python app.py
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Flask API: http://localhost:5000

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Troubleshooting

### Common Issues

1. CORS Errors

   - Check CORS configuration in backend servers
   - Verify allowed origins in Clerk settings
   - Ensure all environment variables are set correctly

2. Database Connection

   - Verify MongoDB connection string
   - Check IP whitelist in MongoDB Atlas
   - Test connection using MongoDB Compass

3. Authentication Issues
   - Verify Clerk API keys
   - Check allowed origins in Clerk dashboard
   - Ensure proper redirect URLs are configured

## Support

For support, please open an issue in the GitHub repository or contact the development team.
