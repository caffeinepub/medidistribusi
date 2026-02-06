import { useState } from 'react';
import { useGetAllInventaris, useAddInventaris, useUpdateInventarisQuantity } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Search, Package } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';

export default function InventoryTab() {
  const { data: inventaris, isLoading } = useGetAllInventaris();
  const addInventaris = useAddInventaris();
  const updateQuantity = useUpdateInventarisQuantity();

  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [newItem, setNewItem] = useState({
    nama: '',
    kategori: '',
    deskripsi: '',
    lokasi: '',
    jumlah: '',
  });

  const [newQuantity, setNewQuantity] = useState('');

  const filteredInventaris = inventaris?.filter((item) =>
    item.jenis.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jenis.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddInventaris = () => {
    if (newItem.nama && newItem.kategori && newItem.lokasi && newItem.jumlah) {
      addInventaris.mutate(
        {
          jenis: {
            nama: newItem.nama,
            kategori: newItem.kategori,
            deskripsi: newItem.deskripsi,
          },
          lokasi: newItem.lokasi,
          jumlah: BigInt(newItem.jumlah),
        },
        {
          onSuccess: () => {
            setAddDialogOpen(false);
            setNewItem({ nama: '', kategori: '', deskripsi: '', lokasi: '', jumlah: '' });
          },
        }
      );
    }
  };

  const handleUpdateQuantity = () => {
    if (selectedItem && newQuantity) {
      updateQuantity.mutate(
        {
          id: selectedItem.id,
          jumlahBaru: BigInt(newQuantity),
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setSelectedItem(null);
            setNewQuantity('');
          },
        }
      );
    }
  };

  const getStockBadge = (jumlah: bigint) => {
    const qty = Number(jumlah);
    if (qty === 0) return <Badge variant="destructive">Habis</Badge>;
    if (qty <= 10) return <Badge variant="outline" className="border-destructive text-destructive">Rendah</Badge>;
    return <Badge variant="outline" className="border-success text-success">Normal</Badge>;
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventaris"
        description="Kelola stok peralatan kesehatan"
        action={
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Inventaris</span>
                <span className="sm:hidden">Tambah</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Inventaris Baru</DialogTitle>
                <DialogDescription>Masukkan detail peralatan kesehatan</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nama">Nama Peralatan</Label>
                  <Input
                    id="nama"
                    placeholder="Contoh: Masker N95"
                    value={newItem.nama}
                    onChange={(e) => setNewItem({ ...newItem, nama: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="kategori">Kategori</Label>
                  <Input
                    id="kategori"
                    placeholder="Contoh: APD"
                    value={newItem.kategori}
                    onChange={(e) => setNewItem({ ...newItem, kategori: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    placeholder="Deskripsi peralatan"
                    value={newItem.deskripsi}
                    onChange={(e) => setNewItem({ ...newItem, deskripsi: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lokasi">Lokasi</Label>
                  <Input
                    id="lokasi"
                    placeholder="Contoh: Gudang Pusat"
                    value={newItem.lokasi}
                    onChange={(e) => setNewItem({ ...newItem, lokasi: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jumlah">Jumlah</Label>
                  <Input
                    id="jumlah"
                    type="number"
                    placeholder="0"
                    value={newItem.jumlah}
                    onChange={(e) => setNewItem({ ...newItem, jumlah: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddInventaris} disabled={addInventaris.isPending} className="w-full">
                  {addInventaris.isPending ? 'Menambahkan...' : 'Tambah Inventaris'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="border">
        <CardContent className="p-4">
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari peralatan, kategori, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredInventaris && filteredInventaris.length > 0 ? (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Nama Peralatan</TableHead>
                    <TableHead className="min-w-[100px]">Kategori</TableHead>
                    <TableHead className="min-w-[120px]">Lokasi</TableHead>
                    <TableHead className="min-w-[80px]">Jumlah</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="text-right min-w-[60px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventaris.map((item) => (
                    <TableRow key={item.id.toString()}>
                      <TableCell className="font-medium">{item.jenis.nama}</TableCell>
                      <TableCell>{item.jenis.kategori}</TableCell>
                      <TableCell>{item.lokasi}</TableCell>
                      <TableCell>{item.jumlah.toString()}</TableCell>
                      <TableCell>{getStockBadge(item.jumlah)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setNewQuantity(item.jumlah.toString());
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title={searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada inventaris'}
              description={searchTerm ? 'Coba kata kunci lain' : 'Tambahkan inventaris pertama Anda'}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Perbarui Jumlah</DialogTitle>
            <DialogDescription>
              {selectedItem?.jenis.nama} - {selectedItem?.lokasi}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="newQuantity">Jumlah Baru</Label>
              <Input
                id="newQuantity"
                type="number"
                placeholder="0"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateQuantity} disabled={updateQuantity.isPending} className="w-full">
              {updateQuantity.isPending ? 'Memperbarui...' : 'Perbarui Jumlah'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
