import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CatatanInteraksi {
    isi: string;
    tanggal: bigint;
    ditambahkanOleh: Principal;
}
export interface Pengiriman {
    id: bigint;
    tujuan: string;
    status: string;
    waktuPengiriman: bigint;
    peralatan: Array<InventarisPeralatan>;
}
export interface RumahSakitKlinik {
    alamat: string;
    nama: string;
    kontak: string;
}
export interface LaporanRingkasan {
    totalPengiriman: bigint;
    totalPeralatan: bigint;
    periodeAkhir: bigint;
    pengirimanPerTujuan: Array<[string, bigint]>;
    periodeAwal: bigint;
}
export interface RelasiPelayananMedis {
    id: bigint;
    namaFasilitas: string;
    catatanInteraksi: Array<CatatanInteraksi>;
    email: string;
    kontakUtama: string;
    statusKemitraan: string;
}
export interface LogPergerakan {
    id: bigint;
    jumlah: bigint;
    peralatanId: bigint;
    waktu: bigint;
    lokasiAsal: string;
    lokasiTujuan: string;
    pengguna: Principal;
}
export interface JenisPeralatan {
    nama: string;
    deskripsi: string;
    kategori: string;
}
export interface UserProfile {
    nomorKontak: string;
    nama: string;
}
export interface InventarisPeralatan {
    id: bigint;
    jumlah: bigint;
    jenis: JenisPeralatan;
    lokasi: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCatatanRelasi(id: bigint, catatan: CatatanInteraksi): Promise<void>;
    addInventaris(jenis: JenisPeralatan, lokasi: string, jumlah: bigint): Promise<bigint>;
    addRelasi(relasi: RelasiPelayananMedis): Promise<bigint>;
    addRumahSakitKlinik(facility: RumahSakitKlinik): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPengiriman(tujuan: string, peralatanIds: Array<bigint>): Promise<bigint>;
    deleteInventaris(id: bigint): Promise<void>;
    deletePengiriman(id: bigint): Promise<void>;
    deleteRelasi(id: bigint): Promise<void>;
    deleteRumahSakitKlinik(nama: string): Promise<void>;
    generateLaporanByHospital(namaRumahSakit: string, periodeAwal: bigint, periodeAkhir: bigint): Promise<Array<Pengiriman>>;
    generateLaporanRingkasan(periodeAwal: bigint, periodeAkhir: bigint): Promise<LaporanRingkasan>;
    getAllInventaris(): Promise<Array<InventarisPeralatan>>;
    getAllLogPergerakan(): Promise<Array<LogPergerakan>>;
    getAllPengiriman(): Promise<Array<Pengiriman>>;
    getAllRelasi(): Promise<Array<RelasiPelayananMedis>>;
    getAllRumahSakitKlinik(): Promise<Array<RumahSakitKlinik>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardData(): Promise<{
        pendingShipments: bigint;
        totalInventaris: bigint;
        lowStockCount: bigint;
        deliveredShipments: bigint;
    }>;
    getInventarisByCategory(category: string): Promise<Array<InventarisPeralatan>>;
    getInventarisById(id: bigint): Promise<InventarisPeralatan>;
    getInventarisByLocation(location: string): Promise<Array<InventarisPeralatan>>;
    getLogByDateRange(mulai: bigint, akhir: bigint): Promise<Array<LogPergerakan>>;
    getLogByEquipmentId(peralatanId: bigint): Promise<Array<LogPergerakan>>;
    getLowStockItems(threshold: bigint): Promise<Array<InventarisPeralatan>>;
    getPengirimanByDestination(tujuan: string): Promise<Array<Pengiriman>>;
    getPengirimanByStatus(status: string): Promise<Array<Pengiriman>>;
    getRelasiById(id: bigint): Promise<RelasiPelayananMedis>;
    getRumahSakitKlinikByName(nama: string): Promise<RumahSakitKlinik>;
    getShipmentById(id: bigint): Promise<Pengiriman>;
    getUserProfile(id: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logPergerakanPeralatan(peralatanId: bigint, jumlah: bigint, lokasiAsal: string, lokasiTujuan: string): Promise<bigint>;
    saveCallerUserProfile(profil: UserProfile): Promise<void>;
    updateInventarisQuantity(id: bigint, jumlahBaru: bigint): Promise<void>;
    updatePengirimanStatus(id: bigint, statusBaru: string): Promise<void>;
    updateRelasi(id: bigint, relasiBaru: RelasiPelayananMedis): Promise<void>;
    updateRumahSakitKlinik(nama: string, facility: RumahSakitKlinik): Promise<void>;
}
