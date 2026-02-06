import { useState } from 'react';
import {
  useGetAllRelasi,
  useAddRelasi,
  useUpdateRelasi,
  useDeleteRelasi,
  useAddCatatanRelasi,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import type { RelasiPelayananMedis, CatatanInteraksi } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Building2, Mail, Phone, Edit, Trash2, MessageSquarePlus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';

export default function CRMTab() {
  const { data: relasi, isLoading } = useGetAllRelasi();
  const { data: isAdmin } = useIsCallerAdmin();
  const addRelasi = useAddRelasi();
  const updateRelasi = useUpdateRelasi();
  const deleteRelasi = useDeleteRelasi();
  const addCatatan = useAddCatatanRelasi();

  const [selectedRelasi, setSelectedRelasi] = useState<RelasiPelayananMedis | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    namaFasilitas: '',
    kontakUtama: '',
    email: '',
    statusKemitraan: 'aktif',
  });

  const [noteText, setNoteText] = useState('');

  const handleAddRelasi = async () => {
    const newRelasi: RelasiPelayananMedis = {
      id: BigInt(0),
      namaFasilitas: formData.namaFasilitas,
      kontakUtama: formData.kontakUtama,
      email: formData.email,
      statusKemitraan: formData.statusKemitraan,
      catatanInteraksi: [],
    };

    await addRelasi.mutateAsync(newRelasi);
    setIsAddDialogOpen(false);
    setFormData({
      namaFasilitas: '',
      kontakUtama: '',
      email: '',
      statusKemitraan: 'aktif',
    });
  };

  const handleUpdateRelasi = async () => {
    if (!selectedRelasi) return;

    const updatedRelasi: RelasiPelayananMedis = {
      ...selectedRelasi,
      namaFasilitas: formData.namaFasilitas,
      kontakUtama: formData.kontakUtama,
      email: formData.email,
      statusKemitraan: formData.statusKemitraan,
    };

    await updateRelasi.mutateAsync({ id: selectedRelasi.id, relasiBaru: updatedRelasi });
    setIsEditDialogOpen(false);
    setSelectedRelasi(null);
  };

  const handleDeleteRelasi = async () => {
    if (!selectedRelasi) return;
    await deleteRelasi.mutateAsync(selectedRelasi.id);
    setIsDeleteDialogOpen(false);
    setSelectedRelasi(null);
  };

  const handleAddNote = async () => {
    if (!selectedRelasi || !noteText.trim()) return;

    const catatan: CatatanInteraksi = {
      tanggal: BigInt(Date.now() * 1000000),
      isi: noteText,
      ditambahkanOleh: '' as any,
    };

    await addCatatan.mutateAsync({ id: selectedRelasi.id, catatan });
    setIsNoteDialogOpen(false);
    setNoteText('');
    setSelectedRelasi(null);
  };

  const openEditDialog = (rel: RelasiPelayananMedis) => {
    setSelectedRelasi(rel);
    setFormData({
      namaFasilitas: rel.namaFasilitas,
      kontakUtama: rel.kontakUtama,
      email: rel.email,
      statusKemitraan: rel.statusKemitraan,
    });
    setIsEditDialogOpen(true);
  };

  const openNoteDialog = (rel: RelasiPelayananMedis) => {
    setSelectedRelasi(rel);
    setIsNoteDialogOpen(true);
  };

  const openDeleteDialog = (rel: RelasiPelayananMedis) => {
    setSelectedRelasi(rel);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'default';
      case 'dalam negosiasi':
        return 'secondary';
      case 'nonaktif':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredRelasi = relasi?.filter((rel) =>
    rel.namaFasilitas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rel.kontakUtama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rel.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="CRM"
        description="Kelola hubungan dengan fasilitas pelayanan medis"
        action={
          isAdmin ? (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Tambah Relasi</span>
                  <span className="sm:hidden">Tambah</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Relasi Baru</DialogTitle>
                  <DialogDescription>Tambahkan fasilitas pelayanan medis baru</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="namaFasilitas">Nama Fasilitas</Label>
                    <Input
                      id="namaFasilitas"
                      value={formData.namaFasilitas}
                      onChange={(e) => setFormData({ ...formData, namaFasilitas: e.target.value })}
                      placeholder="RS Umum Jakarta"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="kontakUtama">Kontak Utama</Label>
                    <Input
                      id="kontakUtama"
                      value={formData.kontakUtama}
                      onChange={(e) => setFormData({ ...formData, kontakUtama: e.target.value })}
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="kontak@rumahsakit.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="statusKemitraan">Status Kemitraan</Label>
                    <Select
                      value={formData.statusKemitraan}
                      onValueChange={(value) => setFormData({ ...formData, statusKemitraan: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="dalam negosiasi">Dalam Negosiasi</SelectItem>
                        <SelectItem value="nonaktif">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleAddRelasi} disabled={addRelasi.isPending}>
                    {addRelasi.isPending ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Cari fasilitas, kontak, atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredRelasi && filteredRelasi.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRelasi.map((rel) => (
            <Card key={rel.id.toString()} className="border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2 min-w-0 flex-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="truncate">{rel.namaFasilitas}</span>
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(rel.statusKemitraan)} className="text-xs">
                      {rel.statusKemitraan}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{rel.kontakUtama}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{rel.email}</span>
                  </div>
                </div>

                {rel.catatanInteraksi.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium">Catatan ({rel.catatanInteraksi.length})</p>
                    <ScrollArea className="h-20 rounded-lg border bg-muted/30 p-2">
                      <div className="space-y-1.5">
                        {rel.catatanInteraksi.map((catatan, idx) => (
                          <div key={idx} className="text-xs">
                            <p className="text-muted-foreground">
                              {new Date(Number(catatan.tanggal) / 1000000).toLocaleDateString('id-ID')}
                            </p>
                            <p className="line-clamp-2">{catatan.isi}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => openNoteDialog(rel)}
                  >
                    <MessageSquarePlus className="mr-1.5 h-3.5 w-3.5" />
                    Catatan
                  </Button>
                  {isAdmin && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(rel)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(rel)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border">
          <CardContent className="p-10">
            <EmptyState
              icon={Building2}
              title="Belum ada relasi"
              description={isAdmin ? 'Tambahkan relasi baru untuk memulai' : 'Tidak ada data relasi'}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Relasi</DialogTitle>
            <DialogDescription>Perbarui informasi fasilitas</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-namaFasilitas">Nama Fasilitas</Label>
              <Input
                id="edit-namaFasilitas"
                value={formData.namaFasilitas}
                onChange={(e) => setFormData({ ...formData, namaFasilitas: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-kontakUtama">Kontak Utama</Label>
              <Input
                id="edit-kontakUtama"
                value={formData.kontakUtama}
                onChange={(e) => setFormData({ ...formData, kontakUtama: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-statusKemitraan">Status Kemitraan</Label>
              <Select
                value={formData.statusKemitraan}
                onValueChange={(value) => setFormData({ ...formData, statusKemitraan: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="dalam negosiasi">Dalam Negosiasi</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateRelasi} disabled={updateRelasi.isPending}>
              {updateRelasi.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Catatan Interaksi</DialogTitle>
            <DialogDescription>
              Catatan untuk {selectedRelasi?.namaFasilitas}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="note">Catatan</Label>
              <Textarea
                id="note"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Tulis catatan interaksi..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddNote} disabled={addCatatan.isPending || !noteText.trim()}>
              {addCatatan.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Relasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus relasi dengan {selectedRelasi?.namaFasilitas}? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRelasi} disabled={deleteRelasi.isPending}>
              {deleteRelasi.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
