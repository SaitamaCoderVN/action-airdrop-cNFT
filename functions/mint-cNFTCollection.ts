import { Keypair, PublicKey, Transaction, Connection } from "@solana/web3.js";
import { mintToCollectionV1, MetadataArgsArgs  } from "@metaplex-foundation/mpl-bubblegum";
import bs58 from "bs58";
import { generateSigner, publicKey, Umi } from '@metaplex-foundation/umi';
import { createUmiInstance } from "../utils/utils";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";

export async function mintNFTCollection(accountPubkey: PublicKey, connection: Connection, collectionNFT: PublicKey, accountArrayPubkey: PublicKey[], merkleTreePublicKey: PublicKey) {
    const keypair = Keypair.fromSecretKey(
      bs58.decode(
        process.env.SOLANA_PRIVATE_KEY || ""
      )
    );
    console.log("keypair", keypair.publicKey);
    const umi = createUmiInstance(keypair);
  
    const transaction = new Transaction();
    
    for (const recipientPubkey of accountArrayPubkey) {
      const mint = generateSigner(umi);
      console.log("mint", mint);
  
      console.log("recipientPubkey", recipientPubkey);
      const builder = await createNftCollectionBuilder(umi, recipientPubkey, collectionNFT, merkleTreePublicKey, accountPubkey);
      console.log("builder", builder);
      const isx = await builder.getInstructions().map(toWeb3JsInstruction);
      console.log("isx", isx);
      transaction.add(...isx);
      transaction.feePayer = new PublicKey(accountPubkey);
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      console.log("transaction", transaction);
    }
  
  
    transaction.feePayer = accountPubkey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    console.log("transaction", transaction);
  
    return { transaction, keypair };
}

async function createNftCollectionBuilder(umi: Umi, toPubkey: PublicKey, collectionNFT: PublicKey, merkleTreePublicKey: PublicKey, accountPubkey: PublicKey) {
  return mintToCollectionV1(umi, {
      leafOwner: publicKey(toPubkey),
      merkleTree: publicKey(merkleTreePublicKey),
      collectionMint: publicKey(collectionNFT),
      metadata: {
        name: process.env.DEFAULT_NFT_NAME || '',
        uri: process.env.DEFAULT_NFT_IMAGE || '',
        sellerFeeBasisPoints: 500,
        collection: {
          key: publicKey(collectionNFT),
          verified: false,
        },
        creators: [ 
          {address: publicKey(accountPubkey), verified: false, share: 100}
        ],
      } as MetadataArgsArgs,
    });
}
