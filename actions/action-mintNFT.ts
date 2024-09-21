import dotenv from 'dotenv';
import express, { Request, Response } from "express";
import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import { createResponsePayload, handleError, validatedQueryParams } from '../utils/utils';
import { mintNFT } from '../functions/mint-cNFT';
import { BASE_URL, connection } from '../constant';

dotenv.config();

export async function getMintNFT(req: Request, res: Response): Promise<void> {
    try {
      const { toPubkey } = validatedQueryParams(req.query);
      const baseHref = `${BASE_URL}/api/actions/mint-nft?to=${toPubkey.toBase58()}`;
  
      res.json({
        title: "Actions Example - Transfer Native SOL",
        icon: process.env.ICON_URL,
        description: "Transfer SOL to another Solana wallet",
        links: {
          actions: [
            { 
              label: "Mint NFT",
              href: baseHref,
              parameters: [
                {
                  name: "merkleTreePublicKey",
                  label: "Enter a merkleTreePublicKey",
                }
              ]
            },
          ],

        },
      });
    } catch (err) {
      handleError(res, err);
    }
}
  
export async function postMintNFT(req: Request, res: Response): Promise<void> {
    try {
      const { account, data } = req.body;
      if (!account) throw new Error('Invalid "account" provided');
  
      const accountPubkey = new PublicKey(account);
      console.log(accountPubkey);

      const merkleTreePublicKey = new PublicKey(data.merkleTreePublicKey);
      console.log(merkleTreePublicKey);

      const { transaction, keypair } = await mintNFT(accountPubkey, connection, merkleTreePublicKey);

      const payload = await createResponsePayload(transaction as unknown as Transaction, keypair);
  
      res.json(payload);
    } catch (err) {
      handleError(res, err, 400);
    }
}