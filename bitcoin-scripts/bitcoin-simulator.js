/**
 * Bitcoin Ordinals Transaction Simulator
 * 
 * This module handles the simulation of Bitcoin ordinals minting transactions.
 */

const { generateTransactionData } = require('./transaction-generator');
const { calculateTransactionFee } = require('./fee-calculator');
const { sleep } = require('./utils');

/**
 * Simulates multiple Bitcoin ordinals minting transactions
 * 
 * @param {number} numSimulations - Number of transactions to simulate
 * @param {number} dataSize - Size of the inscription data in bytes
 * @param {Object} feeRates - Current fee rates for Bitcoin network
 * @param {number} exchangeRate - Current BTC/EUR exchange rate
 * @returns {Array} Array of simulation results
 */
async function simulateOrdinalsTransactions(numSimulations, dataSize, feeRates, exchangeRate) {
  const simulationResults = [];
  
  for (let i = 0; i < numSimulations; i++) {
    // Generate random variation in fee rate to simulate real network conditions
    // Use 5 sats/vByte as average but allow for some variation (±1.5 sats/vByte)
    const baseFeeRate = 5; // sats/vByte as mentioned in requirements
    const feeRateVariation = (Math.random() * 3) - 1.5; // Random variation between -1.5 and +1.5
    const feeRate = Math.max(1, baseFeeRate + feeRateVariation); // Ensure minimum fee rate of 1 sat/vByte
    
    // Create transaction data
    const transaction = generateTransactionData(dataSize, feeRate);
    
    // Calculate transaction fee in BTC and EUR
    const { feeBTC, feeEUR } = calculateTransactionFee(
      transaction.vsize, 
      transaction.feeRate, 
      exchangeRate
    );
    
    // Add to simulation results
    simulationResults.push({
      transactionId: transaction.txid,
      timestamp: new Date().toISOString(),
      dataSize: dataSize,
      vsize: transaction.vsize,
      feeRate: transaction.feeRate.toFixed(2),
      feeBTC: feeBTC,
      feeEUR: feeEUR,
      network: 'mainnet',
      inscriptionType: 'text/plain', // Example inscription type
      confirmed: false // Simulated transaction, not actually confirmed
    });
    
    // Show progress
    process.stdout.write(`Simulating transaction ${i + 1}/${numSimulations}...\r`);
    
    // Add a small delay to make the simulation feel more realistic
    await sleep(100);
  }
  
  console.log('\nAll transactions simulated successfully.');
  return simulationResults;
}

module.exports = {
  simulateOrdinalsTransactions
};
