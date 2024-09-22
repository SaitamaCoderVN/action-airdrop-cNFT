import { Keypair, PublicKey, Transaction, Connection } from "@solana/web3.js";
import { fromWeb3JsKeypair, toWeb3JsInstruction, toWeb3JsTransaction } from "@metaplex-foundation/umi-web3js-adapters";
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { keypairIdentity, generateSigner, Umi, percentAmount } from '@metaplex-foundation/umi';
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { MetadataArgsArgs, mintToCollectionV1 } from "@metaplex-foundation/mpl-bubblegum";
import { none } from '@metaplex-foundation/umi';
import bs58 from "bs58";
import { publicKey } from '@metaplex-foundation/umi';
import { createUmiInstance } from "../utils/utils";

export async function createNftBuilder(umi: Umi, toPubkey: PublicKey, merkleTreePublicKey: PublicKey, collectionMintPublicKeys: PublicKey) {
  
  return mintToCollectionV1(umi, {
    leafOwner: publicKey(toPubkey),
    merkleTree: publicKey(merkleTreePublicKey),
    collectionMint: publicKey(collectionMintPublicKeys),
    metadata: {
      name: process.env.DEFAULT_NFT_NAME || '',
      uri: process.env.DEFAULT_NFT_IMAGE || '',
      sellerFeeBasisPoints: 500,
      collection: {
        key: publicKey(collectionMintPublicKeys),
        verified: false,
      },
      creators: [
        {address: publicKey(toPubkey), verified: false, share: 100}
      ],
    } as MetadataArgsArgs,
  });
}

export async function mintNFT(accountPubkey: PublicKey, connection: Connection, merkleTreePublicKey: PublicKey) {
  const keypair = Keypair.fromSecretKey(
    bs58.decode(
      process.env.SOLANA_PRIVATE_KEY || ""
    )
  );
  console.log("keypair", keypair.publicKey);
  const umi = createUmiInstance(keypair);

  const collectionMint = generateSigner(umi);
  console.log("collectionMint", collectionMint);
  await createNft(umi, {
    mint: collectionMint,
    name: process.env.DEFAULT_NFT_NAME || '',
    uri: process.env.DEFAULT_NFT_IMAGE || '',
    sellerFeeBasisPoints: percentAmount(5.5), // 5.5%
    isCollection: true,
  }).sendAndConfirm(umi);

  console.log("accountPubkey", accountPubkey);
  const publicKey = new PublicKey(accountPubkey);
  const merkleTreePublicKeys = new PublicKey(merkleTreePublicKey);
  const collectionMintPublicKeys = new PublicKey(collectionMint.publicKey);
  const builder = await createNftBuilder(umi, publicKey, merkleTreePublicKeys, collectionMintPublicKeys);

  const isx = await builder.getInstructions().map(toWeb3JsInstruction);

  const transaction = new Transaction().add(...isx);

  transaction.feePayer = accountPubkey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return { transaction, keypair };
}