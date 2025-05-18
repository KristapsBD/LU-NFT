# Bitcoin Ordinals Minting Simulation

This project simulates Bitcoin ordinals minting transactions on the Bitcoin mainnet and exports fee data along with other transaction details to a CSV file.

## Features

- Simulates multiple Bitcoin ordinals transactions with customizable parameters
- Uses real-time fee rates from the Bitcoin network
- Calculates transaction fees in both BTC and EUR
- Exports detailed transaction data to CSV
- Provides summary statistics

## Requirements

- Node.js (version 14 or higher)
- NPM (Node Package Manager)

## Installation

Install the required dependencies:

```bash
npm install
```

Or simply install the required dependencies in your current project:

```bash
npm install axios bitcoinjs-lib csv-writer
```

## Usage

To run the simulation:

```bash
node index.js
```

The script will:
1. Fetch current fee rates from the Bitcoin network
2. Fetch the current BTC/EUR exchange rate
3. Simulate 50 Bitcoin ordinals minting transactions with 2KB data size
4. Export the results to a CSV file (format: `ordinals-simulation-<timestamp>.csv`)
5. Display summary statistics

## Configuration

You can modify the simulation parameters in the `index.js` file:

```javascript
// Simulation configuration
const NUM_SIMULATIONS = 50;     // Number of transactions to simulate
const DATA_SIZE_BYTES = 2 * 1024; // Data size in bytes (2KB)
```

## Output

The simulation generates a CSV file with the following data for each transaction:
- Transaction ID
- Timestamp
- Data Size (bytes)
- Virtual Size (vBytes)
- Fee Rate (sats/vByte)
- Fee (BTC)
- Fee (EUR)
- Network
- Inscription Type
- Confirmation Status

## Example Output

```
Transaction ID,Timestamp,Data Size (bytes),Virtual Size (vBytes),Fee Rate (sats/vByte),Fee (BTC),Fee (EUR),Network,Inscription Type,Confirmed
62cb5dfce1af4638f5138990e898c1e5d5ba01223b44808c8c65154743dbbf86,2025-05-17T20:02:15.648Z,2048,677,6.27,0.00004243,3.92,mainnet,text/plain,No
c496bdbd21ce246a6e429c097931fd22572be9c573da58b329b52707a4c47c0a,2025-05-17T20:02:15.748Z,2048,677,5.24,0.00003551,3.28,mainnet,text/plain,No
...
```

## Project Structure

| File | Description |
|------|-------------|
| **index.js** | Main entry point that coordinates the overall simulation process |
| **bitcoin-simulator.js** | Handles the simulation loop for Bitcoin transactions |
| **transaction-generator.js** | Creates the transaction data structure for ordinals inscriptions |
| **fee-calculator.js** | Manages fee calculations and fetches current network rates |
| **csv-exporter.js** | Handles data export functionality to CSV format |
| **utils.js** | Provides shared utility functions used across the application |