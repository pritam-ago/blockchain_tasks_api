import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import { ethers } from 'ethers';

dotenv.config();  // ✅ Load environment variables first

const contractABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "bool", "name": "_completed", "type": "bool" }
    ],
    "name": "updateTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "getTaskStatus",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC_URL);
export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
export const contract = new ethers.Contract(contractAddress, contractABI, wallet);

const app = express();
console.log("Private Key Length:", process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : "undefined");
connectDB();

app.use(express.json());
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
