/**
 * Transaction Generator
 * 
 * Generates simulated Bitcoin transaction data for ordinals inscriptions.
 */

const crypto = require('crypto');
const bitcoin = require('bitcoinjs-lib');

/**
 * Generates simulated transaction data for an ordinals inscription
 * 
 * @param {number} dataSize - Size of the inscription data in bytes
 * @param {number} feeRate - Fee rate in satoshis per virtual byte
 * @returns {Object} Transaction data object
 */
function generateTransactionData(dataSize, feeRate) {
  // For simulation purposes, we'll create approximate transaction data
  // based on actual ordinals inscription transaction structure
  
  // Generate random txid
  const txid = generateRandomTxid();
  
  // Calculate virtual size of transaction based on data size
  // Bitcoin ordinals transactions have additional overhead beyond the inscription data
  // including input(s), output(s), and additional witness data
  
  // Approximate structure breakdown:
  // - Basic transaction overhead: ~10-12 vBytes
  // - Input (with signature): ~68-70 vBytes per input (we'll use 1 input)
  // - Outputs: ~31-34 vBytes per output (we'll use 2 outputs - change and inscription)
  // - Ordinals protocol overhead: ~15-20 vBytes
  // - Inscription data: dataSize * 0.25 vBytes (witness data is discounted)
  
  const txOverhead = 12;
  const inputSize = 69;
  const outputSize = 33 * 2; // Two outputs
  const ordinalsOverhead = 18;
  const inscriptionVsize = Math.ceil(dataSize * 0.25); // Witness data is discounted in vsize
  
  const vsize = txOverhead + inputSize + outputSize + ordinalsOverhead + inscriptionVsize;
  
  return {
    txid,
    vsize,
    feeRate,
    inscriptionSize: dataSize
  };
}

/**
 * Generates a random Bitcoin transaction ID
 * 
 * @returns {string} Random transaction ID
 */
function generateRandomTxid() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Estimates actual transaction size from creating a partial ordinals transaction
 * Note: This is a more accurate but more complex method using bitcoinjs-lib
 * 
 * @param {number} dataSize - Size of the inscription data in bytes
 * @returns {number} Estimated vsize of the transaction
 */
function estimateTransactionSize(dataSize) {
  try {
    // Use bitcoinjs-lib to create a real transaction structure
    // For simulation, we'll create a transaction with dummy data
    const network = bitcoin.networks.bitcoin;
    const psbt = new bitcoin.Psbt({ network });
    
    // Add a dummy input (representing a UTXO we'd spend)
    psbt.addInput({
      hash: Buffer.from('a'.repeat(64), 'hex'),
      index: 0,
      sequence: 0xffffffff,
      // Dummy witnessUtxo for an input with sufficient funds
      witnessUtxo: {
        script: Buffer.from('0014' + '0'.repeat(40), 'hex'),
        value: 10000000, // 0.1 BTC
      },
    });
    
    // Add dummy inscription output
    psbt.addOutput({
      script: bitcoin.script.compile([
        bitcoin.opcodes.OP_FALSE,
        bitcoin.opcodes.OP_IF,
        Buffer.from('ord', 'utf8'),
        Buffer.from('01', 'hex'), // text/plain
        Buffer.from('0', 'utf8'),
        Buffer.from('a'.repeat(Math.min(520, dataSize)), 'utf8'), // Simulate inscription data
        bitcoin.opcodes.OP_ENDIF,
        bitcoin.opcodes.OP_CHECKSIG
      ]),
      value: 546, // Dust limit
    });
    
    // Add change output
    psbt.addOutput({
      address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', // Example address
      value: 9000000, // 0.09 BTC change
    });
    
    // Calculate vsize
    // This is a rough estimate since we don't have signatures
    const tx = psbt.extractTransaction(false);
    
    // Account for remaining inscription data that couldn't fit in OP_RETURN
    const remainingDataSize = Math.max(0, dataSize - 520);
    const additionalWitnessSize = Math.ceil(remainingDataSize / 520) * 520;
    
    // vsize = (weight units) / 4
    // Weight units = tx size * 3 + witness size
    return Math.ceil((tx.virtualSize() + (additionalWitnessSize / 4)));
  } catch (error) {
    console.warn('Failed to estimate precise transaction size:', error.message);
    // Fall back to approximation formula
    return 140 + Math.ceil(dataSize * 0.25);
  }
}

module.exports = {
  generateTransactionData,
  estimateTransactionSize
};
