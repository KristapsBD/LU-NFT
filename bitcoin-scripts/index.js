#!/usr/bin/env node

/**
 * Bitcoin Ordinals Minting Simulation
 * 
 * This script simulates Bitcoin ordinals minting transactions on mainnet
 * and exports fee data along with other transaction details to a CSV file.
 */

const { simulateOrdinalsTransactions } = require('./bitcoin-simulator');
const { exportToCSV } = require('./csv-exporter');
const { fetchFeeRates, fetchExchangeRate } = require('./fee-calculator');
const { formatBytes } = require('./utils');

// Simulation configuration
const NUM_SIMULATIONS = 50;
const DATA_SIZE_BYTES = 2 * 1024; // 2KB

async function main() {
  try {
    console.log(`Starting Bitcoin ordinals minting simulation...`);
    console.log(`Simulating ${NUM_SIMULATIONS} transactions with data size of ${formatBytes(DATA_SIZE_BYTES)}`);
    
    // Fetch current fee rates from Bitcoin network
    console.log('Fetching current fee rates...');
    const feeRates = await fetchFeeRates();
    
    // Fetch current BTC/EUR exchange rate
    console.log('Fetching current BTC/EUR exchange rate...');
    const exchangeRate = await fetchExchangeRate();
    console.log(`Current BTC/EUR exchange rate: ${exchangeRate.toFixed(2)} EUR`);
    
    // Simulate the transactions
    console.log('Simulating transactions...');
    const simulationResults = await simulateOrdinalsTransactions(
      NUM_SIMULATIONS, 
      DATA_SIZE_BYTES,
      feeRates,
      exchangeRate
    );
    
    // Export results to CSV
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const filename = `ordinals-simulation-${timestamp}.csv`;
    
    await exportToCSV(simulationResults, filename);
    console.log(`\nSimulation complete! Results exported to ${filename}`);
    
    // Print summary statistics
    const totalFeeBTC = simulationResults.reduce((sum, tx) => sum + tx.feeBTC, 0);
    const totalFeeEUR = simulationResults.reduce((sum, tx) => sum + tx.feeEUR, 0);
    const avgFeeBTC = totalFeeBTC / NUM_SIMULATIONS;
    const avgFeeEUR = totalFeeEUR / NUM_SIMULATIONS;
    
    console.log('\nSummary Statistics:');
    console.log(`Total fees: ${totalFeeBTC.toFixed(8)} BTC (${totalFeeEUR.toFixed(2)} EUR)`);
    console.log(`Average fee per transaction: ${avgFeeBTC.toFixed(8)} BTC (${avgFeeEUR.toFixed(2)} EUR)`);
    
  } catch (error) {
    console.error('Error in simulation:', error.message);
    process.exit(1);
  }
}

main();
