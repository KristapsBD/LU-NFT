/**
 * CSV Exporter
 * 
 * Exports simulation results to CSV file.
 */

const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

/**
 * Exports transaction simulation data to a CSV file
 * 
 * @param {Array} transactionData - Array of transaction data objects
 * @param {string} filename - Name of the output CSV file
 * @returns {Promise} Promise that resolves when CSV is written
 */
async function exportToCSV(transactionData, filename) {
  // Define CSV headers
  const csvWriter = createObjectCsvWriter({
    path: filename,
    header: [
      { id: 'transactionId', title: 'Transaction ID' },
      { id: 'timestamp', title: 'Timestamp' },
      { id: 'dataSize', title: 'Data Size (bytes)' },
      { id: 'vsize', title: 'Virtual Size (vBytes)' },
      { id: 'feeRate', title: 'Fee Rate (sats/vByte)' },
      { id: 'feeBTC', title: 'Fee (BTC)' },
      { id: 'feeEUR', title: 'Fee (EUR)' },
      { id: 'network', title: 'Network' },
      { id: 'inscriptionType', title: 'Inscription Type' },
      { id: 'confirmed', title: 'Confirmed' }
    ]
  });
  
  // Format data for CSV
  const formattedData = transactionData.map(tx => ({
    ...tx,
    feeBTC: tx.feeBTC.toFixed(8),
    feeEUR: tx.feeEUR.toFixed(2),
    confirmed: tx.confirmed ? 'Yes' : 'No'
  }));
  
  // Write data to CSV
  await csvWriter.writeRecords(formattedData);
  
  return filename;
}

module.exports = {
  exportToCSV
};
