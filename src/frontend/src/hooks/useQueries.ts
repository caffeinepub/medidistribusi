import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  InventarisPeralatan,
  JenisPeralatan,
  Pengiriman,
  LogPergerakan,
  RumahSakitKlinik,
  LaporanRingkasan,
  RelasiPelayananMedis,
  CatatanInteraksi,
} from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profil berhasil disimpan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menyimpan profil: ${error.message}`);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Dashboard Query
export function useGetDashboardData() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardData();
    },
    enabled: !!actor && !isFetching,
  });
}

// Inventory Queries
export function useGetAllInventaris() {
  const { actor, isFetching } = useActor();

  return useQuery<InventarisPeralatan[]>({
    queryKey: ['inventaris'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInventaris();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLowStockItems(threshold: bigint = BigInt(10)) {
  const { actor, isFetching } = useActor();

  return useQuery<InventarisPeralatan[]>({
    queryKey: ['lowStockItems', threshold.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLowStockItems(threshold);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddInventaris() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { jenis: JenisPeralatan; lokasi: string; jumlah: bigint }) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.addInventaris(data.jenis, data.lokasi, data.jumlah);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventaris'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      toast.success('Inventaris berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambah inventaris: ${error.message}`);
    },
  });
}

export function useUpdateInventarisQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; jumlahBaru: bigint }) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.updateInventarisQuantity(data.id, data.jumlahBaru);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventaris'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      toast.success('Jumlah inventaris berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui inventaris: ${error.message}`);
    },
  });
}

// Shipment Queries
export function useGetAllPengiriman() {
  const { actor, isFetching } = useActor();

  return useQuery<Pengiriman[]>({
    queryKey: ['pengiriman'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPengiriman();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPengirimanByStatus(status: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Pengiriman[]>({
    queryKey: ['pengiriman', 'status', status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPengirimanByStatus(status);
    },
    enabled: !!actor && !isFetching && !!status,
  });
}

export function useCreatePengiriman() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { tujuan: string; peralatanIds: bigint[] }) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.createPengiriman(data.tujuan, data.peralatanIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengiriman'] });
      queryClient.invalidateQueries({ queryKey: ['inventaris'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      toast.success('Pengiriman berhasil dibuat');
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat pengiriman: ${error.message}`);
    },
  });
}

export function useUpdatePengirimanStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; statusBaru: string }) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.updatePengirimanStatus(data.id, data.statusBaru);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengiriman'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      toast.success('Status pengiriman berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui status: ${error.message}`);
    },
  });
}

// Movement Log Queries
export function useGetAllLogPergerakan() {
  const { actor, isFetching } = useActor();

  return useQuery<LogPergerakan[]>({
    queryKey: ['logPergerakan'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLogPergerakan();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogPergerakanPeralatan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      peralatanId: bigint;
      jumlah: bigint;
      lokasiAsal: string;
      lokasiTujuan: string;
    }) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.logPergerakanPeralatan(
        data.peralatanId,
        data.jumlah,
        data.lokasiAsal,
        data.lokasiTujuan
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logPergerakan'] });
      queryClient.invalidateQueries({ queryKey: ['inventaris'] });
      toast.success('Pergerakan peralatan berhasil dicatat');
    },
    onError: (error: Error) => {
      toast.error(`Gagal mencatat pergerakan: ${error.message}`);
    },
  });
}

// Hospital/Clinic Queries
export function useGetAllRumahSakitKlinik() {
  const { actor, isFetching } = useActor();

  return useQuery<RumahSakitKlinik[]>({
    queryKey: ['rumahSakitKlinik'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRumahSakitKlinik();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRumahSakitKlinik() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (facility: RumahSakitKlinik) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.addRumahSakitKlinik(facility);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rumahSakitKlinik'] });
      toast.success('Rumah sakit/klinik berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambah rumah sakit/klinik: ${error.message}`);
    },
  });
}

// Report Queries
export function useGenerateLaporanRingkasan() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: { periodeAwal: bigint; periodeAkhir: bigint }) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.generateLaporanRingkasan(data.periodeAwal, data.periodeAkhir);
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat laporan: ${error.message}`);
    },
  });
}

export function useGenerateLaporanByHospital() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: {
      namaRumahSakit: string;
      periodeAwal: bigint;
      periodeAkhir: bigint;
    }) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.generateLaporanByHospital(
        data.namaRumahSakit,
        data.periodeAwal,
        data.periodeAkhir
      );
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat laporan: ${error.message}`);
    },
  });
}

// CRM Queries
export function useGetAllRelasi() {
  const { actor, isFetching } = useActor();

  return useQuery<RelasiPelayananMedis[]>({
    queryKey: ['relasi'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRelasi();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRelasiById(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<RelasiPelayananMedis | null>({
    queryKey: ['relasi', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getRelasiById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAddRelasi() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relasi: RelasiPelayananMedis) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.addRelasi(relasi);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relasi'] });
      toast.success('Relasi berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambah relasi: ${error.message}`);
    },
  });
}

export function useUpdateRelasi() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; relasiBaru: RelasiPelayananMedis }) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.updateRelasi(data.id, data.relasiBaru);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relasi'] });
      toast.success('Relasi berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui relasi: ${error.message}`);
    },
  });
}

export function useDeleteRelasi() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.deleteRelasi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relasi'] });
      toast.success('Relasi berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus relasi: ${error.message}`);
    },
  });
}

export function useAddCatatanRelasi() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; catatan: CatatanInteraksi }) => {
      if (!actor) throw new Error('Actor tidak tersedia');
      return actor.addCatatanRelasi(data.id, data.catatan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relasi'] });
      toast.success('Catatan berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambah catatan: ${error.message}`);
    },
  });
}
