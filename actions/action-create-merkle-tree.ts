import dotenv from 'dotenv';
import { Request, Response } from "express";
import { PublicKey, Transaction } from "@solana/web3.js";

import { BASE_URL, connection } from '../constant';

import { createMerkleTree } from '../functions/create-merkle-tree';
import { createResponsePayload, createResponsePayloadMerkleTree, handleError, validatedQueryParams } from '../utils/utils';

dotenv.config();

export async function getCreateMerkleTree(req: Request, res: Response): Promise<void> {
    try {
        const { toPubkey } = validatedQueryParams(req.query);
        const baseHref = `${BASE_URL}/api/actions/create-merkle-tree?to=${toPubkey.toBase58()}`;

        res.json({
            title: "Create Merkle Tree",
            icon: process.env.ICON_URL,
            description: "Create a Merkle Tree on Solana",
            links: {
                actions: [
                  { 
                    label: "Create Merkle Tree",
                    href: baseHref,
                  },
                ],
            },
        });
    } catch (err) {
        handleError(res, err, 500);
    }
}

export async function postCreateMerkleTree(req: Request, res: Response): Promise<void> {
    try {
        console.log(req.body);
        const { account } = req.body;
        console.log("account:", account);
        if (!account) throw new Error('Invalid "account" provided');

        const accountPubkey = new PublicKey(account);

        const {merkleTreePublicKey, transaction, keypair} = await createMerkleTree(accountPubkey, connection);
        console.log("Merkle Tree Public Key:", merkleTreePublicKey);

        const payload = await createResponsePayload(transaction as unknown as Transaction, keypair);

        res.json(payload);


    } catch (err) {
        handleError(res, err, 400);
    }
}