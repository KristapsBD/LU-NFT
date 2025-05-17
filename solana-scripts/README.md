# Solana Program Transaction Exporter

A JavaScript tool to export Solana program transactions using the Helius API.

## Features

- Query transactions from specific Solana programs on mainnet
- Filter transactions by date range
- Export transactions to CSV or JSON formats
- Handle API rate limits automatically
- Support for transaction type filtering
- Complete transaction metadata export

## Requirements

- Node.js 16+
- Helius API key (get one at [helius.xyz](https://helius.xyz))

## Installation

1. Set up your environment variables:

```bash
# Copy the example .env file
cp .env.example .env

# Edit the .env file with your actual Helius API key
nano .env
```

## Usage

```bash
# Run with Node.js
node solana_program_tx_exporter.js --program-id CMZYPASGWeTz7RNGHaRJfCq2XQ5pYK6nDvVQxzkH51zb --api-key YOUR_HELIUS_API_KEY --output transactions.json --format json

# Or directly if you made the script executable
./solana_program_tx_exporter.js --program-id CMZYPASGWeTz7RNGHaRJfCq2XQ5pYK6nDvVQxzkH51zb --api-key YOUR_HELIUS_API_KEY --output transactions.csv
```

### Command-line Options

- `--api-key`: Your Helius API key (required unless set in .env file)
- `--program-id`: Solana program ID to fetch transactions for (required)
- `--output`: Output filename with .csv or .json extension (required)
- `--format`: Output format (csv or json, default: csv)
- `--max-transactions`: Maximum number of transactions to fetch (default: 1000)
- `--start-date`: Start date for filtering transactions (YYYY-MM-DD)
- `--end-date`: End date for filtering transactions (YYYY-MM-DD)
- `--transaction-type`: Filter by transaction type (e.g., TRANSFER, SWAP)
