<div align="center">

# AM-TICKETS

**Decentralized Concert Ticketing on Ethereum**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-v0.8.20-363636?style=flat-square&logo=solidity)](https://docs.soliditylang.org)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-8A2BE2?style=flat-square)](https://docs.ethers.org/v6/)
[![Network](https://img.shields.io/badge/Network-Sepolia_Testnet-F6851B?style=flat-square&logo=ethereum)](https://sepolia.etherscan.io)

A blockchain-based ticketing dApp built on Ethereum Sepolia Testnet to prevent ticket fraud, scalping, and double-spending through on-chain verification, immutable audit trails, and role-based access control.

[Smart Contract](https://sepolia.etherscan.io/address/0xc17a578de92486982E33BE15e215E4aa9c8Ab177)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Security Architecture](#security-architecture)
- [Tech Stack](#tech-stack)
- [Smart Contract](#smart-contract)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [License](#license)

---

## Overview

**AM-TICKETS** is a decentralized application (dApp) simulating a concert ticketing system for the *Arctic Monkeys World Tour 2026*. It demonstrates real-world application of data security principles in a Web3 context — treating ticket ownership as a unique, non-fungible on-chain asset managed through a custom Ethereum smart contract.

Built as a final project (UAS) for **Keamanan Data dan Informasi** at Universitas Primakara, under the supervision of Pak Made Adi.

**Core guarantees:**

- Every ticket has a unique ID and is mapped to a single owner — no duplicates, no counterfeits
- All ownership changes are atomic and permanently logged on-chain
- Validation is gated by on-chain role-based access control (RBAC) via the `onlyAdmin` modifier
- No central database — Ethereum is the single source of truth

---

## Problem Statement

The digital ticketing industry faces systemic security vulnerabilities that centralized systems cannot reliably solve:

| Problem | Real-World Impact | AM-TICKETS Solution |
|---|---|---|
| **Scalping & Calo** | Resale prices skyrocket due to bots/scalpers | Max 1 ticket per wallet limit, enforced on-chain |
| **Counterfeit tickets** | Fake tickets indistinguishable from real | Each ticket is uniquely mapped on a public blockchain ledger |
| **Double-spending** | One ticket redeemed multiple times | Atomic state transfer; used tickets cannot be transferred or reused |
| **Centralized failure** | Single database = single attack surface | No central server; data lives across Ethereum's validator network |
| **Unauthorized validation** | Anyone can claim to be a gate staff | RBAC enforced at contract level via `onlyAdmin` modifier |

---

## Features

### 🎟 Ticket Purchasing
- Fixed price: **0.01 Sepolia ETH** per ticket
- Hard cap: **1 ticket per wallet** (anti-scalping / anti-calo)
- Balance and value validation before transaction execution

### 🔄 Ticket Transfer
- Atomic ownership transfer — previous owner loses access automatically
- Transfer blocked if the ticket has already been used or if the recipient already owns a ticket
- Full ownership history available via on-chain event logs

### ✅ Gate Validation (Admin Only)
- Ticket validation callable only by the contract Admin/Promoter
- Validation UI is blocked (blurred overlay) for non-admin wallets
- Every validated ticket is marked as used, preventing replay attacks at the gate
- Successful validations emit events for an immutable audit trail

### 💰 Funds Withdrawal (Admin Only)
- Admin can withdraw all accumulated ticket sale funds from the contract

---

## Security Architecture

AM-TICKETS implements five security pillars aligned with industry standards:

### A. Access Control & Authentication
```
MetaMask Wallet Authentication
→ Identity = cryptographic address; no username/password attack surface
→ Private keys never touch the frontend

Role-Based Access Control (RBAC) — enforced on-chain
→ address public admin; (set to contract deployer in constructor)
→ onlyAdmin modifier blocks unauthorized calls at the EVM level
→ Frontend UI reinforces this by displaying Admin controls only to the owner
```

### B. Data Integrity & Immutability
```
Blockchain as Immutable Ledger
→ Ticket state stored in contract; no mutable off-chain database
→ Cryptographic consensus prevents historical data tampering
→ Ethereum PoS consensus ensures data agreement across nodes

State Verification
→ All state transitions validated by contract before execution
→ Invalid operations revert — no partial writes
```

### C. Confidentiality & Secure Communication
```
MetaMask Key Management
→ Private keys are never exposed to the dApp
→ All interactions are signed messages approved by the user

Sepolia Testnet Isolation
→ Development runs on an isolated testnet
→ Zero financial risk during testing
```

### D. Availability & Resilience
```
Decentralized Infrastructure
→ Thousands of Ethereum validators run the contract independently
→ No single point of failure; no scheduled downtime
→ Smart contract state persists indefinitely
```

### E. Audit Trail & Non-Repudiation
```
On-Chain Event Logs
→ TicketPurchased(ticketId, buyer, pricePaid) — every purchase
→ TicketTransferred(ticketId, from, to) — every ownership change
→ TicketValidated(ticketId, validatedBy) — every gate validation
→ FundsWithdrawn(to, amount) — ticket sales withdrawals

All events are immutable, cryptographically signed, and publicly verifiable
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Blockchain | Ethereum Sepolia | Testnet | Public ledger & PoS consensus |
| Smart Contract | Solidity | v0.8.20 | Custom ticket logic & admin RBAC |
| Web3 Integration | Ethers.js | v6 | Contract interaction & ABI encoding |
| Wallet | MetaMask | Latest | Authentication & transaction signing |
| Frontend | HTML5 + Vanilla JS | ES6+ | UI structure & logic |
| Styling | Tailwind CSS | v3 (CDN) | Responsive utility-first design |

### System Architecture

```
┌─────────────────────────────────────────────┐
│               USER INTERFACE                │
│     HTML5 · Vanilla JS · Tailwind CSS       │
│                                             │
│  [ Buy ]  [ Transfer ]  [ Validate ]        │
│  [ Wallet Connect ]  [ Admin Panel ]        │
└──────────────────┬──────────────────────────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
  Ethers.js   Contract ABI  MetaMask
  · Calls      · JSON        · Signs txn
  · Events     · Types       · RPC endpoint
  · Queries    · Errors      · Key mgmt
       │           │           │
       └───────────┼───────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           SMART CONTRACT LAYER              │
│        Solidity · Sepolia Testnet           │
│                                             │
│  · TicketPurchased     · RBAC enforcement  │
│  · TicketTransferred   · State management  │
│  · TicketValidated     · Access modifiers  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           BLOCKCHAIN LAYER                  │
│        Ethereum Sepolia Testnet             │
│                                             │
│  · Proof-of-Stake consensus                │
│  · Validator network                        │
│  · Immutable state + event ledger           │
└─────────────────────────────────────────────┘
```

---

## Smart Contract

### Deployment Details

| Field | Value |
|---|---|
| **Network** | Ethereum Sepolia Testnet |
| **Contract Name** | `TicketBlock` |
| **Contract Address** | `0xc17a578de92486982E33BE15e215E4aa9c8Ab177` |
| **Status** | Active & Verified |

🔍 **[View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xc17a578de92486982E33BE15e215E4aa9c8Ab177)** — source code, transactions, read/write interface

### Core Solidity Functions

```solidity
// Buy a ticket (0.01 ETH, limit 1 per wallet)
function buyTicket() public payable;

// Transfer ticket ownership to another address
function transferTicket(uint256 _ticketId, address _to) public;

// Validate ticket at the gate (Admin only)
function validateTicket(uint256 _ticketId) public onlyAdmin;

// Withdraw contract balance to admin wallet (Admin only)
function withdraw() public onlyAdmin;
```

### Events

```solidity
event TicketPurchased(uint256 indexed ticketId, address indexed buyer, uint256 pricePaid);
event TicketTransferred(uint256 indexed ticketId, address indexed from, address indexed to);
event TicketValidated(uint256 indexed ticketId, address indexed validatedBy);
event FundsWithdrawn(address indexed to, uint256 amount);
```

---

## Getting Started

### Prerequisites

- A modern browser with the [MetaMask](https://metamask.io) extension installed
- MetaMask connected to **Sepolia Testnet**
- Sepolia ETH test tokens — get free tokens from the [Sepolia Faucet](https://sepolia-faucet.pk910.de/)
- A local web server (Python, Node.js, or VS Code Live Server)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/wirayudhabn/arctic-monkeys-tickets.git
cd arctic-monkeys-tickets
```

**2. Start a local server** — pick whichever works for your setup:
```bash
# Python (recommended)
python -m http.server 8000

# Node.js
npx http-server -p 8000 -c-1
```
Or use the **Live Server** extension in VS Code (right-click `index.html` → *Open with Live Server*).

**3. Open the app**
```
http://localhost:8000
```

**4. Configure MetaMask**
- Switch network to **Sepolia Testnet**
- Ensure your account has Sepolia ETH (check via MetaMask or [Etherscan](https://sepolia.etherscan.io))

---

## Usage

Once the app is running and MetaMask is connected:

**As an Attendee:**
1. Click **Connect Wallet** and approve the MetaMask request
2. Click **BUY TICKET — 0.01 ETH** to purchase 1 ticket (maximum 1 per wallet limit)
3. Transfer your ticket to a friend by entering the receiver's MetaMask wallet address and your Ticket ID, then click **TRANSFER TICKET**

**As a Promotor/Admin:**
1. Connect the wallet address that deployed the contract (`admin` address)
2. The dApp automatically unlocks the **Gatekeeper Verification Dashboard** (disabling the lock overlay)
3. Enter the attendee's Ticket ID and click **VALIDATE TICKET & OPEN GATE** to validate and burn/use the ticket

### Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Cannot GET /` | Local server not running | Verify server is running on the correct port |
| MetaMask not detected | Extension disabled or not installed | Enable MetaMask in browser extensions, then refresh |
| `RPC Error` | Wrong network selected | Switch MetaMask to Sepolia Testnet |
| Transaction failed | Insufficient Sepolia ETH or requirement violation (e.g. already owned a ticket) | Get test ETH from faucet / check transaction rules |
| No contract response | Incorrect contract address in code | Verify address matches `0xc17a578de92486982E33BE15e215E4aa9c8Ab177` in `app.js` |
| Gas limit exceeded | Gas estimation error | Manually increase gas limit in MetaMask |

---

## Project Structure

```
smart-contract-tiket/
├── Contract Solidity/
│   └── TicketBlock.sol # Solidity smart contract code
├── index.html          # Main application UI entry point
├── app.js              # Web3 frontend logic (MetaMask, Ethers.js, contract interactions)
└── README.md           # Documentation
```

---

## License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">

Built with 🔐 by [Wirayudha BN](mailto:2401020059@primakara.ac.id)

UAS · Keamanan Data dan Informasi · Universitas Primakara · 2026

</div>