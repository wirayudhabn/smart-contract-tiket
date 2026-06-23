<div align="center">

# AM-TICKETS

**Decentralized Concert Ticketing on Ethereum**

[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/wirayudhabn/arctic-monkeys-tickets)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-v0.8.0+-363636?style=flat-square&logo=solidity)](https://docs.soliditylang.org)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-8A2BE2?style=flat-square)](https://docs.ethers.org/v6/)
[![Network](https://img.shields.io/badge/Network-Sepolia_Testnet-F6851B?style=flat-square&logo=ethereum)](https://sepolia.etherscan.io)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-ERC--721-4E5EE4?style=flat-square)](https://docs.openzeppelin.com/contracts/4.x/erc721)

A blockchain-based ticketing dApp built on Ethereum Sepolia Testnet to prevent ticket fraud, scalping, and double-spending through on-chain verification, immutable audit trails, and role-based access control.

[Live Demo](https://am-tickets.vercel.app) · [Smart Contract](https://sepolia.etherscan.io/address/0x6C339FfEcbc9C011bB8d08796FE7Fd146812D9B5) · [Report a Bug](https://github.com/wirayudhabn/arctic-monkeys-tickets/issues) · [Discussions](https://github.com/wirayudhabn/arctic-monkeys-tickets/discussions)

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
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**AM-TICKETS** is a decentralized application (dApp) simulating a concert ticketing system for the *Arctic Monkeys World Tour 2026*. It demonstrates real-world application of data security principles in a Web3 context — treating ticket ownership as a non-fungible on-chain asset managed through Ethereum smart contracts.

Built as a final project (UAS) for **Keamanan Data dan Informasi** at Universitas Primakara, under the supervision of Pak Made Adi.

**Core guarantees:**

- Every ticket is a unique ERC-721 NFT — no duplicates, no counterfeits
- All ownership changes are atomic and permanently logged on-chain
- Validation is gated by on-chain role-based access control, not application logic
- No central database — Ethereum is the single source of truth

---

## Problem Statement

The digital ticketing industry faces systemic security vulnerabilities that centralized systems cannot reliably solve:

| Problem | Real-World Impact | AM-TICKETS Solution |
|---|---|---|
| **Scalping** | Resale prices 3–5× face value | Max 5 tickets per wallet, enforced on-chain |
| **Counterfeit tickets** | Fake tickets indistinguishable from real | Every ticket is a unique NFT on a public ledger |
| **Double-spending** | One ticket redeemed multiple times | Atomic state transfer; used tickets cannot be re-transferred |
| **Centralized failure** | Single database = single attack surface | No central server; data lives across Ethereum's validator network |
| **Unauthorized validation** | Anyone can claim to be a gate staff | RBAC enforced at contract level via `onlyAdmin` modifier |

---

## Features

### 🎟 Ticket Minting

- Fixed price: **0.01 Sepolia ETH** per ticket
- Hard cap: **5 tickets per wallet** (anti-scalping)
- Each ticket minted as a unique ERC-721 NFT
- Balance and allowance validation before transaction submission

### 🔄 Ticket Transfer

- Atomic ownership transfer — previous owner loses access immediately
- Transfer blocked for tickets already marked as used
- Full ownership history available via on-chain event logs

### ✅ Gate Validation (Admin Only)

- `markTicketAsUsed` callable only by addresses with admin role
- Validation UI is blocked (blur + disabled) for non-admin wallets
- Every validation timestamped and logged as an immutable on-chain event

### 🔐 Role Management (Owner Only)

- Contract deployer (owner) assigns admin roles via `setAdminRole`
- Admin roles verifiable publicly via `isAdmin` query
- All role grants emit `AdminRoleGranted` events for auditability

---

## Security Architecture

AM-TICKETS implements five security pillars aligned with industry standards:

### A. Access Control & Authentication

```
MetaMask Wallet Authentication
→ Identity = cryptographic address; no username/password attack surface
→ Private keys never touch the frontend

Role-Based Access Control (RBAC) — enforced on-chain
→ mapping(address => bool) admins
→ onlyAdmin modifier blocks unauthorized calls at the EVM level
→ Frontend UI reinforces this; contract enforces it
```

### B. Data Integrity & Immutability

```
Blockchain as Immutable Ledger
→ Ticket state stored in contract; no mutable off-chain database
→ keccak256 hashing prevents historical data tampering
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
→ Transfer(from, to, tokenId) — every ownership change
→ TicketUsed(tokenId, timestamp) — every validation
→ AdminRoleGranted(account) — every role assignment
→ TicketMinted(buyer, quantity, totalPrice) — every purchase

All events are immutable, cryptographically signed, and publicly verifiable
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Blockchain | Ethereum Sepolia | Testnet | Public ledger & PoS consensus |
| Smart Contract | Solidity | v0.8.0+ | ERC-721 NFT logic & RBAC |
| Web3 Integration | Ethers.js | v6 | Contract interaction & ABI encoding |
| Wallet | MetaMask | Latest | Authentication & transaction signing |
| Frontend | HTML5 + Vanilla JS | ES6+ | UI structure & logic |
| Styling | Tailwind CSS | v3 (CDN) | Responsive utility-first design |
| Hosting | Vercel | — | Serverless frontend deployment |
| Contract IDE | Remix IDE | — | Contract development & deployment |

### System Architecture

```
┌─────────────────────────────────────────────┐
│               USER INTERFACE                │
│     HTML5 · Vanilla JS · Tailwind CSS       │
│                                             │
│  [ Mint ]  [ Transfer ]  [ Validate ]       │
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
│  · Minting logic       · RBAC enforcement  │
│  · Transfer logic      · State management  │
│  · Event emission      · Access modifiers  │
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
| **Standard** | ERC-721 (OpenZeppelin) |
| **Contract Address** | `0x6C339FfEcbc9C011bB8d08796FE7Fd146812D9B5` |
| **Status** | Active & Verified |

🔍 **[View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x6C339FfEcbc9C011bB8d08796FE7Fd146812D9B5)** — source code, transactions, read/write interface

### ABI Reference

```solidity
// ─── MINTING ────────────────────────────────────────────
function mint(uint256 quantity) public payable
// Buy tickets. 0.01 ETH each. Max 5 per wallet.

// ─── OWNERSHIP ──────────────────────────────────────────
function transferTicket(address to, uint256 tokenId) public
// Transfer ownership atomically. Blocks used tickets.

function ownerOf(uint256 tokenId) public view returns (address)
// Query current ticket owner.

function balanceOf(address owner) public view returns (uint256)
// Query how many tickets an address holds.

function totalSupply() public view returns (uint256)
// Total tickets minted.

// ─── VALIDATION (Admin only) ─────────────────────────────
function markTicketAsUsed(uint256 tokenId) public onlyAdmin
// Mark ticket as redeemed at the gate.

function isTicketUsed(uint256 tokenId) public view returns (bool)
// Check if ticket has been validated.

// ─── ACCESS CONTROL (Owner only) ────────────────────────
function setAdminRole(address account) public onlyOwner
// Assign admin/promoter role.

function isAdmin(address account) public view returns (bool)
// Check if address has admin privileges.
```

### Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
// Emitted on every ticket transfer (including mint).

event TicketUsed(uint256 indexed tokenId, uint256 timestamp);
// Emitted when a ticket is validated at the gate.

event AdminRoleGranted(address indexed account);
// Emitted when an admin role is assigned.

event TicketMinted(address indexed buyer, uint256 quantity, uint256 totalPrice);
// Emitted on each successful mint transaction.
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
2. Select the **Penonton (Attendee)** role
3. Click **Mint Tickets**, enter quantity (1–5), and confirm the transaction
4. Transfer a ticket by entering the recipient address and token ID

**As a Promotor/Admin:**

1. Connect a wallet that has been granted admin role via `setAdminRole`
2. Select the **Promotor (Admin)** role — the Validation Dashboard unlocks
3. Enter a token ID and click **Mark as Used** to validate a ticket at the gate

### Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Cannot GET /` | Local server not running | Verify server is running on the correct port |
| MetaMask not detected | Extension disabled or not installed | Enable MetaMask in browser extensions, then refresh |
| `RPC Error` | Wrong network selected | Switch MetaMask to Sepolia Testnet |
| Transaction failed | Insufficient Sepolia ETH | Get test ETH from the [faucet](https://sepolia-faucet.pk910.de/) |
| No contract response | Incorrect contract address in code | Verify address matches `0x6C339FF...` in `app.js` |
| Gas limit exceeded | Gas estimation error | Manually increase gas limit in MetaMask |

---

## Project Structure

```
am-tickets/
├── index.html          # Main application entry point
├── app.js              # Web3 logic — MetaMask, Ethers.js, contract calls
├── abi.json            # Compiled contract ABI
├── style.css           # Custom styles (Tailwind augmentation)
└── README.md
```

> The smart contract source lives at `contracts/AMTickets.sol` in the repository and was deployed via Remix IDE. Verified source is readable on [Etherscan](https://sepolia.etherscan.io/address/0x6C339FfEcbc9C011bB8d08796FE7Fd146812D9B5#code).

---

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Built with 🔐 by [Wirayudha BN](mailto:2401020059@primakara.ac.id)

UAS · Keamanan Data dan Informasi · Universitas Primakara · 2026

</div>