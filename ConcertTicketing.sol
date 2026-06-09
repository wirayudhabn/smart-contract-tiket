// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ConcertTicketing
 * @dev Proyek dApp TicketBlock untuk Tugas Mata Kuliah Keamanan Data dan Informasi.
 * Mengimplementasikan konsep Keamanan: Otentikasi, Integritas, Non-repudiasi, dan Kontrol Akses.
 */
contract ConcertTicketing {
    // --- STATE VARIABLES ---
    
    // [Otentikasi & Kontrol Akses] Menyimpan identitas pembuat kontrak (Admin)
    // Digunakan untuk memastikan hanya pihak berwenang yang bisa mengubah state vital (misal: validasi tiket)
    address public admin; 
    
    // Harga dan kuota ditetapkan final (constant) untuk mencegah perubahan tidak sah (Integritas Data)
    uint256 public constant ticketPrice = 0.01 ether; 
    uint256 public constant maxTickets = 50; 
    
    // Melacak jumlah tiket terjual. Tipe uint256 mencegah nilai negatif.
    uint256 public totalSold; 

    // --- STRUCTS & MAPPINGS ---

    // Struktur data tiket. Menyimpan data penting: id, pemilik terkini, dan status penggunaan.
    struct Ticket {
        uint256 id;
        address owner;
        bool isUsed;
    }

    // Pemetaan (Mapping) ID tiket ke struktur datanya
    mapping(uint256 => Ticket) public tickets;
    
    // [Anti-Calo / Sybil Attack] Memastikan 1 wallet (entitas) hanya bisa beli 1 tiket
    mapping(address => bool) public hasPurchased; 

    // --- MODIFIER ---

    // [Kontrol Akses / Authorization] Membatasi eksekusi fungsi hanya untuk admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Akses ditolak: Hanya Admin yang diizinkan");
        _;
    }

    // --- EVENTS (Pencatatan / Logging) ---
    // Event membantu pelacakan transaksi secara off-chain (Transparansi & Audit Trail)
    event TicketPurchased(uint256 indexed ticketId, address indexed buyer);
    event TicketTransferred(uint256 indexed ticketId, address indexed from, address indexed to);
    event TicketValidated(uint256 indexed ticketId);

    // --- FUNCTIONS ---

    // Constructor dieksekusi sekali saat deploy ke Blockchain.
    constructor() {
        // [Otentikasi] Menetapkan akun yang melakukan deploy sebagai admin.
        admin = msg.sender; 
    }

    /**
     * @dev Fungsi untuk membeli tiket (Akses: Publik).
     */
    function buyTicket() external payable {
        // [Integritas] Memastikan nilai ETH yang dikirim sesuai persis dengan harga.
        require(msg.value == ticketPrice, "Gagal: Pembayaran harus tepat 0.01 ether");
        // Memastikan ketersediaan kuota tiket.
        require(totalSold < maxTickets, "Gagal: Tiket sudah habis terjual");
        // [Kontrol Akses] Memastikan pembeli belum memiliki tiket sebelumnya.
        require(!hasPurchased[msg.sender], "Gagal: Anda sudah membeli tiket (Maksimal 1 per wallet)");

        totalSold++;
        uint256 newTicketId = totalSold;

        // Mencatat data kepemilikan tiket ke dalam state contract.
        tickets[newTicketId] = Ticket({
            id: newTicketId,
            owner: msg.sender,
            isUsed: false
        });

        // Menandai bahwa address wallet ini telah membeli tiket.
        hasPurchased[msg.sender] = true;

        emit TicketPurchased(newTicketId, msg.sender);
    }

    /**
     * @dev Fungsi untuk mentransfer hak milik tiket (Akses: Pemilik Tiket).
     * [Anti-Double Spending] Memastikan pemilik lama kehilangan akses saat tiket pindah tangan.
     */
    function transferTicket(uint256 _ticketId, address _to) external {
        // [Otorisasi] Memastikan pengirim yang menjalankan fungsi ini adalah pemilik asli tiket.
        require(tickets[_ticketId].owner == msg.sender, "Gagal: Anda bukan pemilik tiket ini");
        // [Integritas State] Tiket yang sudah di-scan/dipakai tidak bisa ditransfer lagi.
        require(!tickets[_ticketId].isUsed, "Gagal: Tiket sudah digunakan, tidak dapat ditransfer");
        // [Kontrol Akses] Mencegah penumpukan tiket pada satu akun penerima.
        require(!hasPurchased[_to], "Gagal: Alamat penerima sudah memiliki tiket");
        // Validasi alamat (mencegah burning/kehilangan tiket secara tidak sengaja).
        require(_to != address(0), "Gagal: Alamat tujuan tidak valid");

        // [Pencabutan Hak / Non-repudiasi] Pemilik lama dihapus status kepemilikannya.
        hasPurchased[msg.sender] = false;

        // [Pemberian Hak] Pemilik baru dicatat dalam state.
        tickets[_ticketId].owner = _to;
        hasPurchased[_to] = true;

        emit TicketTransferred(_ticketId, msg.sender, _to);
    }

    /**
     * @dev Fungsi validasi tiket di pintu masuk konser (Akses: Hanya Admin).
     * [Anti-Replay Attack] Mengubah state isUsed agar tiket tidak bisa dipakai dua kali.
     */
    function validateTicket(uint256 _ticketId) external onlyAdmin {
        // Validasi batasan ID tiket.
        require(_ticketId > 0 && _ticketId <= totalSold, "Gagal: ID Tiket tidak valid");
        // [Integritas] Mengecek apakah tiket sudah pernah di-scan sebelumnya.
        require(!tickets[_ticketId].isUsed, "Peringatan: Tiket sudah digunakan sebelumnya (Potensi Replay Attack)");

        // Mengubah status tiket menjadi terpakai (mengunci tiket).
        tickets[_ticketId].isUsed = true;

        emit TicketValidated(_ticketId);
    }

    /**
     * @dev Fungsi untuk menarik dana hasil penjualan ke wallet admin (Akses: Hanya Admin).
     */
    function withdrawFunds() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "Gagal: Saldo smart contract kosong");
        
        // [Keamanan Dana] Transfer dana aman (safe transfer) ke akun admin.
        (bool success, ) = admin.call{value: balance}("");
        require(success, "Gagal: Penarikan dana error");
    }
}
