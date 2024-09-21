import { Keypair, PublicKey, Transaction, Connection } from "@solana/web3.js";
import { fromWeb3JsKeypair, toWeb3JsInstruction, toWeb3JsTransaction } from "@metaplex-foundation/umi-web3js-adapters";
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { keypairIdentity, generateSigner, Umi } from '@metaplex-foundation/umi';
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import express, { Request, Response } from "express";
import { createPostResponse, actionCorsMiddleware } from "@solana/actions";
import { DEFAULT_SOL_ADDRESS } from "../constant";

export function getActionsJson(req: Request, res: Response): void {
    res.json({
        rules: [
        { pathPattern: "/*", apiPath: "/api/actions/*" },
        { pathPattern: "/api/actions/**", apiPath: "/api/actions/**" },
        ],
    });
}
  
export async function createResponsePayload(transaction: Transaction, keypair: Keypair): Promise<any> {
    return createPostResponse({
      fields: { transaction, message: "Claim Success" },
      signers: [keypair],
    });
}
  
export async function createResponsePayloadMerkleTree(transaction: Transaction, keypair: Keypair, merkleTreePublicKey: PublicKey): Promise<any> {
    return createPostResponse({
      fields: { transaction, message: `Merkle Tree Success` },
      signers: [keypair],
    });
  
  
}
  
export function validatedQueryParams(query: any): { toPubkey: PublicKey } {
    let toPubkey = DEFAULT_SOL_ADDRESS;
    if (query.to) {
      try {
        toPubkey = new PublicKey(query.to);
      } catch (err) {
        throw new Error("Invalid input query parameter: to");
      }
    }
    return { toPubkey };
}
  
export function handleError(res: Response, err: unknown, status: number = 500): void {
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    res.status(status).json({ error: message });
}
  

export function createUmiInstance(keypair: Keypair): Umi {
    return createUmi(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
      .use(mplTokenMetadata())
      .use(keypairIdentity(fromWeb3JsKeypair(keypair)));
}