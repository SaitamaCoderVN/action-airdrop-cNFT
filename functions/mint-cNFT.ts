import { Keypair, PublicKey, Transaction, Connection } from "@solana/web3.js";
import { fromWeb3JsKeypair, toWeb3JsInstruction, toWeb3JsTransaction } from "@metaplex-foundation/umi-web3js-adapters";
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { keypairIdentity, generateSigner, Umi } from '@metaplex-foundation/umi';
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mintV1 } from "@metaplex-foundation/mpl-bubblegum";
import { none } from '@metaplex-foundation/umi';
import bs58 from "bs58";
import { publicKey } from '@metaplex-foundation/umi';
import { createUmiInstance } from "../utils/utils";

export async function createNftBuilder(umi: Umi, toPubkey: PublicKey, merkleTreePublicKey: PublicKey) {
  
  return mintV1(umi, {
    leafOwner: publicKey(toPubkey),
    merkleTree: publicKey(merkleTreePublicKey),
    metadata: {
      name: process.env.DEFAULT_NFT_NAME || '',

      uri: process.env.DEFAULT_NFT_IMAGE || '',
      sellerFeeBasisPoints: 500,
      collection: none(),
      creators: [
        { address: publicKey(toPubkey), verified: false, share: 100 },
      ],
    },
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
  const mint = generateSigner(umi);
  console.log("mint", mint);

  console.log("accountPubkey", accountPubkey);
  const builder = await createNftBuilder(umi, accountPubkey, merkleTreePublicKey);

  const isx = await builder.getInstructions().map(toWeb3JsInstruction);

  const transaction = new Transaction().add(...isx);

  transaction.feePayer = accountPubkey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return { transaction, keypair };
}