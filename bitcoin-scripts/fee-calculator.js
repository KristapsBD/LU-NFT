/**
 * Fee Calculator
 * 
 * Handles calculation of transaction fees and fetching of current fee rates.
 */

const axios = require('axios');

/**
 * Calculates transaction fee in BTC and EUR
 * 
 * @param {number} vsize - Virtual size of transaction in vBytes
 * @param {number} feeRate - Fee rate in satoshis per vByte
 * @param {number} exchangeRate - Current BTC/EUR exchange rate
 * @returns {Object} Object containing fee in BTC and EUR
 */
function calculateTransactionFee(vsize, feeRate, exchangeRate) {
  // Calculate fee in satoshis
  const feeSats = Math.ceil(vsize * feeRate);
  
  // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
  const feeBTC = feeSats / 100000000;
  
  // Convert BTC to EUR using the current exchange rate
  const feeEUR = feeBTC * exchangeRate;
  
  return {
    feeBTC,
    feeEUR
  };
}

/**
 * Fetches current fee rates from Bitcoin network
 * 
 * @returns {Object} Object containing fee rates for different priorities
 */
async function fetchFeeRates() {
  try {
    // Use mempool.space API to get current fee estimates
    const response = await axios.get('https://mempool.space/api/v1/fees/recommended');
    
    return {
      fastestFee: response.data.fastestFee,
      halfHourFee: response.data.halfHourFee,
      hourFee: response.data.hourFee,
      economyFee: response.data.economyFee,
      minimumFee: response.data.minimumFee
    };
  } catch (error) {
    console.warn('Failed to fetch fee rates from API, using default values:', error.message);
    // Return default values based on requirement (5 sats/vByte)
    return {
      fastestFee: 8,
      halfHourFee: 6,
      hourFee: 5,
      economyFee: 3,
      minimumFee: 1
    };
  }
}

/**
 * Fetches current BTC/EUR exchange rate
 * 
 * @returns {number} Current BTC/EUR exchange rate
 */
async function fetchExchangeRate() {
  try {
    // Use CoinGecko API to get current BTC/EUR exchange rate
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
    return response.data.bitcoin.eur;
  } catch (error) {
    console.warn('Failed to fetch exchange rate from API, using fallback value:', error.message);
    // Return a reasonable fallback value (approximate BTC/EUR rate)
    return 35000;
  }
}

module.exports = {
  calculateTransactionFee,
  fetchFeeRates,
  fetchExchangeRate
};
