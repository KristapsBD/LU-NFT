// Bitcoin Ordinals ieraksta izveidošanas skripts
// Šis skripts demonstrē manuālās Ordinals ieraksta veidošanas procesu

// Nepieciešamās bibliotēkas
const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
const fs = require('fs');

// Konfigurācija
const CONFIG = {
    network: bitcoin.networks.testnet,
    feeRate: 10, // satoshi uz bitu
    mempoolApi: 'https://mempool.space/testnet/api'
};

// Funkcija ieraksta komisijas aprēķināšanai
function calculateInscriptionFee(dataSize) {
    // Datu sadalīšana blokos pa 520 baitiem (Bitcoin skripta ierobežojums)
    const chunks = Math.ceil(dataSize / 520);

    // Transakcijas lieluma aprēķins
    const witnessSize = 40 + dataSize + (chunks * 40);
    const baseSize = 280; // bāzes transakcijas izmērs
    const totalSize = baseSize + Math.ceil(witnessSize / 4);

    return totalSize * CONFIG.feeRate;
}

// Ieraksta metadatu izveidošana
function createInscriptionMetadata(imageData, metadata) {
    const chunks = [];

    // Ordinals protokola struktūras iestatīšana
    chunks.push(
        Buffer.from('0063036f7264', 'hex'), // OP_FALSE OP_IF OP_PUSH "ord"
        Buffer.from('01', 'hex'), // OP_PUSH 1
        Buffer.from('696d6167652f706e67', 'hex'), // OP_PUSH "image/png"
        Buffer.from('00', 'hex'), // OP_0
    );

    // Attēlu datu sadalīšana pa blokiem
    let offset = 0;
    while (offset < imageData.length) {
        const chunk = imageData.slice(offset, offset + 520);
        chunks.push(
            Buffer.from(chunk.length.toString(16).padStart(2, '0'), 'hex'),
            chunk
        );
        offset += 520;
    }

    chunks.push(Buffer.from('68', 'hex')); // OP_ENDIF

    // Metadatu JSON pievienošana
    if (metadata) {
        const metadataJson = JSON.stringify(metadata);
        chunks.push(
            Buffer.from('63', 'hex'), // OP_IF
            Buffer.from('036e6674', 'hex'), // "nft"
            Buffer.from(metadataJson.length.toString(16).padStart(2, '0'), 'hex'),
            Buffer.from(metadataJson),
            Buffer.from('68', 'hex') // OP_ENDIF
        );
    }

    return Buffer.concat(chunks);
}

// Ieraksta transakcijas izveidošana
async function createInscription(privateKey, imageBuffer, metadata) {
    const keyPair = bitcoin.ECPair.fromWIF(privateKey, CONFIG.network);
    const { address } = bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: CONFIG.network
    });

    // Metadatu sagatavošana
    const inscriptionData = createInscriptionMetadata(imageBuffer, metadata);

    // Komisijas aprēķins
    const fee = calculateInscriptionFee(inscriptionData.length);

    console.log(`Ieraksta izmērs: ${inscriptionData.length} baiti`);
    console.log(`Komisijas maksa: ${fee} satoshi`);

    // Taproot adrese ieraksta izveidei
    const taprootAddress = createTaprootAddress(keyPair, inscriptionData);

    return {
        inscriptionAddress: taprootAddress,
        commitTx: await createCommitTransaction(keyPair, address, taprootAddress, fee),
        revealTx: createRevealTransaction(keyPair, taprootAddress, inscriptionData, fee)
    };
}

// Taproot adreses izveidošana ierakstam - alternatīva būtu izmantot jau eksistējošu adresi
function createTaprootAddress(keyPair, inscriptionData) {
    const internalKey = keyPair.publicKey.slice(1, 33);

    // Skripts koku izveidošana ar ieraksta datiem
    const inscriptionScript = bitcoin.script.compile([
        internalKey,
        bitcoin.opcodes.OP_CHECKSIG,
        bitcoin.opcodes.OP_FALSE,
        bitcoin.opcodes.OP_IF,
        ...inscriptionData,
        bitcoin.opcodes.OP_ENDIF
    ]);

    // Taproot adrese ar pielabotu publisko atslēgu
    const tweakedKey = bitcoin.address.taproot.getTweakedKey(internalKey, inscriptionScript);
    return bitcoin.address.fromVerify(tweakedKey, CONFIG.network);
}

// Apņemšanās transakcijas izveidošana
async function createCommitTransaction(keyPair, fromAddress, toAddress, amount) {
    const utxos = await getUTXOs(fromAddress);
    const psbt = new bitcoin.Psbt({ network: CONFIG.network });

    // UTXO pievienošana
    let totalInput = 0;
    for (const utxo of utxos) {
        if (totalInput >= amount + 1000) break; // 1000 satoshi priekš transakciju izpildes izmaksām

        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                script: bitcoin.address.toOutputScript(fromAddress, CONFIG.network),
                value: utxo.value
            }
        });
        totalInput += utxo.value;
    }

    // Izvades pievienošana
    psbt.addOutput({
        address: toAddress,
        value: amount
    });

    // Atlikuma atgriešana
    if (totalInput > amount + 500) {
        psbt.addOutput({
            address: fromAddress,
            value: totalInput - amount - 500
        });
    }

    // Transakcijas parakstīšana
    for (let i = 0; i < psbt.inputCount; i++) {
        psbt.signInput(i, keyPair);
    }

    psbt.finalizeAllInputs();
    return psbt.extractTransaction();
}

// Atklāšanas transakcijas izveidošana
function createRevealTransaction(keyPair, inscriptionAddress, inscriptionData, fee) {
    const psbt = new bitcoin.Psbt({ network: CONFIG.network });

    // Apņemšanās transakcijas UTXO
    psbt.addInput({
        hash: commitTx.getId(),
        index: 0,
        witnessUtxo: {
            script: bitcoin.address.toOutputScript(inscriptionAddress, CONFIG.network),
            value: fee
        },
        tapInternalKey: keyPair.publicKey.slice(1, 33),
        tapLeafScript: [{
            leafVersion: 0xc0,
            script: inscriptionData,
            controlBlock: Buffer.alloc(33)
        }]
    });

    // NFT nosūtīšana uz galamērķa adresi
    psbt.addOutput({
        address: keyPair.address,
        value: 546 // Minimālais satoshi daudzums priekš NFT
    });

    // Transkcijas parakstīšana
    psbt.signTaproot(0, keyPair);
    psbt.finalizeInput(0);

    return psbt.extractTransaction();
}

// UTXO iegūšana no API
async function getUTXOs(address) {
    const response = await axios.get(`${CONFIG.mempoolApi}/address/${address}/utxo`);
    return response.data;
}

// Izmantošanas piemērs
async function main() {
    try {
        // Attēla un metadatu sagatavošana
        const imageData = fs.readFileSync('./nft-image.png');
        /// T0DO: Restructure
        const metadata = {
            "name": "LU NFT #1",
            "description": "Šis NFT ir izveidots LU bakalaura darba ietvaros",
            "attributes": [
                {
                    "trait_type": "Protokols",
                    "value": "Bitcoin"
                }
            ]
        };

        // Privātā atslēga (TESTNET)
        const privateKey = "cNJFgo1driFnPcBjt8jjrYbjRuXJe1UmRa8D8CyTR3J7q7HS8fY4";

        // Ieraksta izveidošana
        const inscription = await createInscription(privateKey, imageData, metadata);

        console.log("Ieraksts izveidots:");
        console.log("Ieraksta adrese:", inscription.inscriptionAddress);
        console.log("Apņemšanās TX:", inscription.commitTx.getId());
        console.log("Atklāšanas TX:", inscription.revealTx.getId());

        // Transakciju sūtīšana testnet tīklā
        await broadcastTransaction(inscription.commitTx);
        await broadcastTransaction(inscription.revealTx);

        console.log("Ordinals ieraksts veiksmīgi izveidots!");
    } catch (error) {
        console.error("Kļūda ieraksta izveidē:", error);
    }
}

// Transakcijas sūtīšanas funkcija
async function broadcastTransaction(tx) {
    const txHex = tx.toHex();
    try {
        const response = await axios.post(`${CONFIG.mempoolApi}/tx`, txHex);
        console.log(`Transakcija nosūtīta: ${response.data}`);
    } catch (error) {
        console.error("Kļūda transakcijas sūtīšanā:", error.response?.data || error.message);
    }
}

//  Skripta palaišana
if (require.main === module) {
    main();
}

module.exports = {
    createInscription,
    calculateInscriptionFee,
    createInscriptionMetadata
};