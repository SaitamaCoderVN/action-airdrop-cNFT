import { generateSigner } from '@metaplex-foundation/umi';
import { createTree, DecompressibleState, findTreeConfigPda, setDecompressibleState } from '@metaplex-foundation/mpl-bubblegum';
import { createUmiInstance } from '../utils/utils';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import bs58 from "bs58";

import { base58 } from '@metaplex-foundation/umi/serializers';
import { toWeb3JsInstruction } from '@metaplex-foundation/umi-web3js-adapters';

export async function createMerkleTree(accountPubkey: PublicKey, connection: Connection) {
    const keypair = Keypair.fromSecretKey(
        bs58.decode(
        process.env.SOLANA_PRIVATE_KEY || ""
        )
    );
    const umi = createUmiInstance(keypair);
    const merkleTree = generateSigner(umi);
    console.log("merkleTree", merkleTree);
    let builder = await createTree(umi, {
        merkleTree,
        maxDepth: 5,
        maxBufferSize: 8,
        canopyDepth: 0,
        public: true,
    });

    builder = builder.append(
        setDecompressibleState(umi, {
          treeConfig:
            findTreeConfigPda(umi, { merkleTree: merkleTree.publicKey }),
          treeCreator: umi.identity,
          decompressableState: DecompressibleState.Enabled,
        })
    );


    const tx = await builder.sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log(
        "transaction: ",
        `https://translator.shyft.to/tx/${signature}?cluster=mainnet-beta`
    );


    const ixs = builder.getInstructions().map(toWeb3JsInstruction);

    const transaction = new Transaction().add(...ixs);

    transaction.feePayer = new PublicKey(accountPubkey);
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    console.log("transaction", transaction.signature);

    return { merkleTreePublicKey: merkleTree.publicKey, transaction: transaction, keypair: keypair };
}