import dotenv from 'dotenv';
import express, { Request, Response } from "express";
import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import { createResponsePayload, handleError, validatedQueryParams } from '../utils/utils';
import { BASE_URL, connection } from '../constant';
import { mintNFTCollection } from '../functions/mint-cNFTCollection';

dotenv.config();

export async function getMintNFTCollection(req: Request, res: Response): Promise<void> {
    try {
      const { toPubkey } = validatedQueryParams(req.query);
      const baseHref = `${BASE_URL}/api/actions/mint-nft-collection?to=${toPubkey.toBase58()}`;
  
      res.json({
        title: "Add Collection NFT",
        icon: process.env.ICON_URL,
        description: "Add Collection NFT trên ví Solana của bạn",
        links: {
          actions: [
            { 
              label: "Add Collection NFT", 
              href: baseHref,
              parameters: [
                {
                  name: "merkleTreePublicKey",
                  label: "Enter a merkleTreePublicKey",
                },
                {
                  name: "collectionNFT",
                  label: 'Enter a collectionNFT',
                },
                {
                  name: "accountArray",
                  label: "Enter a accountArray",
                }
              ], 
            },
          ],
        },
      });
    } catch (err) {
      handleError(res, err);
    }
}
  
export async function postMintNFTCollection(req: Request, res: Response): Promise<void> {
    try {
      console.log("Đã vào postMintNFTCollection");
      console.log(req.body);
      const { account, data } = req.body;
      console.log("account:", account);
      const collectionNFT = data.collectionNFT;
      const accountArray = data.accountArray;
      console.log("collectionNFT:", collectionNFT);
      console.log("accountArray:", accountArray);
      if (!account) throw new Error('Invalid "account" provided');
      if (!collectionNFT) throw new Error('Invalid "collectionNFT" provided');
      if (!accountArray) throw new Error('Invalid "accountArray" provided');
  
      const accountPubkey = new PublicKey(account);
      const collectionNFTPubkey = new PublicKey(collectionNFT);
      const merkleTreePublicKey = new PublicKey(data.merkleTreePublicKey);
      console.log("accountPubkey:", accountPubkey);
      console.log("collectionNFTPubkey:", collectionNFTPubkey);
      console.log("merkleTreePublicKey:", merkleTreePublicKey);
  
      const accountArrayPubkey = accountArray
        .split(',')
        .map((account: string) => account.trim())
        .filter((account: string) => account !== '')
        .map((account: string) => new PublicKey(account));
  
      console.log("accountArrayPubkey:", accountArrayPubkey);
  
      const { transaction, keypair } = await mintNFTCollection(accountPubkey, connection, collectionNFTPubkey, accountArrayPubkey, merkleTreePublicKey);

      console.log("transactions:", transaction);
  
      const payload = await createResponsePayload(transaction, keypair);
  
      res.json(payload);
    } catch (err) {
      handleError(res, err, 400);
    }
}