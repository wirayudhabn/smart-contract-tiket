# AM-TICKETS: ON-CHAIN AUDIT SYSTEM

## 🎫 Sistem Penjualan Tiket Berbasis Blockchain dengan Validasi Keamanan Terdistribusi

<div align="center">

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Repository Size](https://img.shields.io/badge/repo%20size-minimal-inactive?style=flat-square)
![Solidity](https://img.shields.io/badge/solidity-v0.8.0+-red?style=flat-square)
![Web3](https://img.shields.io/badge/web3-ethers.js_v6-purple?style=flat-square)
![Network](https://img.shields.io/badge/network-sepolia_testnet-orange?style=flat-square)

**Solusi blockchain untuk mencegah pemalsuan tiket dan calo digital melalui mekanisme on-chain verification yang transparan, terdesentralisasi, dan immutable.**

[📖 Dokumentasi](#-dokumentasi) • [🏗️ Arsitektur](#-arsitektur--teknologi) • [📦 Smart Contract](#-informasi-smart-contract) • [🚀 Mulai](#-panduan-instalasi-lokal)

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Masalah & Solusi](#-masalah--solusi)
- [Fitur Utama](#-fitur-utama)
- [Fitur Keamanan Data](#-fitur-keamanan-data)
- [Arsitektur & Teknologi](#-arsitektur--teknologi)
- [Informasi Smart Contract](#-informasi-smart-contract)
- [Panduan Instalasi Lokal](#-panduan-instalasi-lokal)
- [Dokumentasi](#-dokumentasi)

---

## 🎯 Tentang Proyek

**AM-TICKETS** adalah aplikasi desentralisasi (dApp) yang mensimulasikan sistem penjualan tiket konser **Arctic Monkeys World Tour 2026** berbasis teknologi blockchain Ethereum. Proyek ini dibangun sebagai **Tugas Akhir (UAS)** untuk mata kuliah **Keamanan Data dan Informasi** di bawah bimbingan **Pak Made Adi**.

Aplikasi ini mendemonstrasikan implementasi praktis konsep-konsep keamanan data modern dalam konteks Web3, termasuk:

- ✅ Smart Contract Security & State Management
- ✅ Role-Based Access Control (RBAC)
- ✅ Double-Spending Prevention
- ✅ Immutable Audit Trail
- ✅ Cryptographic Verification

---

## 🚨 Masalah & Solusi

Industri tiket digital menghadapi berbagai tantangan keamanan yang dapat diselesaikan melalui blockchain:

| Masalah                       | Dampak                                | Solusi AM-TICKETS                                                        |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| 🎟️ **Calo & Scalping**        | Harga tiket melonjak 3-5x lipat       | Pembatasan ketat: max 5 tiket/wallet, tracked on-chain                   |
| 🔄 **Pemalsuan Tiket**        | Tiket ganda/palsu beredar             | Blockchain sebagai single source of truth; setiap token unik & terdaftar |
| 👻 **Double-Spending**        | Satu tiket digunakan berkali-kali     | Atomic state transfer; pemilik lama otomatis kehilangan akses            |
| 🔐 **Sistem Terpusat Rentan** | Database mudah dimanipulasi           | Desentralisasi penuh; tidak ada single point of failure                  |
| 👤 **Validasi Tanpa Batas**   | Siapa saja bisa mengklaim tiket valid | RBAC ketat: hanya admin yang authorized untuk validasi                   |

---

## ⭐ Fitur Utama

### 1️⃣ **Akuisisi Tiket (Minting)**

Pembelian tiket on-chain dengan mekanisme keamanan berlapis:

- 💰 Harga tetap: **0.01 Sepolia ETH** per tiket
- 🔒 Pembatasan per wallet: **maximum 5 tiket** (anti-scalping)
- ✓ Validasi saldo & allowance sebelum transaksi
- 📜 Setiap minting tercatat di blockchain sebagai NFT unik

### 2️⃣ **Sirkulasi Tiket (Transfer Ownership)**

Transfer hak milik dengan jaminan keamanan double-spending prevention:

- 🔐 Atomic transfer: pemilik lama otomatis kehilangan akses
- ⛓️ Transfer ownership tracked di on-chain events
- 🚫 Prevent tiket "used" untuk ditransfer kembali
- 📊 Historical tracking: siapa pemilik di waktu kapan?

### 3️⃣ **Konsumsi Tiket (Gatekeeper Validation)**

Validasi tiket dengan implementasi Role-Based Access Control (RBAC):

- 🔑 Hanya **admin/promotor authorized** dapat mark tiket sebagai "used"
- 🔐 UI/UX diblokir (blur & gembok) untuk penonton biasa
- ✅ Validasi real-time sebelum checkpoint masuk
- 📝 Audit trail: timestamp & admin identity tercatat di blockchain

---

## 🔐 Fitur Keamanan Data

Proyek ini mengimplementasikan **5 pilar utama keamanan data** sesuai standar industri:

### A. **Access Control & Authentication**

```
✓ Metamask Wallet Authentication
  → Digital signature verification (tidak ada private key di frontend)
  → Setiap address adalah unique identifier & cryptographic proof

✓ Role-Based Access Control (RBAC) di Smart Contract
  → Mapping: address → role (Admin/Attendee)
  → Modifier "onlyAdmin" enforce di contract level
  → Frontend UI mencegah akses untuk role yang tidak berwenang
```

### B. **Data Integrity & Immutability**

```
✓ Blockchain Ledger (Single Source of Truth)
  → Tiket = NFT dengan metadata immutable (ERC-721 standard)
  → Hash kriptografi (keccak256) prevent modifikasi data historis
  → Consensus mechanism Ethereum menjamin data agreement

✓ State Verification
  → Smart contract verify state sebelum state transition
  → Invalid operations diblokir di contract level (revert)
```

### C. **Confidentiality & Secure Communication**

```
✓ Encrypted Wallet Connection
  → Metamask handle key management (private key never exposed)
  → Semua komunikasi via signed messages

✓ Sepolia Testnet Isolation
  → Testing environment terpisah dari mainnet
  → Sandbox protection: risk mitigation untuk production
```

### D. **Availability & Resilience**

```
✓ Decentralized Infrastructure
  → Ribuan validator di Ethereum Sepolia
  → Smart contract berjalan pada setiap node secara independent
  → Tidak ada downtime, tidak ada single point of failure
```

### E. **Audit & Non-Repudiation**

```
✓ On-Chain Audit Trail
  → Event logs: Transfer(from, to, tokenId), TicketUsed(tokenId)
  → Semua transaksi immutable & cryptographically signed
  → Deny-ability prevention: proof ada di blockchain selamanya
```

---

## 🏗️ Arsitektur & Teknologi

### Diagram Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│         (HTML5 + Vanilla JS + Tailwind CSS)                  │
├──────────────────────────────────────────────────────────────┤
│  Minting UI  │  Transfer UI  │  Validation Dashboard         │
│  Wallet Conn │  History      │  Admin Panel                  │
└────────────────────┬─────────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
 [Ethers.js v6]  [Contract ABI]  [Metamask Plugin]
 • Contract Call  • JSON Format    • Sign Transaction
 • Event Listener • Type Safe      • Key Management
 • State Query    • Error Handling • RPC Endpoint
    │                │                │
    └────────────────┼────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │   SMART CONTRACT LAYER          │
    │  (Solidity - Sepolia Testnet)   │
    ├────────────────────────────────┤
    │ ✓ Minting Logic                │
    │ ✓ Transfer Logic               │
    │ ✓ RBAC Enforcement             │
    │ ✓ State Management             │
    │ ✓ Event Emission               │
    └────────────────────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │  BLOCKCHAIN LAYER              │
    │  (Ethereum Sepolia Testnet)    │
    ├────────────────────────────────┤
    │ • Consensus (Proof-of-Stake)   │
    │ • Validator Network            │
    │ • Immutable Ledger             │
    │ • State Root Hashing           │
    └────────────────────────────────┘
```

### Tech Stack Detail

| Layer                   | Teknologi          | Versi    | Fungsi                               |
| ----------------------- | ------------------ | -------- | ------------------------------------ |
| **Blockchain**          | Ethereum Sepolia   | Testnet  | Public ledger & consensus            |
| **Smart Contract**      | Solidity           | v0.8.0+  | ERC-721 NFT logic & RBAC             |
| **Frontend**            | HTML5              | Latest   | Semantic markup & structure          |
| **Frontend**            | Vanilla JavaScript | ES6+     | DOM manipulation & logic             |
| **Styling**             | Tailwind CSS       | v3 (CDN) | Responsive & utility-first design    |
| **Web3 Integration**    | Ethers.js          | v6       | Contract interaction & ABI encoding  |
| **Wallet**              | Metamask           | Latest   | Authentication & transaction signing |
| **Frontend Deployment** | Vercel             | -        | Serverless hosting & auto-deploy     |
| **Contract Deployment** | Remix IDE          | -        | Development & deployment environment |

---

## 📦 Informasi Smart Contract

### Detail Deployment

```
┌─────────────────────────────────────────────────────┐
│           SMART CONTRACT DEPLOYMENT INFO            │
├─────────────────────────────────────────────────────┤
│ Network:       Ethereum Sepolia Testnet             │
│ Contract Type: ERC-721 (Non-Fungible Token/NFT)     │
│ Status:        Active & Verified                    │
│ Standard:      OpenZeppelin Interface               │
└─────────────────────────────────────────────────────┘

Contract Address:
  0x6C339FfEcbc9C011bB8d08796FE7Fd146812D9B5
```

### Verifikasi & Interaksi di Blockchain Explorer

Untuk melihat kode, transaksi, dan state contract:

🔍 **Sepolia Etherscan**: [Lihat di Block Explorer](https://sepolia.etherscan.io/address/0x6C339FfEcbc9C011bB8d08796FE7Fd146812D9B5)

Fitur yang tersedia di Etherscan:

- 📊 Daftar semua transaksi (Transfer, Minting events)
- 📝 Source code verification (transparent & auditable)
- 💬 Read/Write Contract untuk direct interaction
- 📈 Analytics: total tiket terjual, unique holders, dll

### Core Functions

```solidity
// MINTING & OWNERSHIP
function mint(uint256 quantity) public payable
  → Beli tiket (0.01 ETH each, max 5/wallet)

function transferTicket(address to, uint256 tokenId) public
  → Transfer ownership (atomic, prevents double-spending)

function ownerOf(uint256 tokenId) public view returns (address)
  → Query pemilik tiket saat ini

// VALIDATION & RBAC
function markTicketAsUsed(uint256 tokenId) public onlyAdmin
  → Mark tiket sebagai "used" (Admin only)

function isTicketUsed(uint256 tokenId) public view returns (bool)
  → Query apakah tiket sudah divalidasi

// ADMIN FUNCTIONS
function setAdminRole(address account) public onlyOwner
  → Assign admin/promotor role (Owner only)

function isAdmin(address account) public view returns (bool)
  → Check apakah address memiliki admin role

// QUERY FUNCTIONS
function balanceOf(address owner) public view returns (uint256)
  → Jumlah tiket yang dimiliki address

function totalSupply() public view returns (uint256)
  → Total tiket yang pernah dimint
```

### Event Log (Audit Trail)

Semua events terekam immutable di blockchain:

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
  → Tercatat setiap transfer tiket

event TicketUsed(uint256 indexed tokenId, uint256 timestamp)
  → Tercatat setiap validasi tiket + timestamp

event AdminRoleGranted(address indexed account)
  → Tercatat setiap admin assignment

event TicketMinted(address indexed buyer, uint256 quantity, uint256 totalPrice)
  → Tercatat setiap minting transaction
```

---

## 🚀 Panduan Instalasi Lokal

### Prasyarat

Sebelum memulai, pastikan Anda memiliki:

- ✅ **Browser modern** dengan Metamask extension (Chrome, Firefox, Brave, Edge)
- ✅ **Metamask** terinstall & terhubung ke Sepolia Testnet
- ✅ **Sepolia ETH test token** (dapatkan gratis dari [Faucet](https://sepolia-faucet.pk910.de/))
- ✅ **Live Server** (pilih salah satu):
  - Python 3.x built-in module
  - Node.js dengan `http-server`
  - VS Code Live Server extension

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/am-tickets.git
cd am-tickets
```

### Step 2: Jalankan Local Web Server

Pilih **satu metode** yang paling sesuai dengan setup Anda:

#### **Metode A: Python (Recommended)**

```bash
# Untuk Python 3.x
python -m http.server 8000

# Atau untuk Python 2.x (legacy)
python -m SimpleHTTPServer 8000
```

**Output:**

```
Serving HTTP on 0.0.0.0 port 8000 (http://localhost:8000/) ...
```

#### **Metode B: Node.js (http-server)**

```bash
# Install global jika belum
npm install -g http-server

# Jalankan di project root
http-server -p 8000 -c-1
```

**Output:**

```
Starting up http-server, serving .
Available on:
  http://localhost:8000
```

#### **Metode C: VS Code Live Server Extension**

```
1. Install extension "Live Server" (Five Server)
2. Klik kanan file index.html
3. Pilih "Open with Live Server"
4. Browser otomatis buka http://localhost:5500
```

### Step 3: Konfigurasi Metamask

1. 🦊 Buka extension Metamask di browser
2. 🔗 Pastikan **Network: Sepolia Testnet** dipilih
3. ⛽ Verifikasi akun Anda memiliki **Sepolia ETH** test token
   - Jika tidak ada, dapatkan dari [Sepolia Faucet](https://sepolia-faucet.pk910.de/)
4. 🔄 Refresh halaman aplikasi

### Step 4: Akses Aplikasi

Buka browser dan navigasi ke:

```
http://localhost:8000
```

atau sesuai port yang ditampilkan di terminal.

### Step 5: Mulai Menggunakan

```
✓ Klik tombol "Connect Wallet"
✓ Pilih akun Metamask yang ingin gunakan
✓ Approve connection request
✓ Pilih role: Penonton (Attendee) atau Promotor (Admin)
✓ Beli tiket, transfer, atau validasi sesuai fitur
```

---

### Troubleshooting

| Masalah                           | Penyebab                      | Solusi                                           |
| --------------------------------- | ----------------------------- | ------------------------------------------------ |
| ❌ **"Cannot GET /"**             | Live server tidak berjalan    | Pastikan port tepat & running di project root    |
| ❌ **Metamask tidak terdeteksi**  | Extension tidak enabled       | Refresh browser, enable extension di toolbar     |
| ❌ **"RPC Error"**                | Metamask tidak ke Sepolia     | Ganti network ke Sepolia Testnet di Metamask     |
| ❌ **Transaksi failed**           | Saldo Sepolia ETH tidak cukup | Dapatkan test ETH dari faucet                    |
| ❌ **Smart contract no response** | Contract address salah        | Verifikasi address di kode, check Etherscan      |
| ⚠️ **Gas limit exceeded**         | Gas estimation terlalu tinggi | Increase gas limit di Metamask atau cek contract |

---

## 📖 Dokumentasi

### Konsep Keamanan Implementasi

**1. Anti-Scalping Mechanism:**

```javascript
// Smart Contract enforces:
require(balanceOf(msg.sender) + quantity <= MAX_TICKETS_PER_WALLET);
// Calo harus buat multiple wallets (biaya gas tinggi = tidak profitable)
```

**2. Double-Spending Prevention:**

```javascript
// Atomic state transfer:
function transferTicket(address to, uint256 tokenId) {
    require(msg.sender == ownerOf(tokenId));
    require(!isTicketUsed[tokenId]);
    // Transfer ownership (pemilik lama kehilangan akses)
    _transfer(msg.sender, to, tokenId);
}
```

**3. Role-Based Access Control:**

```javascript
// Only admin can validate:
function markTicketAsUsed(uint256 tokenId) public onlyAdmin {
    require(admins[msg.sender], "Not authorized");
    isTicketUsed[tokenId] = true;
}

// Frontend blocking:
if (userRole !== "admin") {
    validationUI.classList.add("blur-md", "pointer-events-none");
}
```

### Resources

- 📘 [Ethereum Docs](https://ethereum.org/developers)
- 📗 [Solidity Documentation](https://docs.soliditylang.org)
- 📙 [OpenZeppelin ERC-721](https://docs.openzeppelin.com/contracts/4.x/erc721)
- 📕 [Ethers.js v6 Guide](https://docs.ethers.org/v6/)
- 🔐 [Smart Contract Security Best Practices](https://consensys.net/smart-contract-best-practices/)

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Anda bebas menggunakan, memodifikasi, dan mendistribusikan dengan persyaratan sederhana. Lihat file `LICENSE` untuk detail lengkap.

---

## 💬 Dukungan

Untuk pertanyaan, issue, atau saran:

- 📧 **Email**: [2401020059@primakara.ac.id]
- 🐛 **Report Bug**: [GitHub Issues](https://github.com/wirayudhabn/arctic-monkeys-tickets/issues)
- 💡 **Diskusi**: [GitHub Discussions](https://github.com/wirayudhabn/arctic-monkeys-tickets/discussions)

---

<div align="center">

### Dibuat dengan 🔐 Keamanan Data & 💙 Blockchain Technology

**AM-TICKETS | Sistem Tiket On-Chain Aman untuk Arctic Monkeys World Tour 2026**

Proyek Akhir (UAS) - Keamanan Data dan Informasi | Bimbingan: Pak Made Adi

[⬆ Kembali ke Atas](#am-tickets-on-chain-audit-system)

</div>
