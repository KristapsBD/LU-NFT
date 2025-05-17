#!/usr/bin/env node

/**
 * Solana Program Transaction Exporter using Helius API
 *
 * This script allows you to export transaction data for a Solana program
 * using the Helius API. Transactions can be filtered by date range and exported
 * to CSV or JSON format.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const axios = require('axios');
const { Connection, PublicKey } = require('@solana/web3.js');

class HeliusApiClient {
    /**
     * Initialize the Helius API client.
     * @param {string} apiKey - Helius API key
     * @param {string} baseUrl - Base URL for the Helius API
     */
    constructor(apiKey, baseUrl = 'https://api.helius.xyz') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.axiosInstance = axios.create({
            baseURL: baseUrl,
            timeout: 30000,
        });
        this.rateLimitRemaining = 100; // Start with a default value
        this.rateLimitReset = 0;
    }

    /**
     * Handle API rate limiting by waiting if necessary.
     * @private
     */
    async _handleRateLimit() {
        if (this.rateLimitRemaining <= 1) {
            // We're at or near the rate limit, need to wait
            const currentTime = Math.floor(Date.now() / 1000);
            if (this.rateLimitReset > currentTime) {
                const sleepTime = (this.rateLimitReset - currentTime + 1) * 1000;
                console.log(`Rate limit reached. Waiting ${sleepTime / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, sleepTime));
            }
        }
    }

    /**
     * Get transactions for a Solana program address.
     * @param {string} address - Solana program address
     * @param {Object} options - Options for the request
     * @returns {Promise<Array>} List of transaction objects
     */
    async getTransactions(address, options = {}) {
        const {
            before = null,
            until = null,
            limit = 100,
            type = null,
        } = options;

        await this._handleRateLimit();

        const endpoint = `${this.baseUrl}/v0/addresses/${address}/transactions`;

        const params = {
            'api-key': this.apiKey,
            limit: Math.min(limit, 1000), // Ensure limit doesn't exceed API max
        };

        if (before) params.before = before;
        if (until) params.until = until;
        if (type) params.type = type;

        try {
            const response = await this.axiosInstance.get(endpoint, { params });

            // Update rate limit info
            if (response.headers['x-ratelimit-remaining']) {
                this.rateLimitRemaining = parseInt(response.headers['x-ratelimit-remaining'], 10);
            }
            if (response.headers['x-ratelimit-reset']) {
                this.rateLimitReset = parseInt(response.headers['x-ratelimit-reset'], 10);
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching transactions:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    /**
     * Get all transactions for a program address, handling pagination.
     * @param {string} address - Solana program address
     * @param {Object} options - Options for the request
     * @returns {Promise<Array>} List of transaction objects
     */
    async getAllTransactions(address, options = {}) {
        const {
            startDate = null,
            endDate = null,
            maxTransactions = 5000,
            transactionType = null,
        } = options;

        let allTransactions = [];
        let before = null;
        const batchSize = Math.min(1000, maxTransactions);

        console.log(`Fetching transactions for program: ${address}`);

        while (allTransactions.length < maxTransactions) {
            try {
                console.log(`Fetching batch (current count: ${allTransactions.length})`);
                const batch = await this.getTransactions(address, {
                    before,
                    limit: batchSize,
                    type: transactionType
                });

                if (!batch || batch.length === 0) {
                    console.log("No more transactions found.");
                    break;
                }

                // Filter by date if needed
                let filteredBatch = batch;
                if (startDate || endDate) {
                    filteredBatch = batch.filter(tx => {
                        // Convert blockchain timestamp to date object
                        const txDateTime = new Date(tx.timestamp * 1000);

                        if (startDate && txDateTime < startDate) return false;
                        if (endDate && txDateTime > endDate) return false;

                        return true;
                    });
                }

                allTransactions = [...allTransactions, ...filteredBatch];

                // If we got fewer transactions than requested, we've reached the end
                if (batch.length < batchSize) {
                    break;
                }

                // Get the signature of the last transaction for pagination
                if (batch.length > 0) {
                    before = batch[batch.length - 1].signature;
                } else {
                    break;
                }
            } catch (error) {
                console.error(`Error fetching transactions: ${error.message}`);
                // Could implement retry with exponential backoff here
                break;
            }
        }

        return allTransactions.slice(0, maxTransactions);
    }

    /**
     * Get detailed information about a specific transaction.
     * @param {string} signature - Transaction signature
     * @returns {Promise<Object>} Transaction details
     */
    async getTransactionDetails(signature) {
        await this._handleRateLimit();

        const endpoint = `${this.baseUrl}/v0/transactions/${signature}`;
        const params = { 'api-key': this.apiKey };

        const response = await this.axiosInstance.get(endpoint, { params });
        return response.data;
    }
}

/**
 * Parse date string in YYYY-MM-DD format.
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} Parsed date
 */
function parseDate(dateStr) {
    if (!dateStr) return null;

    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) {
        throw new Error(`Invalid date format: ${dateStr}. Use YYYY-MM-DD.`);
    }

    const [, year, month, day] = dateMatch;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
}

/**
 * Extract only relevant transaction data.
 * @param {Array} transactions - Full transaction objects
 * @returns {Array} - Simplified transaction objects
 */
function extractRelevantTransactionData(transactions) {
    if (!transactions || transactions.length === 0) {
        return [];
    }

    return transactions.map(tx => {
        // Format timestamp as ISO string
        const formattedTimestamp = tx.timestamp ? new Date(tx.timestamp * 1000).toISOString() : '';

        // Extract only relevant fields
        return {
            description: tx.description || '',
            type: tx.type || 'UNKNOWN',
            source: tx.source || '',
            fee: tx.fee || 0,
            feePayer: tx.feePayer || '',
            signature: tx.signature || '',
            slot: tx.slot || 0,
            timestamp: tx.timestamp || 0,
            formattedTimestamp: formattedTimestamp
        };
    });
}

/**
 * Export transactions to CSV file.
 * @param {Array} transactions - List of transaction objects
 * @param {string} filename - Output filename
 */
function exportToCsv(transactions, filename) {
    if (!transactions || transactions.length === 0) {
        console.log("No transactions to export.");
        return;
    }

    // Extract only relevant data
    const relevantData = extractRelevantTransactionData(transactions);

    // Define CSV headers
    const headers = [
        "description",
        "type",
        "source",
        "fee",
        "feePayer",
        "signature",
        "slot",
        "timestamp",
        "formattedTimestamp"
    ].join(",");

    // Create CSV rows
    const rows = relevantData.map(tx => {
        return [
            `"${(tx.description || '').replace(/"/g, '""')}"`, // Escape quotes in description
            tx.type || '',
            tx.source || '',
            tx.fee || 0,
            tx.feePayer || '',
            tx.signature || '',
            tx.slot || 0,
            tx.timestamp || 0,
            tx.formattedTimestamp || ''
        ].join(",");
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows].join("\n");

    // Write to file
    fs.writeFileSync(filename, csvContent);
    console.log(`Exported ${relevantData.length} transactions to ${filename}`);

    return relevantData;
}

/**
 * Export transactions to JSON file.
 * @param {Array} transactions - List of transaction objects
 * @param {string} filename - Output filename
 */
function exportToJson(transactions, filename) {
    if (!transactions || transactions.length === 0) {
        console.log("No transactions to export.");
        return;
    }

    // Extract only relevant data
    const relevantData = extractRelevantTransactionData(transactions);

    fs.writeFileSync(filename, JSON.stringify(relevantData, null, 2));
    console.log(`Exported ${relevantData.length} transactions to ${filename}`);

    return relevantData;
}

/**
 * Main function.
 */
async function main() {
    program
        .description('Export Solana program transactions using Helius API')
        .option('--api-key <key>', 'Helius API key (or set HELIUS_API_KEY environment variable)')
        .requiredOption('--program-id <address>', 'Solana program ID to fetch transactions for')
        .requiredOption('--output <filename>', 'Output filename (with .csv or .json extension)')
        .option('--format <format>', 'Output format', /^(csv|json)$/i, 'csv')
        .option('--max-transactions <number>', 'Maximum number of transactions to fetch', (val) => parseInt(val), 1000)
        .option('--start-date <date>', 'Start date for filtering transactions (YYYY-MM-DD)')
        .option('--end-date <date>', 'End date for filtering transactions (YYYY-MM-DD)')
        .option('--transaction-type <type>', 'Filter by transaction type (e.g. TRANSFER, SWAP)');

    program.parse(process.argv);
    const options = program.opts();

    // Get API key from arguments or environment variable
    const apiKey = options.apiKey || process.env.HELIUS_API_KEY;
    if (!apiKey) {
        console.error("Error: No API key provided. Use --api-key or set HELIUS_API_KEY environment variable.");
        process.exit(1);
    }
    console.log("Using Helius API key from environment variable");

    // Parse dates if provided
    let startDate, endDate;
    try {
        startDate = options.startDate ? parseDate(options.startDate) : null;
        endDate = options.endDate ? parseDate(options.endDate) : null;

        // Add one day to end_date to make it inclusive
        if (endDate) {
            endDate.setDate(endDate.getDate() + 1);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }

    // Determine output format from filename if not explicitly set
    let outputFormat = options.format.toLowerCase();
    if (options.output.toLowerCase().endsWith('.json')) {
        outputFormat = 'json';
    } else if (options.output.toLowerCase().endsWith('.csv')) {
        outputFormat = 'csv';
    }

    // Initialize client and fetch transactions
    const client = new HeliusApiClient(apiKey);
    try {
        // Validate that the program ID is a valid Solana public key
        let programId;
        try {
            programId = new PublicKey(options.programId).toString();
        } catch (error) {
            console.error(`Error: Invalid Solana program ID: ${options.programId}`);
            process.exit(1);
        }

        console.log(`Fetching transactions for program: ${programId}`);
        console.log(`Start date: ${startDate ? startDate.toISOString() : 'Not specified'}`);
        console.log(`End date: ${endDate ? endDate.toISOString() : 'Not specified'}`);
        console.log(`Max transactions: ${options.maxTransactions}`);

        const transactions = await client.getAllTransactions(
            programId,
            {
                startDate,
                endDate,
                maxTransactions: options.maxTransactions,
                transactionType: options.transactionType
            }
        );

        console.log(`Found ${transactions.length} transactions.`);

        // Export transactions in both formats
        const jsonFilename = options.output.toLowerCase().endsWith('.json')
            ? options.output
            : options.output.replace(/\.[^/.]+$/, "") + '.json';

        const csvFilename = options.output.toLowerCase().endsWith('.csv')
            ? options.output
            : options.output.replace(/\.[^/.]+$/, "") + '.csv';

        // Always export both formats
        exportToJson(transactions, jsonFilename);
        exportToCsv(transactions, csvFilename);

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main().catch(err => {
        console.error(`Fatal error: ${err.message}`);
        process.exit(1);
    });
}

module.exports = {
    HeliusApiClient,
    parseDate,
    exportToCsv,
    exportToJson
};