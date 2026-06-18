/**
 * ============================================================
 *  AM-TICKETS // ON-CHAIN AUDIT SYSTEM
 *  app.js — Logika Web3 Frontend
 *
 *  Stack  : Ethers.js v6 · MetaMask (window.ethereum)
 *  Network: Sepolia Testnet (Chain ID: 11155111)
 *  UAS    : Keamanan Data dan Informasi · 2026
 * ============================================================
 */

// ============================================================
//  ① KONFIGURASI KONTRAK
//  ─ Ganti nilai CONTRACT_ABI setelah deploy via Remix IDE
// ============================================================

/** @type {string} Alamat smart contract hasil deploy di Sepolia */
const CONTRACT_ADDRESS = "0x03CdB72D9eED941b8D1Bd359eB264f4B8D419c28";

/**
 * @type {Array} ABI dari smart contract ConcertTicketing.
 * Tempelkan array JSON ABI hasil kompilasi Remix di sini.
 *
 * ABI minimal yang dibutuhkan mencakup:
 *  - constructor / state variable: owner()
 *  - buyTicket()  → payable
 *  - transferTicket(uint256 ticketId, address newOwner)
 *  - validateTicket(uint256 ticketId)
 *  - ownerOf(uint256 ticketId) atau getTicketOwner(uint256 ticketId)
 *  - isTicketUsed(uint256 ticketId) atau tickets(uint256 id)
 */
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "buyTicket",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ticketId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "pricePaid",
        "type": "uint256"
      }
    ],
    "name": "TicketPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ticketId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "TicketTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ticketId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "validatedBy",
        "type": "address"
      }
    ],
    "name": "TicketValidated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_ticketId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      }
    ],
    "name": "transferTicket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_ticketId",
        "type": "uint256"
      }
    ],
    "name": "validateTicket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasPurchased",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxTickets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ticketPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tickets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isUsed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSold",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// ============================================================
//  ② STATE GLOBAL APLIKASI
// ============================================================

/** @type {ethers.BrowserProvider|null} Provider Ethers.js v6 */
let provider = null;

/** @type {ethers.Signer|null} Signer (akun MetaMask aktif) */
let signer = null;

/** @type {ethers.Contract|null} Instance kontrak (read-only atau dengan signer) */
let contract = null;

/** @type {string|null} Alamat wallet yang sedang terhubung */
let walletAddress = null;

/** @type {boolean} True jika akun terhubung adalah owner kontrak */
let isOwner = false;

/** Chain ID Sepolia Testnet */
const SEPOLIA_CHAIN_ID = 11155111n;

// ============================================================
//  ③ REFERENSI ELEMEN DOM
// ============================================================

const btnConnectWallet = document.getElementById("btn-connect-wallet");
const btnConnectLabel = document.getElementById("btn-connect-label");
const walletDisplay = document.getElementById("wallet-display");
const walletAddressEl = document.getElementById("wallet-address");
const roleBadgeWrapper = document.getElementById("role-badge-wrapper");
const roleBadge = document.getElementById("role-badge");
const networkStatusLabel = document.getElementById("network-status-label");
const networkStatusDot = document.getElementById("network-status-dot");
const networkStatusText = document.getElementById("network-status-text");

// Buy Ticket
const btnBuyTicket = document.getElementById("btn-buy-ticket");
const btnBuyLabel = document.getElementById("btn-buy-label");
const buyResultWrap = document.getElementById("buy-result-wrapper");
const buyResultId = document.getElementById("buy-result-id");

// Transfer Ticket
const btnTransferTicket = document.getElementById("btn-transfer-ticket");
const btnTransferLabel = document.getElementById("btn-transfer-label");
const inputTransferId = document.getElementById("transfer-ticket-id");
const inputTransferRecip = document.getElementById("transfer-recipient");

// Validate Ticket / Gatekeeper
const btnValidateTicket = document.getElementById("btn-validate-ticket");
const btnValidateLabel = document.getElementById("btn-validate-label");
const inputValidateId = document.getElementById("validate-ticket-id");

// My Tickets Dashboard Elements
const myTicketsList = document.getElementById("my-tickets-list");
const btnRefreshTickets = document.getElementById("btn-refresh-tickets");
const btnClearTickets = document.getElementById("btn-clear-tickets");
const lockOverlay = document.getElementById("lock-overlay");
const gatekeeperAccessInd = document.getElementById("gatekeeper-access-indicator");
const gatekeeperAccessBadge = document.getElementById("gatekeeper-access-badge");
const validationResult = document.getElementById("validation-result");
const validationResultInner = document.getElementById("validation-result-inner");

// ============================================================
//  ④ SISTEM NOTIFIKASI TOAST
// ============================================================

const toastContainer = document.getElementById("toast-container");

/**
 * Menampilkan notifikasi toast di sudut kanan atas layar.
 *
 * @param {'success'|'error'|'info'} type  - Jenis notifikasi
 * @param {string}                   title - Judul singkat
 * @param {string}                   msg   - Pesan detail
 * @param {number}                  [duration=5000] - Durasi tampil (ms)
 */
function showToast(type, title, msg, duration = 5000) {
  const icons = {
    success: "✓",
    error: "✕",
    info: "◈",
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] ?? "◈"}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <button class="toast-close" aria-label="Tutup notifikasi">✕</button>
  `;

  toastContainer.appendChild(toast);

  // Close button handler
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => {
    toast.classList.add("leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  });

  // Auto-remove setelah durasi habis
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add("leaving");
      toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }
  }, duration);
}

// ============================================================
//  ⑤ UTILITAS HELPER
// ============================================================

/**
 * Memendekkan alamat Ethereum untuk tampilan UI.
 * Contoh: 0x1234...5678
 *
 * @param {string} address - Alamat Ethereum lengkap
 * @returns {string} Alamat yang dipendekkan
 */
function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Mengekstrak pesan error yang ramah dari exception Ethers.js / MetaMask.
 * Kontrak yang di-revert biasanya menyertakan reason string.
 *
 * @param {Error} err - Object error dari catch block
 * @returns {string} Pesan error yang sudah disederhanakan
 */
function parseError(err) {
  // Ethers v6: cek reason / revert data
  if (err?.reason) return err.reason;
  if (err?.data?.message) return err.data.message;
  if (err?.error?.data?.message) return err.error.data.message;
  if (err?.message?.includes("user rejected")) return "Transaksi ditolak oleh pengguna.";
  if (err?.message?.includes("insufficient funds")) return "Saldo ETH tidak cukup untuk membayar.";
  if (err?.message?.includes("network changed")) return "Jaringan berubah, silakan koneksikan ulang.";
  if (err?.message) return err.message.slice(0, 120);
  return "Terjadi kesalahan yang tidak diketahui.";
}

/**
 * Mengatur tombol ke mode loading (spinner + disable) atau normal.
 *
 * @param {HTMLButtonElement} btn    - Elemen tombol
 * @param {HTMLElement}       label  - Elemen span label di dalam tombol
 * @param {boolean}           loading - true = mode loading
 * @param {string}           [originalLabel=""] - Teks label saat tidak loading
 */
function setLoading(btn, label, loading, originalLabel = "") {
  if (loading) {
    btn.disabled = true;
    label.innerHTML = `<svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Memproses...`;
  } else {
    btn.disabled = false;
    label.textContent = originalLabel;
  }
}

// ============================================================
//  ⑥ KONEKSI WALLET & PEMERIKSAAN JARINGAN
// ============================================================

/**
 * Menangani klik tombol Connect / Disconnect Wallet.
 * Jika sudah terhubung, fungsi ini memutus koneksi UI (bukan MetaMask).
 */
btnConnectWallet.addEventListener("click", async () => {
  if (walletAddress) {
    // Disconnect: reset state UI
    disconnectWallet();
  } else {
    await connectWallet();
  }
});

/**
 * Menginisialisasi koneksi ke MetaMask menggunakan Ethers.js v6.
 * Langkah:
 *  1. Periksa ketersediaan window.ethereum
 *  2. Request akun (memunculkan popup MetaMask)
 *  3. Verifikasi jaringan Sepolia
 *  4. Inisialisasi provider, signer, dan kontrak
 *  5. Periksa apakah akun ini adalah owner kontrak
 */
async function connectWallet() {
  // Guard: pastikan MetaMask tersedia
  if (!window.ethereum) {
    showToast("error", "MetaMask Tidak Ditemukan",
      "Instal ekstensi MetaMask di browser Anda untuk menggunakan aplikasi ini.");
    return;
  }

  setLoading(btnConnectWallet, btnConnectLabel, true);

  try {
    // ── Ethers.js v6: BrowserProvider menggantikan Web3Provider ──
    provider = new ethers.BrowserProvider(window.ethereum);

    // Request akses akun dari MetaMask
    await provider.send("eth_requestAccounts", []);

    signer = await provider.getSigner();
    walletAddress = await signer.getAddress();

    // ── Verifikasi Jaringan ──────────────────────────────────
    const network = await provider.getNetwork();
    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      showToast("error", "Jaringan Salah",
        `Anda terhubung ke chain ID ${network.chainId}. Harap pindah ke Sepolia Testnet (chain ID 11155111).`);
      disconnectWallet();
      return;
    }

    // ── Inisialisasi Kontrak ────────────────────────────────
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // ── Perbarui UI ─────────────────────────────────────────
    updateWalletUI();

    // ── Cek Role (Owner vs Fan) ─────────────────────────────
    await checkOwnerRole();

    showToast("success", "Wallet Terhubung",
      `Akun ${shortenAddress(walletAddress)} berhasil terhubung ke Sepolia Testnet.`);

  } catch (err) {
    const msg = parseError(err);
    showToast("error", "Koneksi Gagal", msg);
    disconnectWallet();
  } finally {
    // Reset loading state tombol connect (label sudah diubah oleh updateWalletUI)
    btnConnectWallet.disabled = false;
  }
}

/**
 * Mereset seluruh state koneksi dan tampilan UI ke kondisi awal.
 */
function disconnectWallet() {
  walletAddress = null;
  signer = null;
  contract = null;
  isOwner = false;

  // Reset wallet display
  walletDisplay.classList.add("hidden");
  roleBadgeWrapper.classList.add("hidden");
  walletAddressEl.textContent = "";

  // Reset button
  btnConnectLabel.textContent = "Connect Wallet";
  btnConnectWallet.disabled = false;

  // Matikan dot network dan text (hapus efek glow)
  networkStatusDot.classList.remove("connected");
  networkStatusText.classList.remove("network-text", "connected");

  // Reset network label
  networkStatusLabel.textContent = "NOT CONNECTED";

  // Reset buy section
  btnBuyTicket.disabled = true;
  btnBuyLabel.textContent = "CONNECT WALLET FIRST";
  buyResultWrap.classList.add("hidden");

  // Reset transfer section
  btnTransferTicket.disabled = true;
  btnTransferLabel.textContent = "CONNECT WALLET FIRST";

  // Reset gatekeeper — kunci overlay (tampilkan) saat disconnect
  applyGatekeeperLock(true);
  gatekeeperAccessInd.classList.add("hidden");
  btnValidateTicket.disabled = true;
  btnValidateLabel.textContent = "VALIDATE TICKET & OPEN GATE";
  validationResult.classList.add("hidden");
}

/**
 * Memperbarui tampilan header setelah wallet berhasil terhubung.
 * Menampilkan alamat pendek, mengubah teks tombol, dll.
 */
function updateWalletUI() {
  // Tampilkan wallet address
  walletAddressEl.textContent = shortenAddress(walletAddress);
  walletDisplay.classList.remove("hidden");

  // Ubah tombol menjadi Disconnect
  btnConnectLabel.textContent = "Disconnect";

  // Nyalakan dot network dan text dengan efek glow
  networkStatusDot.classList.add("connected");
  networkStatusText.classList.add("network-text", "connected");

  // Perbarui network label di hero
  networkStatusLabel.textContent = "CONNECTED · SEPOLIA";

  // Aktifkan tombol-tombol aksi
  btnBuyTicket.disabled = false;
  btnBuyLabel.textContent = "BUY TICKET — 0.01 ETH";
  btnTransferTicket.disabled = false;
  btnTransferLabel.textContent = "TRANSFER TICKET";
}

// ============================================================
//  ⑦ ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================

/**
 * Memeriksa apakah wallet yang terhubung adalah admin/deployer kontrak.
 *
 * Proses:
 *  - Memanggil fungsi read-only `admin()` di smart contract
 *  - Membandingkan hasilnya (case-insensitive) dengan walletAddress saat ini
 *  - Mengupdate badge role di header dan status kunci Gatekeeper Section
 *
 * @returns {Promise<void>}
 */
async function checkOwnerRole() {
  if (!contract || !walletAddress) return;

  try {
    const contractOwner = await contract.admin();
    isOwner = contractOwner.toLowerCase() === walletAddress.toLowerCase();
  } catch (err) {
    // Jika kontrak tidak ditemukan (ADDRESS salah/belum deploy),
    // fallback ke mode non-owner agar UI tidak crash
    console.warn("Tidak bisa mengambil data owner dari kontrak:", parseError(err));
    isOwner = false;
  }

  // ── Update Role Badge di Header ──────────────────────────
  roleBadgeWrapper.classList.remove("hidden");

  if (isOwner) {
    roleBadge.textContent = "ROLE: PROMOTOR / ADMIN";
    roleBadge.className = "role-badge promotor";
  } else {
    roleBadge.textContent = "ROLE: FAN / PENONTON";
    roleBadge.className = "role-badge fan";
  }

  // ── Update Gatekeeper Access ─────────────────────────────
  gatekeeperAccessInd.classList.remove("hidden");

  if (isOwner) {
    // Buka kunci Gatekeeper untuk Promotor
    applyGatekeeperLock(false);
    gatekeeperAccessBadge.textContent = "ACCESS: GRANTED";
    gatekeeperAccessBadge.className = "role-badge promotor text-[10px]";
    btnValidateTicket.disabled = false;
    btnValidateLabel.textContent = "VALIDATE TICKET & OPEN GATE";
  } else {
    // Kunci Gatekeeper untuk Fan biasa
    applyGatekeeperLock(true);
    gatekeeperAccessBadge.textContent = "ACCESS: DENIED";
    gatekeeperAccessBadge.className = "role-badge fan text-[10px]";
    btnValidateTicket.disabled = true;
  }
}

/**
 * Mengaktifkan atau menonaktifkan overlay kunci pada Section Gatekeeper.
 *
 * @param {boolean} locked - true = tampilkan overlay kunci (untuk Fan)
 */
function applyGatekeeperLock(locked) {
  if (locked) {
    lockOverlay.classList.remove("hidden");
  } else {
    lockOverlay.classList.add("hidden");
  }
}

// ============================================================
//  ⑧ FITUR WEB3: BUY TICKET
// ============================================================

/**
 * Memanggil fungsi `buyTicket()` di smart contract.
 *
 * Alur:
 *  1. User klik tombol → set loading state
 *  2. Kirim transaksi payable sebesar 0.01 ETH
 *  3. Tunggu konfirmasi 1 blok (wait(1))
 *  4. Ekstrak Ticket ID dari event `TicketPurchased` (jika ada)
 *     atau dari return value transaksi
 *  5. Tampilkan Ticket ID dan notifikasi sukses
 *
 * @returns {Promise<void>}
 */
// ============================================================
// ⑧ FITUR WEB3: BUY TICKET
// ============================================================
btnBuyTicket.addEventListener("click", async () => {
  if (!contract) return;
  setLoading(btnBuyTicket, btnBuyLabel, true);
  buyResultWrap.classList.add("hidden");

  try {
    // 1. Tentukan harga tiket
    const ticketPrice = ethers.parseEther("0.01");

    // 2. Panggil fungsi buyTicket di smart contract dan kirim value ETH
    const tx = await contract.buyTicket({ value: ticketPrice });
    showToast("info", "Memproses...", "Harap tunggu transaksi dikonfirmasi.");

    // 3. Tunggu hingga transaksi dikonfirmasi oleh jaringan (1 block)
    const receipt = await tx.wait(1);

    // 4. Ambil Ticket ID terbaru.
    // Karena di Solidity totalSold di-increment sebelum pembuatan tiket,
    // ID tiket terbaru sama persis dengan angka totalSold saat ini.
    const totalSold = await contract.totalSold();
    const ticketId = totalSold.toString(); // <-- Bagian ini yang diubah (hilangkan - 1n)

    // 5. Tampilkan hasilnya ke UI menggantikan strip "--"
    buyResultId.textContent = ticketId;
    buyResultWrap.classList.remove("hidden");

    // 6. Simpan riwayat tiket ke Local Storage (sudah ada di fungsi Anda)
    saveTicketToStorage(ticketId, receipt.hash);

    showToast("success", "Pembelian Berhasil", `Anda berhasil membeli tiket dengan ID #${ticketId}.`);

  } catch (err) {
    const msg = parseError(err);
    showToast("error", "Pembelian Gagal", msg);
  } finally {
    setLoading(btnBuyTicket, btnBuyLabel, false, "BUY TICKET — 0.01 ETH");
  }
});

// ============================================================
//  ⑨ FITUR WEB3: TRANSFER TICKET
// ============================================================

/**
 * Memanggil fungsi `transferTicket(ticketId, newOwner)` di smart contract.
 *
 * Validasi sisi klien:
 *  - Ticket ID harus berupa angka ≥ 0
 *  - Recipient address harus berupa alamat Ethereum valid (0x...)
 *
 * Keamanan:
 *  - Validasi utama tetap dilakukan oleh smart contract (pemilik ≠ pengirim → revert)
 *  - Setelah transfer sukses, pemilik lama otomatis kehilangan akses (Anti-Double Spending)
 *
 * @returns {Promise<void>}
 */
btnTransferTicket.addEventListener("click", async () => {
  if (!contract) return;

  const ticketIdRaw = inputTransferId.value.trim();
  const recipientAddr = inputTransferRecip.value.trim();

  // ── Validasi Input Sisi Klien ────────────────────────────
  if (ticketIdRaw === "" || isNaN(Number(ticketIdRaw)) || Number(ticketIdRaw) < 0) {
    showToast("error", "Input Tidak Valid", "Masukkan Ticket ID yang valid (angka ≥ 0).");
    return;
  }

  if (!ethers.isAddress(recipientAddr)) {
    showToast("error", "Alamat Tidak Valid",
      "Masukkan alamat MetaMask penerima yang valid (format 0x...).");
    return;
  }

  if (recipientAddr.toLowerCase() === walletAddress?.toLowerCase()) {
    showToast("error", "Transfer ke Diri Sendiri",
      "Anda tidak dapat mentransfer tiket ke alamat Anda sendiri.");
    return;
  }

  setLoading(btnTransferTicket, btnTransferLabel, true);

  try {
    const ticketId = BigInt(ticketIdRaw);

    // Panggil fungsi transferTicket() di kontrak
    const tx = await contract.transferTicket(ticketId, recipientAddr);

    showToast("info", "Transaksi Dikirim",
      `Transfer sedang diproses... Hash: ${shortenAddress(tx.hash)}`);

    await tx.wait(1);

    // Bersihkan form
    inputTransferId.value = "";
    inputTransferRecip.value = "";

    showToast("success", "Transfer Berhasil! ✓",
      `Tiket #${ticketIdRaw} telah dipindahkan ke ${shortenAddress(recipientAddr)}. Anda tidak lagi memiliki akses ke tiket ini.`);

  } catch (err) {
    const msg = parseError(err);
    showToast("error", "Transfer Gagal", msg);
  } finally {
    setLoading(btnTransferTicket, btnTransferLabel, false, "TRANSFER TICKET");
  }
});

// ============================================================
//  ⑩ FITUR WEB3: VALIDATE TICKET (GATEKEEPER — OWNER ONLY)
// ============================================================

/**
 * Memanggil fungsi `validateTicket(ticketId)` di smart contract.
 *
 * RBAC (Role-Based Access Control):
 *  - Tombol ini dinonaktifkan secara UI untuk akun non-owner
 *  - Kontrak juga memiliki modifier `onlyOwner` sebagai lapis keamanan kedua
 *
 * Alur:
 *  1. Guard: cek isOwner sebelum melanjutkan (double-check di sisi klien)
 *  2. Kirim transaksi validateTicket()
 *  3. Tampilkan hasil verifikasi (sukses = tiket valid & dikonsumsi)
 *
 * @returns {Promise<void>}
 */
btnValidateTicket.addEventListener("click", async () => {
  if (!contract) return;

  // Guard RBAC sisi klien
  if (!isOwner) {
    showToast("error", "Akses Ditolak",
      "Hanya Promotor / Owner kontrak yang dapat memvalidasi tiket.");
    return;
  }

  const ticketIdRaw = inputValidateId.value.trim();

  if (ticketIdRaw === "" || isNaN(Number(ticketIdRaw)) || Number(ticketIdRaw) < 0) {
    showToast("error", "Input Tidak Valid", "Masukkan Ticket ID yang valid (angka ≥ 0).");
    return;
  }

  setLoading(btnValidateTicket, btnValidateLabel, true);
  validationResult.classList.add("hidden");

  try {
    const ticketId = BigInt(ticketIdRaw);

    // Cek status tiket via struct tickets(ticketId) — sesuai ABI kontrak
    // Struct mengembalikan: { id, owner, isUsed }
    let alreadyUsed = false;
    try {
      const ticketData = await contract.tickets(ticketId);
      alreadyUsed = ticketData.isUsed;
    } catch {
      // Fallback: lanjutkan ke transaksi, biarkan kontrak yang reject jika sudah dipakai
    }

    if (alreadyUsed) {
      showValidationResult(false, ticketIdRaw,
        "Tiket ini sudah pernah digunakan / divalidasi sebelumnya.", "ALREADY USED");
      showToast("error", "Tiket Tidak Valid",
        `Tiket #${ticketIdRaw} sudah pernah dipakai (status: USED).`);
      return;
    }

    // Kirim transaksi validasi
    const tx = await contract.validateTicket(ticketId);

    showToast("info", "Validasi Sedang Diproses",
      `Menunggu konfirmasi blok... Hash: ${shortenAddress(tx.hash)}`);

    await tx.wait(1);

    // Tampilkan hasil sukses
    showValidationResult(true, ticketIdRaw,
      "Tiket valid. Pemegang tiket diizinkan masuk ke venue.", "VERIFIED & CONSUMED");

    inputValidateId.value = "";

    showToast("success", "GERBANG TERBUKA ✓",
      `Tiket #${ticketIdRaw} berhasil divalidasi. Event TicketValidated terekam di blockchain.`, 7000);

  } catch (err) {
    const msg = parseError(err);
    showValidationResult(false, ticketIdRaw, msg, "VALIDATION FAILED");
    showToast("error", "Validasi Gagal", msg);
  } finally {
    setLoading(btnValidateTicket, btnValidateLabel, false, "VALIDATE TICKET & OPEN GATE");
  }
});

/**
 * Menampilkan hasil validasi tiket di dalam panel Section Gatekeeper.
 *
 * @param {boolean} success   - true = tiket valid
 * @param {string}  ticketId  - ID tiket yang divalidasi
 * @param {string}  message   - Pesan hasil
 * @param {string}  status    - Label status singkat
 */
function showValidationResult(success, ticketId, message, status) {
  const borderColor = success ? "border-white/20" : "border-red-800/40";
  const statusColor = success ? "text-white" : "text-red-400";
  const icon = success ? "✓" : "✕";

  validationResultInner.className =
    `p-4 rounded border text-xs space-y-2 ${borderColor} bg-white/[0.03]`;

  validationResultInner.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="text-silver/50 uppercase tracking-widest" style="font-size:0.6rem">TICKET ID</span>
      <span class="font-mono font-bold text-ghost">#${ticketId}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-silver/50 uppercase tracking-widest" style="font-size:0.6rem">STATUS</span>
      <span class="font-mono font-bold ${statusColor}">${icon} ${status}</span>
    </div>
    <div class="text-silver/60 leading-relaxed pt-1 border-t border-white/[0.06]">${message}</div>
  `;

  validationResult.classList.remove("hidden");
}

// ============================================================
//  ⑪ EVENT LISTENERS: PERUBAHAN AKUN & JARINGAN (MetaMask)
// ============================================================

if (window.ethereum) {
  /**
   * Dijalankan ketika user mengganti akun di MetaMask.
   * Reset dan coba koneksi ulang otomatis dengan akun baru.
   */
  window.ethereum.on("accountsChanged", async (accounts) => {
    if (accounts.length === 0) {
      // User memutus semua akun dari MetaMask
      disconnectWallet();
      showToast("info", "Wallet Terputus", "MetaMask tidak memiliki akun aktif.");
    } else {
      // Akun berganti, perbarui state
      disconnectWallet();
      await connectWallet();
    }
  });

  /**
   * Dijalankan ketika user mengganti jaringan di MetaMask.
   * Disconnect dan minta user untuk kembali ke Sepolia.
   */
  window.ethereum.on("chainChanged", () => {
    disconnectWallet();
    showToast("info", "Jaringan Berubah",
      "Jaringan MetaMask berubah. Pastikan Anda menggunakan Sepolia Testnet, lalu connect ulang.");
  });
}

// ============================================================
//  ⑪ᴬ MY TICKETS DASHBOARD — LOCAL STORAGE MANAGEMENT
// ============================================================

/**
 * Simpan Ticket ID & Transaction Hash ke localStorage (JSON format)
 * @param {string} ticketId - ID tiket yang baru dibeli
 * @param {string} txHash - Transaction hash dari Ethereum
 */
function saveTicketToStorage(ticketId, txHash) {
  try {
    const tickets = JSON.parse(localStorage.getItem("amTickets")) || [];

    // Tambah tiket dengan timestamp & tx hash
    tickets.push({
      id: ticketId,
      txHash: txHash,
      bought: new Date().toLocaleString(),
      timestamp: Date.now(),
    });

    localStorage.setItem("amTickets", JSON.stringify(tickets));
    console.log(`✓ Ticket #${ticketId} saved to storage with txHash: ${shortenAddress(txHash)}`);
  } catch (err) {
    console.error("Error saving ticket:", err);
  }
}

/**
 * Muat dan tampilkan semua tiket dari localStorage dengan link Etherscan
 */
function loadMyTickets() {
  try {
    const tickets = JSON.parse(localStorage.getItem("amTickets")) || [];

    // Clear container
    myTicketsList.innerHTML = "";

    if (tickets.length === 0) {
      myTicketsList.innerHTML = `
        <div class="text-center py-8">
          <p class="text-silver/50 text-sm">Anda belum membeli tiket apapun</p>
        </div>
      `;
      return;
    }

    // Sort by timestamp (newest first)
    tickets.sort((a, b) => b.timestamp - a.timestamp);

    // Render ticket cards
    const ticketsHtml = tickets.map((ticket, index) => {
      const etherscanLink = ticket.txHash ? `https://sepolia.etherscan.io/tx/${ticket.txHash}` : "#";
      return `
      <div class="glass-card rounded p-4 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4 hover:bg-white/[0.06] transition">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="text-ghost font-mono font-bold text-sm">#${ticket.id}</span>
            <span class="text-[10px] text-silver/50 bg-white/[0.05] px-2 py-0.5 rounded">Tiket ${index + 1}</span>
          </div>
          <p class="text-silver/60 text-xs mb-2">Dibeli: ${ticket.bought}</p>
          ${ticket.txHash ? `<a href="${etherscanLink}" target="_blank" class="text-[10px] text-silver hover:text-ghost transition font-mono flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            ${shortenAddress(ticket.txHash)}
          </a>` : ""}
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            class="btn-secondary px-3 py-1.5 rounded text-xs whitespace-nowrap"
            onclick="copyToClipboard('${ticket.id}')"
            title="Copy Ticket ID"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline; margin-right:4px;">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            COPY
          </button>
          ${ticket.txHash ? `<a href="${etherscanLink}" target="_blank" class="btn-secondary px-3 py-1.5 rounded text-xs whitespace-nowrap hover:bg-white/[0.1] transition" title="View on Etherscan">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline; margin-right:4px;">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            VIEW
          </a>` : ""}
        </div>
      </div>
    `;
    }).join("");

    myTicketsList.innerHTML = ticketsHtml;
  } catch (err) {
    console.error("Error loading tickets:", err);
    myTicketsList.innerHTML = `<div class="text-center py-8"><p class="text-red-400 text-sm">❌ Error loading tickets</p></div>`;
  }
}

/**
 * Copy Ticket ID ke clipboard
 * @param {string} ticketId 
 */
function copyToClipboard(ticketId) {
  navigator.clipboard.writeText(ticketId).then(() => {
    showToast("success", "Copied", `Ticket ID #${ticketId} copied to clipboard!`);
  }).catch(() => {
    showToast("error", "Copy Failed", "Cannot copy to clipboard");
  });
}

/**
 * Setup event listeners untuk My Tickets buttons
 */
function setupMyTicketsEventListeners() {
  btnRefreshTickets?.addEventListener("click", () => {
    loadMyTickets();
    showToast("info", "Refreshed", "Ticket list updated.");
  });

  btnClearTickets?.addEventListener("click", () => {
    if (confirm("Hapus semua riwayat tiket? Aksi ini tidak dapat dibatalkan.")) {
      localStorage.removeItem("amTickets");
      loadMyTickets();
      showToast("success", "Cleared", "Ticket history cleared.");
    }
  });
}

// ============================================================
//  ⑫ INISIALISASI AWAL
// ============================================================

/**
 * Memeriksa apakah MetaMask sudah pernah mengizinkan koneksi ke situs ini
 * (tanpa memunculkan popup). Jika ya, koneksi ulang secara otomatis.
 */
async function initAutoConnect() {
  if (!window.ethereum) return;

  try {
    // eth_accounts tidak memunculkan popup MetaMask
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts && accounts.length > 0) {
      // Ada akun yang sudah diizinkan sebelumnya → auto-connect
      await connectWallet();
    }
  } catch (err) {
    console.warn("Auto-connect gagal:", parseError(err));
  }

  // Load My Tickets dari localStorage
  loadMyTickets();
  setupMyTicketsEventListeners();
}

// ────────────────────────────────────────────────────────────
// JALANKAN INISIALISASI SAAT HALAMAN DIMUAT
// ────────────────────────────────────────────────────────────
initAutoConnect();
