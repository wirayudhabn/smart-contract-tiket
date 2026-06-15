# AM-TICKETS: ON-CHAIN AUDIT SYSTEM
## 🎫 Sistem Penjualan Tiket Berbasis Blockchain dengan Validasi Keamanan Terdistribusi

<div align="center">

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Repository Size](https://img.shields.io/badge/repo%20size-light-green?style=flat-square)
![Solidity](https://img.shields.io/badge/solidity-v0.8.0+-red?style=flat-square)
![Web3](https://img.shields.io/badge/web3-ethers.js_v6-purple?style=flat-square)
![Network](https://img.shields.io/badge/network-sepolia_testnet-orange?style=flat-square)

**Solusi blockchain untuk mencegah pemalsuan tiket dan calo digital melalui mekanisme on-chain verification yang transparan dan terdesentralisasi.**

</div>

---

## 📋 Daftar Isi
- [Tentang Proyek](#-tentang-proyek)
- [Bagaimana Blockchain Mengatasi Masalah](#-bagaimana-blockchain-mengatasi-masalah)
- [Fitur Keamanan Utama](#-fitur-keamanan-utama)
- [Arsitektur & Teknologi](#-arsitektur--teknologi)
- [Informasi Smart Contract](#-informasi-smart-contract)
- [Panduan Instalasi Lokal](#-panduan-instalasi-lokal)
- [Tim Pengembang](#-tim-pengembang)

---

## 🎯 Tentang Proyek

**AM-TICKETS** adalah aplikasi desentralisasi (dApp) yang mensimulasikan sistem penjualan tiket konser **Arctic Monkeys World Tour 2026** berbasis teknologi blockchain Ethereum. Proyek ini dibangun sebagai **Tugas Akhir (UAS)** untuk mata kuliah **Keamanan Data dan Informasi** di bawah bimbingan **Pak Made Adi**.

Aplikasi ini mendemonstrasikan implementasi praktis dari konsep-konsep keamanan modern dalam konteks Web3, dengan fokus pada:
- 🔐 **Smart Contract Security**: Verifikasi dan validasi transaksi on-chain
- 🛡️ **Role-Based Access Control (RBAC)**: Manajemen hak akses berbasis peran
- 🔄 **Double-Spending Prevention**: Mekanisme ownership transfer yang aman
- 📊 **Immutable Audit Trail**: Pencatatan transaksi yang tidak dapat diubah di blockchain

---

## 🚨 Bagaimana Blockchain Mengatasi Masalah

Industri tiket digital menghadapi serangkaian tantangan keamanan yang kompleks. AM-TICKETS mengatasi masalah-masalah tersebut melalui implementasi teknologi blockchain:

### Masalah Tradisional vs Solusi Blockchain

| Masalah | Dampak | Solusi AM-TICKETS |
|---------|--------|------------------|
| **🎟️ Calo Digital & Scalper** | Harga tiket melonjak 3-5x lipat | Pembatasan maksimal tiket per wallet (max 5) + tracking ownership on-chain |
| **🔄 Pemalsuan Tiket** | Tiket ganda atau palsu beredar | Blockchain sebagai single source of truth; setiap token adalah unik dan terdaftar di ledger publik |
| **👻 Double-Spending** | Satu tiket digunakan berkali-kali | Smart contract memastikan transfer ownership atomik; pemilik lama otomatis kehilangan akses |
| **🔐 Kerentanan Sistem Terpusat** | Database rentan terhadap manipulasi | Desentralisasi penuh: tidak ada single point of failure; validasi didistribusikan ke jaringan |
| **👤 Akses Tidak Terbatas** | Siapa saja bisa memvalidasi tiket | RBAC strict: hanya promotor/admin authorized untuk mark tiket sebagai "used" |

---

## 🔐 Fitur Keamanan Utama

### 1. Akuisisi Tiket (Minting) - Anti-Scalping Mechanism

**Deskripsi:**  
Pembelian tiket dilakukan secara on-chain dengan harga fixed **0.01 Sepolia ETH** per tiket. Sistem menerapkan pembatasan ketat untuk mencegah perilaku calo.

**Mekanisme Keamanan:**
```
✓ Pembatasan per Wallet: Maksimal 5 tiket per address wallet
  → Calo harus membuat multiple wallets (biaya gas tinggi, tidak profitable)
  → Validasi on-chain: require(balanceOf(msg.sender) + qty <= MAX_LIMIT)

✓ Fixed Price: Harga tiket tidak bisa dipicu/dinaikkan dinamis
  → Mencegah price gouging dalam sistem smart contract

✓ Metamask Verification: Setiap transaksi ditandatangani digital oleh pemilik wallet
  → Tidak ada spoofing atau transaksi tanpa otorisasi pemilik
```

**Aspek Akademis:**
- Demonstrasi `Access Control List (ACL)` dengan pembatasan resource per principal
- Implementasi `Rate Limiting` di blockchain untuk mencegah penyalahgunaan

---

### 2. Sirkulasi Tiket (Transfer Ownership) - Double-Spending Prevention

**Deskripsi:**  
Transfer hak milik tiket dari satu wallet ke wallet lain dilakukan dengan mekanisme atomic state change, memastikan tidak ada kemungkinan double-spending.

**Mekanisme Keamanan:**
```
✓ Atomic Transfer: State change dalam satu transaksi blockchain
  → Pemilik lama: otomatis kehilangan akses ke tiket
  → Pemilik baru: mendapatkan ownership dengan status "unused"
  → Tidak ada state intermediate yang inconsistent

✓ Ownership Verification: Smart contract memverifikasi owner sebelum transfer
  → require(ownerOf(tokenId) == msg.sender, "Anda bukan pemilik")

✓ Nonce & Sequence Number: Setiap transaksi memiliki urutan unik
  → Mencegah replay attack atau reordering transaksi

✓ Immutable Transfer History: Setiap transfer tercatat di blockchain events
  → event Transfer(from, to, tokenId) emmited untuk audit trail
```

**Aspek Akademis:**
- Implementasi `Concurrency Control` pada sistem terdistribusi
- `ACID Properties` dalam transaksi blockchain (Atomicity, Consistency)
- `Merkle Tree Verification` untuk integritas state

---

### 3. Konsumsi Tiket (Gatekeeper Validation) - Role-Based Access Control

**Deskripsi:**  
Hanya dompet yang memiliki role "Promotor/Admin" yang dapat melakukan validasi tiket (mengubah status `isUsed` menjadi `true`). Penonton biasa akan diblokir akses UI dengan visual yang jelas.

**Mekanisme Keamanan:**

#### Smart Contract Level:
```solidity
✓ Access Control Enforcement:
  modifier onlyAdmin() {
      require(isAdmin[msg.sender], "Hanya admin yang bisa validasi");
      _;
  }
  
  function markTicketAsUsed(uint256 tokenId) public onlyAdmin {
      require(!isUsed[tokenId], "Tiket sudah digunakan");
      isUsed[tokenId] = true;
      emit TicketUsed(tokenId, block.timestamp);
  }

✓ State Verification:
  → Tidak bisa mark tiket yang tidak valid
  → Tidak bisa mark tiket 2x (prevent idempotency issues)
```

#### Frontend Level:
```javascript
✓ UI/UX Blocking:
  if (userRole === "attendee") {
      validationUI.classList.add("blur-md", "opacity-50");
      validationBtn.disabled = true;
      validationBtn.title = "Hanya admin yang bisa validasi tiket";
  }

✓ Role-Based Rendering:
  → Dashboard promotor: hidden untuk attendee
  → Tombol validasi: disabled untuk non-admin
  → Visual feedback: icon gembok untuk akses terbatas
```

**Aspek Akademis:**
- Implementasi `Role-Based Access Control (RBAC)` dengan privilege separation
- `Principle of Least Privilege`: User hanya diberikan akses minimum yang diperlukan
- `Least Privilege Principle`: Admin role hanya untuk operasi yang critical

---

## 🏗️ Arsitektur & Teknologi

### Stack Teknologi

| Layer | Teknologi | Versi | Fungsi |
|-------|-----------|-------|--------|
| **Blockchain** | Ethereum Sepolia Testnet | Terbaru | Ledger desentralisasi & consensus |
| **Smart Contract** | Solidity | v0.8.0+ | Business logic on-chain |
| **Frontend Framework** | HTML5 | Terbaru | Struktur & semantik halaman |
| **Frontend Logic** | Vanilla JavaScript | ES6+ | DOM manipulation & state management |
| **Styling** | Tailwind CSS | v3 (CDN) | Responsive design & utilities |
| **Web3 Integration** | Ethers.js | v6 | Contract interaction & wallet |
| **Wallet Provider** | Metamask | Latest | Digital signature & transaction signing |
| **Deployment Frontend** | Vercel | - | CI/CD & hosting frontend |
| **IDE Smart Contract** | Remix IDE | Online | Development & deployment contract |

### Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                         │
│          (HTML5 + Vanilla JS + Tailwind CSS)                    │
├─────────────────────────────────────────────────────────────────┤
│  • Minting UI          • Transfer UI         • Validation UI    │
│  • Wallet Connection   • Transaction History • Dashboard        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                    [Ethers.js v6]
                 • Contract Interaction
                 • Wallet Management
                 • Event Listening
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    [Metamask]    [Smart Contract]   [Blockchain]
    • Signing Txs  • ERC-721 Logic   • State Storage
    • Key Storage  • RBAC Enforce    • Consensus
    • Web3 Provider • Access Control  • Events Log
         │                │                │
         └────────────────┴────────────────┘
                          │
         ┌────────────────▼───────────────┐
         │  ETHEREUM SEPOLIA TESTNET      │
         ├────────────────────────────────┤
         │  • Distributed Nodes           │
         │  • Proof-of-Stake Consensus    │
         │  • Immutable Ledger            │
         │  • Smart Contract Execution    │
         └────────────────────────────────┘
```

---

## 📦 Informasi Smart Contract

### Deployment Details

```
┌───────────────────────────────────────────────────┐
│            SMART CONTRACT INFORMATION             │
├───────────────────────────────────────────────────┤
│ Network:          Ethereum Sepolia Testnet        │
│ Contract Type:    ERC-721 (Non-Fungible Token)    │
│ Status:           Active & Deployed               │
│ Verifikasi:       Tersedia di Etherscan           │
└───────────────────────────────────────────────────┘
```

### Contract Address

```
0x6C339FfEcbc9C011bB8d08796FE7Fd146812D9B5
```

### Akses di Block Explorer

Untuk melihat kode smart contract, transaksi, dan state:

1. **Buka Sepolia Etherscan:**  
   https://sepolia.etherscan.io/address/0x6C339FfEcbc9C011bB8d08796FE7Fd146812D9B5

2. **Tab yang Tersedia:**
   - `Code`: Kode Solidity smart contract
   - `Read Contract`: Query state tanpa biaya gas
   - `Write Contract`: Eksekusi function (dengan Metamask)
   - `Transactions`: Riwayat semua transaksi
   - `Logs`: Event logs untuk audit trail

3. **Contoh Interaksi:**
   - Query: `balanceOf(address)` → Lihat berapa tiket dimiliki user
   - Query: `ownerOf(uint256 tokenId)` → Lihat siapa pemilik tiket
   - Execute: `mint(5)` → Beli 5 tiket (kirim 0.05 Sepolia ETH)

### Core Functions

| Function | Deskripsi | Akses |
|----------|-----------|-------|
| `mint(quantity)` | Membeli tiket on-chain | Public (Attendee + Admin) |
| `transferTicket(to, tokenId)` | Transfer tiket ke wallet lain | Public (Pemilik token) |
| `markTicketAsUsed(tokenId)` | Mark tiket sebagai tervalidasi | Admin Only |
| `balanceOf(address)` | Jumlah tiket milik address | Public Query |
| `ownerOf(tokenId)` | Pemilik suatu token ID | Public Query |
| `isTicketUsed(tokenId)` | Status penggunaan tiket | Public Query |

---

## 🚀 Panduan Instalasi Lokal

### Prerequisites

Sebelum menjalankan aplikasi, pastikan Anda sudah memiliki:

- ✅ **Browser**: Chrome, Firefox, Brave, atau Edge terbaru
- ✅ **Metamask Extension**: Terinstall dan aktif ([download](https://metamask.io))
- ✅ **Sepolia ETH**: Test token gratis dari [faucet](https://sepolia-faucet.pk910.de/)
- ✅ **Live Server**: Python, Node.js, atau VS Code Live Server Extension
- ✅ **Text Editor**: VS Code atau editor favorit Anda

### Langkah Instalasi

#### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/am-tickets.git
cd am-tickets
```

#### Step 2: Konfigurasi Metamask

1. Buka browser dan klik icon **Metamask**
2. Login ke akun Anda
3. Klik dropdown network pilih **Sepolia Testnet**
4. Pastikan akun Anda memiliki Sepolia ETH
   - Jika belum ada, dapatkan dari [Sepolia Faucet](https://sepolia-faucet.pk910.de/)

#### Step 3: Jalankan Live Server

Pilih salah satu opsi berikut:

**Opsi A: Python (Recommended)**
```bash
# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000
```

Buka browser: `http://localhost:8000`

**Opsi B: Node.js (http-server)**
```bash
npm install -g http-server
http-server -p 8000
```

Buka browser: `http://localhost:8000`

**Opsi C: VS Code Live Server (Termudah)**
```
1. Install extension "Live Server" dari VS Code Marketplace
2. Klik kanan file index.html
3. Pilih "Open with Live Server"
4. Browser otomatis terbuka di http://localhost:5500
```

#### Step 4: Connect Wallet & Mulai Gunakan

1. Buka aplikasi di browser (URL sesuai Step 3)
2. Klik tombol **"Connect Wallet"**
3. Approve connection di Metamask popup
4. Pilih role: **Penonton** atau **Promotor**
5. Mulai gunakan fitur sesuai role:
   - **Penonton**: Beli tiket, lihat riwayat, transfer
   - **Promotor**: Validasi tiket, lihat dashboard

### Troubleshooting

| Masalah | Solusi |
|---------|--------|
| ❌ "Cannot GET /" | Pastikan live server berjalan di direktori root project |
| ❌ Metamask tidak terdeteksi | Refresh browser, pastikan extension enabled |
| ❌ "Wrong network" | Ganti network Metamask ke Sepolia Testnet |
| ❌ "Insufficient balance" | Minta Sepolia ETH dari faucet |
| ❌ Transaksi gagal | Cek gas price & balance Metamask |
| ❌ Contract tidak respond | Verifikasi address contract di Etherscan |

---

### Informasi Akademis

- **Mata Kuliah**: Keamanan Data dan Informasi
- **Dosen Pengampu**: Pak Made Adi
- **Tahun Akademik**: 2025/2026
- **Jenis Tugas**: Proyek Akhir (UAS)

---

## 📚 Referensi & Resources

### Dokumentasi Blockchain & Smart Contract
- [Ethereum Official Docs](https://ethereum.org/developers)
- [Solidity Documentation](https://docs.soliditylang.org)
- [OpenZeppelin ERC-721 Standard](https://docs.openzeppelin.com/contracts/4.x/erc721)

### Web3 Libraries & Tools
- [Ethers.js v6 Guide](https://docs.ethers.org/v6/)
- [Metamask Developer Documentation](https://docs.metamask.io)
- [Remix IDE Documentation](https://remix-ide.readthedocs.io/)

### Security & Best Practices
- [Smart Contract Security Best Practices](https://consensys.net/smart-contract-best-practices/)
- [OWASP Smart Contract Top 10](https://owasp.org/www-project-smart-contract-top-10/)
- [Blockchain Security Audit Checklist](https://swcregistry.io/)

### Sepolia Testnet Resources
- [Sepolia Faucet](https://sepolia-faucet.pk910.de/) - Dapatkan test ETH
- [Sepolia Etherscan](https://sepolia.etherscan.io/) - Block explorer
- [Sepolia Network Status](https://ethstats.net/) - Network health

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**.

```
MIT License

Copyright (c) 2026 AM-Tickets Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 💬 Support & Feedback

Untuk pertanyaan, issue, atau saran perbaikan:

- 📧 **Email**: [2401020059@primakara.ac.id]
- 🐛 **Report Bug**: [GitHub Issues](https://github.com/wirayudhabn/arctic-monkeys-tickets/issues)
- 💡 **Discussion**: [GitHub Discussions](https://github.com/wirayudhabn/arctic-monkeys-tickets/discussions)
- 📱 **Direct Message**: Hubungi anggota tim melalui channel komunikasi resmi

---

<div align="center">

### 🔐 Built with Blockchain Security & 💙 Web3 Innovation

**AM-TICKETS: Secure On-Chain Ticketing System for Arctic Monkeys World Tour 2026**

```
Mencegah Calo | Mencegah Pemalsuan | Mencegah Double-Spending
```

[⬆ Kembali ke Atas](#am-tickets-on-chain-audit-system)

</div>
