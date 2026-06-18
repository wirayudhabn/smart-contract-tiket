// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ============================================================
 *  TicketBlock — REVISI
 *  Perubahan dari versi sebelumnya:
 *   1. Tambah event di buyTicket, transferTicket, validateTicket
 *      -> membuat riwayat kepemilikan & status tiket bisa
 *         di-query off-chain secara efisien (audit trail asli),
 *         bukan cuma state saat ini.
 *   2. Tambah fungsi withdraw() (onlyAdmin) supaya ETH hasil
 *      penjualan tiket tidak terkunci permanen di kontrak.
 *   3. Tambah validasi rentang _ticketId di transferTicket,
 *      konsisten dengan validateTicket (sebelumnya aman secara
 *      kebetulan, sekarang aman secara eksplisit).
 *  Tidak ada logika bisnis inti yang diubah — semua require()
 *  asli dipertahankan.
 * ============================================================
 */
contract TicketBlock {
    address public admin;
    uint256 public ticketPrice = 0.01 ether; // Simulasi harga dengan Sepolia ETH
    uint256 public maxTickets = 50;
    uint256 public totalSold = 0;

    struct Ticket {
        uint256 id;
        address owner;
        bool isUsed;
    }

    mapping(uint256 => Ticket) public tickets;
    mapping(address => bool) public hasPurchased; // Batasan 1 akun = 1 tiket (Anti-Calo)

    // ============================================================
    //  EVENTS — Audit Trail On-Chain
    //  Tanpa event, riwayat transfer/validasi hanya bisa direkonstruksi
    //  dengan replay seluruh transaksi sejak genesis. Event membuat
    //  riwayat itu murah & efisien untuk diquery (mis. lewat Etherscan
    //  atau frontend), dan inilah yang sebenarnya memberi sistem ini
    //  sifat "audit trail" yang ditonjolkan di UI.
    // ============================================================
    event TicketPurchased(uint256 indexed ticketId, address indexed buyer, uint256 pricePaid);
    event TicketTransferred(uint256 indexed ticketId, address indexed from, address indexed to);
    event TicketValidated(uint256 indexed ticketId, address indexed validatedBy);
    event FundsWithdrawn(address indexed to, uint256 amount);

    // Pengaman Kontrol Akses: Hanya komputer Admin yang boleh membuka fungsi tertentu
    modifier onlyAdmin() {
        require(msg.sender == admin, "Akses ditolak: Anda bukan Admin resmi!");
        _;
    }

    constructor() {
        admin = msg.sender; // Siapa yang deploy otomatis jadi Promotor/Admin
    }

    // 1. VERIFIKASI AWAL: Admin ke Pembeli Pertama
    function buyTicket() public payable {
        require(totalSold < maxTickets, "Tiket sudah habis!");
        require(!hasPurchased[msg.sender], "Anda sudah memiliki tiket!");
        require(msg.value == ticketPrice, "Jumlah ETH tidak sesuai harga tiket!");

        totalSold++;
        tickets[totalSold] = Ticket({
            id: totalSold,
            owner: msg.sender,
            isUsed: false
        });
        hasPurchased[msg.sender] = true;

        emit TicketPurchased(totalSold, msg.sender, msg.value);
    }

    // 2. VERIFIKASI TENGAH: Transfer Kepemilikan (Solusi dari Dosen)
    function transferTicket(uint256 _ticketId, address _to) public {
        require(_ticketId > 0 && _ticketId <= totalSold, "Tiket tidak terdaftar!");
        require(tickets[_ticketId].owner == msg.sender, "Anda bukan pemilik sah tiket ini!");
        require(!tickets[_ticketId].isUsed, "Tiket sudah hangus/terpakai!");
        require(_to != address(0), "Alamat MetaMask tujuan tidak valid!");
        require(!hasPurchased[_to], "Penerima sudah memiliki tiket konser lain!");

        // Eksekusi perpindahan data kepemilikan secara permanen
        tickets[_ticketId].owner = _to;
        hasPurchased[msg.sender] = false; // Pemilik lama kehilangan hak akses
        hasPurchased[_to] = true;         // Pembeli baru mendapatkan hak akses

        emit TicketTransferred(_ticketId, msg.sender, _to);
    }

    // 3. VERIFIKASI AKHIR: Gerbang Pintu Masuk Konser
    function validateTicket(uint256 _ticketId) public onlyAdmin {
        require(_ticketId > 0 && _ticketId <= totalSold, "Tiket tidak terdaftar!");
        require(!tickets[_ticketId].isUsed, "Peringatan: Tiket ini sudah pernah dipakai!");

        tickets[_ticketId].isUsed = true; // Status terkunci, tidak bisa dipakai replay attack

        emit TicketValidated(_ticketId, msg.sender);
    }

    // 4. PENARIKAN DANA: Hanya Admin yang bisa menarik hasil penjualan tiket
    function withdraw() public onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "Tidak ada saldo untuk ditarik!");

        (bool success, ) = payable(admin).call{value: balance}("");
        require(success, "Penarikan ETH gagal!");

        emit FundsWithdrawn(admin, balance);
    }
}
