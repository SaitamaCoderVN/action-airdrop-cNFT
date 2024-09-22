import dotenv from 'dotenv';
import express, { Request, Response } from "express";
import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import { createPostResponse, actionCorsMiddleware } from "@solana/actions";
import { getMintNFT, postMintNFT } from './actions/action-mintNFT';

import { getMintNFTCollection, postMintNFTCollection } from './actions/action-mintNFTCollection';
import { getCreateMerkleTree, postCreateMerkleTree } from './actions/action-create-merkle-tree';
import { getActionsJson } from './utils/utils';

dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(actionCorsMiddleware({}));

app.get("/actions.json", getActionsJson);

app.get("/api/actions/create-merkle-tree", getCreateMerkleTree);
app.post("/api/actions/create-merkle-tree", postCreateMerkleTree);

app.get("/api/actions/mint-nft", getMintNFT);
app.post("/api/actions/mint-nft", postMintNFT);

app.get("/api/actions/mint-nft-collection", getMintNFTCollection);
app.post("/api/actions/mint-nft-collection", postMintNFTCollection);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app;

