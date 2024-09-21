import dotenv from 'dotenv';
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";

dotenv.config();

export const DEFAULT_SOL_ADDRESS = Keypair.generate().publicKey;
export const connection = new Connection(
  process.env.SOLANA_RPC_URL || 
  clusterApiUrl(process.env.SOLANA_NETWORK as "mainnet-beta" | "testnet" | "devnet" | undefined || "devnet"),
  "confirmed"
);
export const PORT = process.env.PORT || 8080;
export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;