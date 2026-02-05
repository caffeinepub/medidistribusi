import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  // Initialize access control state and mixin for authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    nama : Text;
    nomorKontak : Text;
  };

  public type JenisPeralatan = {
    nama : Text;
    kategori : Text;
    deskripsi : Text;
  };

  public type InventarisPeralatan = {
    id : Nat;
    jenis : JenisPeralatan;
    lokasi : Text;
    jumlah : Nat;
  };

  public type Pengiriman = {
    id : Nat;
    tujuan : Text;
    status : Text;
    peralatan : [InventarisPeralatan];
    waktuPengiriman : Int;
  };

  public type LogPergerakan = {
    id : Nat;
    peralatanId : Nat;
    jumlah : Nat;
    lokasiAsal : Text;
    lokasiTujuan : Text;
    waktu : Int;
    pengguna : Principal;
  };

  public type RumahSakitKlinik = {
    nama : Text;
    alamat : Text;
    kontak : Text;
  };

  public type LaporanRingkasan = {
    totalPengiriman : Nat;
    totalPeralatan : Nat;
    pengirimanPerTujuan : [(Text, Nat)];
    periodeAwal : Int;
    periodeAkhir : Int;
  };

  public type CatatanInteraksi = {
    tanggal : Int;
    isi : Text;
    ditambahkanOleh : Principal;
  };

  public type RelasiPelayananMedis = {
    id : Nat;
    namaFasilitas : Text;
    kontakUtama : Text;
    email : Text;
    statusKemitraan : Text;
    catatanInteraksi : [CatatanInteraksi];
  };

  // Stateful storage
  let pengguna = Map.empty<Principal, UserProfile>();
  let inventaris = Map.empty<Nat, InventarisPeralatan>();
  let pengiriman = Map.empty<Nat, Pengiriman>();
  let logPergerakan = Map.empty<Nat, LogPergerakan>();
  let rumahSakitKlinik = Map.empty<Text, RumahSakitKlinik>();
  let relasiPelayananMedis = Map.empty<Nat, RelasiPelayananMedis>();

  var nextInventarisId : Nat = 1;
  var nextPengirimanId : Nat = 1;
  var nextLogId : Nat = 1;
  var nextRelasiId : Nat = 1;

  // User profile methods
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna untuk melihat profil.");
    };
    pengguna.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profil : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna untuk menyimpan profil.");
    };
    pengguna.add(caller, profil);
  };

  public query ({ caller }) func getUserProfile(id : Principal) : async ?UserProfile {
    if (caller != id and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Belum otentikasi: Dapat melihat hanya profil milikmu sendiri");
    };
    pengguna.get(id);
  };

  // Inventory methods - Read operations (requires user permission)
  public query ({ caller }) func getInventarisById(id : Nat) : async InventarisPeralatan {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat inventaris");
    };
    switch (inventaris.get(id)) {
      case (null) { Runtime.trap("Peralatan tidak ditemukan") };
      case (?peralatan) { peralatan };
    };
  };

  public query ({ caller }) func getAllInventaris() : async [InventarisPeralatan] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat inventaris");
    };
    inventaris.values().toArray();
  };

  public query ({ caller }) func getInventarisByLocation(location : Text) : async [InventarisPeralatan] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat inventaris");
    };
    let filtered = inventaris.values().filter(
      func(item) { Text.equal(item.lokasi, location) }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getInventarisByCategory(category : Text) : async [InventarisPeralatan] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat inventaris");
    };
    let filtered = inventaris.values().filter(
      func(item) { Text.equal(item.jenis.kategori, category) }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getLowStockItems(threshold : Nat) : async [InventarisPeralatan] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat inventaris");
    };
    let filtered = inventaris.values().filter(
      func(item) { item.jumlah <= threshold }
    );
    filtered.toArray();
  };

  // Inventory methods - Write operations (requires user permission - warehouse staff)
  public shared ({ caller }) func addInventaris(jenis : JenisPeralatan, lokasi : Text, jumlah : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya staf gudang dapat menambah inventaris");
    };
    let id = nextInventarisId;
    let item : InventarisPeralatan = {
      id = id;
      jenis = jenis;
      lokasi = lokasi;
      jumlah = jumlah;
    };
    inventaris.add(id, item);
    nextInventarisId += 1;
    id;
  };

  public shared ({ caller }) func updateInventarisQuantity(id : Nat, jumlahBaru : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya staf gudang dapat memperbarui inventaris");
    };
    switch (inventaris.get(id)) {
      case (null) { Runtime.trap("Peralatan tidak ditemukan") };
      case (?item) {
        let updated : InventarisPeralatan = {
          id = item.id;
          jenis = item.jenis;
          lokasi = item.lokasi;
          jumlah = jumlahBaru;
        };
        inventaris.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteInventaris(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Belum otentikasi: Hanya admin dapat menghapus inventaris");
    };
    inventaris.remove(id);
  };

  // Movement logging methods - Read operations (requires user permission)
  public query ({ caller }) func getAllLogPergerakan() : async [LogPergerakan] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat log pergerakan");
    };
    logPergerakan.values().toArray();
  };

  public query ({ caller }) func getLogByEquipmentId(peralatanId : Nat) : async [LogPergerakan] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat log pergerakan");
    };
    let filtered = logPergerakan.values().filter(
      func(item) { item.peralatanId == peralatanId }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getLogByDateRange(mulai : Int, akhir : Int) : async [LogPergerakan] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat log pergerakan");
    };
    let filtered = logPergerakan.values().filter(
      func(item) { item.waktu >= mulai and item.waktu <= akhir }
    );
    filtered.toArray();
  };

  // Movement logging methods - Write operations (requires user permission - warehouse staff)
  public shared ({ caller }) func logPergerakanPeralatan(
    peralatanId : Nat,
    jumlah : Nat,
    lokasiAsal : Text,
    lokasiTujuan : Text
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya staf gudang dapat mencatat pergerakan");
    };

    // Verify equipment exists and has sufficient quantity
    switch (inventaris.get(peralatanId)) {
      case (null) { Runtime.trap("Peralatan tidak ditemukan") };
      case (?item) {
        if (not Text.equal(item.lokasi, lokasiAsal)) {
          Runtime.trap("Lokasi asal tidak sesuai dengan lokasi peralatan");
        };
        if (item.jumlah < jumlah) {
          Runtime.trap("Jumlah tidak mencukupi untuk pergerakan");
        };

        // Update inventory quantity and location
        let updatedItem : InventarisPeralatan = {
          id = item.id;
          jenis = item.jenis;
          lokasi = lokasiTujuan;
          jumlah = item.jumlah - jumlah;
        };
        inventaris.add(peralatanId, updatedItem);
      };
    };

    let id = nextLogId;
    let log : LogPergerakan = {
      id = id;
      peralatanId = peralatanId;
      jumlah = jumlah;
      lokasiAsal = lokasiAsal;
      lokasiTujuan = lokasiTujuan;
      waktu = Time.now();
      pengguna = caller;
    };
    logPergerakan.add(id, log);
    nextLogId += 1;
    id;
  };

  // Shipment methods - Read operations (requires user permission)
  public query ({ caller }) func getAllPengiriman() : async [Pengiriman] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat pengiriman");
    };
    pengiriman.values().toArray();
  };

  public query ({ caller }) func getShipmentById(id : Nat) : async Pengiriman {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat pengiriman");
    };
    switch (pengiriman.get(id)) {
      case (null) { Runtime.trap("Pengiriman tidak ditemukan") };
      case (?shipment) { shipment };
    };
  };

  public query ({ caller }) func getPengirimanByStatus(status : Text) : async [Pengiriman] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat pengiriman");
    };
    let filtered = pengiriman.values().filter(
      func(item) { Text.equal(item.status, status) }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getPengirimanByDestination(tujuan : Text) : async [Pengiriman] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat pengiriman");
    };
    let filtered = pengiriman.values().filter(
      func(item) { Text.equal(item.tujuan, tujuan) }
    );
    filtered.toArray();
  };

  // Shipment methods - Write operations (requires user permission - logistics)
  public shared ({ caller }) func createPengiriman(
    tujuan : Text,
    peralatanIds : [Nat]
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya logistik dapat membuat pengiriman");
    };

    // Collect equipment items and update inventory
    let peralatanArray = peralatanIds.map(
      func(id) {
        switch (inventaris.get(id)) {
          case (null) { null };
          case (?item) {
            // Reduce inventory quantity
            if (item.jumlah > 0) {
              let updated : InventarisPeralatan = {
                id = item.id;
                jenis = item.jenis;
                lokasi = item.lokasi;
                jumlah = item.jumlah - 1;
              };
              inventaris.add(id, updated);
              ?item;
            } else {
              null;
            };
          };
        };
      }
    ).filter(
      func(item) {
        switch (item) {
          case (null) { false };
          case (_) { true };
        };
      }
    ).map(
      func(item) {
        switch (item) {
          case (?val) { val };
          case (null) { Runtime.trap("Unexpected null value") };
        };
      }
    );

    let id = nextPengirimanId;
    let shipment : Pengiriman = {
      id = id;
      tujuan = tujuan;
      status = "pending";
      peralatan = peralatanArray;
      waktuPengiriman = Time.now();
    };
    pengiriman.add(id, shipment);
    nextPengirimanId += 1;
    id;
  };

  public shared ({ caller }) func updatePengirimanStatus(id : Nat, statusBaru : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya logistik dapat memperbarui status pengiriman");
    };
    switch (pengiriman.get(id)) {
      case (null) { Runtime.trap("Pengiriman tidak ditemukan") };
      case (?shipment) {
        let updated : Pengiriman = {
          id = shipment.id;
          tujuan = shipment.tujuan;
          status = statusBaru;
          peralatan = shipment.peralatan;
          waktuPengiriman = shipment.waktuPengiriman;
        };
        pengiriman.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deletePengiriman(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Belum otentikasi: Hanya admin dapat menghapus pengiriman");
    };
    pengiriman.remove(id);
  };

  // Hospital/Clinic methods - Read operations (requires user permission)
  public query ({ caller }) func getAllRumahSakitKlinik() : async [RumahSakitKlinik] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat rumah sakit/klinik");
    };
    rumahSakitKlinik.values().toArray();
  };

  public query ({ caller }) func getRumahSakitKlinikByName(nama : Text) : async RumahSakitKlinik {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat rumah sakit/klinik");
    };
    switch (rumahSakitKlinik.get(nama)) {
      case (null) { Runtime.trap("Rumah sakit/klinik tidak ditemukan") };
      case (?facility) { facility };
    };
  };

  // Hospital/Clinic methods - Write operations (admin only)
  public shared ({ caller }) func addRumahSakitKlinik(facility : RumahSakitKlinik) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Belum otentikasi: Hanya admin dapat menambah rumah sakit/klinik");
    };
    rumahSakitKlinik.add(facility.nama, facility);
  };

  public shared ({ caller }) func updateRumahSakitKlinik(nama : Text, facility : RumahSakitKlinik) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Belum otentikasi: Hanya admin dapat memperbarui rumah sakit/klinik");
    };
    rumahSakitKlinik.add(nama, facility);
  };

  public shared ({ caller }) func deleteRumahSakitKlinik(nama : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Belum otentikasi: Hanya admin dapat menghapus rumah sakit/klinik");
    };
    rumahSakitKlinik.remove(nama);
  };

  // Reporting methods (admin only)
  public query ({ caller }) func generateLaporanRingkasan(
    periodeAwal : Int,
    periodeAkhir : Int
  ) : async LaporanRingkasan {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Belum otentikasi: Hanya admin dapat membuat laporan");
    };

    let filteredShipments = pengiriman.values().filter(
      func(item) {
        item.waktuPengiriman >= periodeAwal and item.waktuPengiriman <= periodeAkhir
      }
    );

    var totalPengiriman : Nat = 0;
    var totalPeralatan : Nat = 0;
    let tujuanMap = Map.empty<Text, Nat>();

    for (shipment in filteredShipments) {
      totalPengiriman += 1;
      totalPeralatan += shipment.peralatan.size();

      let currentCount = switch (tujuanMap.get(shipment.tujuan)) {
        case (null) { 0 };
        case (?count) { count };
      };
      tujuanMap.add(shipment.tujuan, currentCount + 1);
    };

    let pengirimanPerTujuan = tujuanMap.entries().map(
      func(entry) { entry }
    ).toArray();

    {
      totalPengiriman = totalPengiriman;
      totalPeralatan = totalPeralatan;
      pengirimanPerTujuan = pengirimanPerTujuan;
      periodeAwal = periodeAwal;
      periodeAkhir = periodeAkhir;
    };
  };

  public query ({ caller }) func generateLaporanByHospital(
    namaRumahSakit : Text,
    periodeAwal : Int,
    periodeAkhir : Int
  ) : async [Pengiriman] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Belum otentikasi: Hanya admin dapat membuat laporan");
    };

    let filtered = pengiriman.values().filter(
      func(item) {
        Text.equal(item.tujuan, namaRumahSakit) and
        item.waktuPengiriman >= periodeAwal and
        item.waktuPengiriman <= periodeAkhir
      }
    );
    filtered.toArray();
  };

  // Dashboard data (requires user permission)
  public query ({ caller }) func getDashboardData() : async {
    totalInventaris : Nat;
    lowStockCount : Nat;
    pendingShipments : Nat;
    deliveredShipments : Nat;
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat dashboard");
    };

    let totalInventaris = inventaris.size();

    let lowStockItems = inventaris.values().filter(
      func(item) { item.jumlah <= 10 }
    );
    let lowStockCount = lowStockItems.size();

    let pendingShips = pengiriman.values().filter(
      func(item) { Text.equal(item.status, "pending") }
    );
    let pendingShipments = pendingShips.size();

    let deliveredShips = pengiriman.values().filter(
      func(item) { Text.equal(item.status, "delivered") }
    );
    let deliveredShipments = deliveredShips.size();

    {
      totalInventaris = totalInventaris;
      lowStockCount = lowStockCount;
      pendingShipments = pendingShipments;
      deliveredShipments = deliveredShipments;
    };
  };

  // --- CRM MODULE ---
  public query ({ caller }) func getAllRelasi() : async [RelasiPelayananMedis] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat data CRM");
    };
    relasiPelayananMedis.values().toArray();
  };

  public query ({ caller }) func getRelasiById(id : Nat) : async RelasiPelayananMedis {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat melihat data CRM");
    };
    switch (relasiPelayananMedis.get(id)) {
      case (null) { Runtime.trap("Relasi tidak ditemukan") };
      case (?relasi) { relasi };
    };
  };

  public shared ({ caller }) func addRelasi(relasi : RelasiPelayananMedis) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Belum otentikasi: Hanya admin dapat menambah relasi CRM");
    };

    let id = nextRelasiId;
    let newRelasi : RelasiPelayananMedis = {
      id = id;
      namaFasilitas = relasi.namaFasilitas;
      kontakUtama = relasi.kontakUtama;
      email = relasi.email;
      statusKemitraan = relasi.statusKemitraan;
      catatanInteraksi = [];
    };
    relasiPelayananMedis.add(id, newRelasi);
    nextRelasiId += 1;
    id;
  };

  public shared ({ caller }) func updateRelasi(id : Nat, relasiBaru : RelasiPelayananMedis) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Belum otentikasi: Hanya admin dapat memperbarui relasi CRM");
    };
    switch (relasiPelayananMedis.get(id)) {
      case (null) { Runtime.trap("Relasi tidak ditemukan") };
      case (?oldRelasi) {
        let updatedRelasi : RelasiPelayananMedis = {
          id = oldRelasi.id;
          namaFasilitas = relasiBaru.namaFasilitas;
          kontakUtama = relasiBaru.kontakUtama;
          email = relasiBaru.email;
          statusKemitraan = relasiBaru.statusKemitraan;
          catatanInteraksi = oldRelasi.catatanInteraksi;
        };
        relasiPelayananMedis.add(id, updatedRelasi);
      };
    };
  };

  public shared ({ caller }) func deleteRelasi(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Belum otentikasi: Hanya admin dapat menghapus relasi CRM");
    };
    relasiPelayananMedis.remove(id);
  };

  public shared ({ caller }) func addCatatanRelasi(id : Nat, catatan : CatatanInteraksi) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Belum otentikasi: Hanya pengguna dapat menambah catatan interaksi CRM");
    };
    switch (relasiPelayananMedis.get(id)) {
      case (null) { Runtime.trap("Relasi tidak ditemukan") };
      case (?relasi) {
        let newCatatan : CatatanInteraksi = {
          tanggal = catatan.tanggal;
          isi = catatan.isi;
          ditambahkanOleh = caller;
        };
        let newCatatanArray = relasi.catatanInteraksi.concat([newCatatan]);
        let updatedRelasi : RelasiPelayananMedis = {
          id = relasi.id;
          namaFasilitas = relasi.namaFasilitas;
          kontakUtama = relasi.kontakUtama;
          email = relasi.email;
          statusKemitraan = relasi.statusKemitraan;
          catatanInteraksi = newCatatanArray;
        };
        relasiPelayananMedis.add(id, updatedRelasi);
      };
    };
  };
};
