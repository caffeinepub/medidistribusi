import { useState } from 'react';
import { useGetAllRumahSakitKlinik, useAddRumahSakitKlinik } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Building2, MapPin, Phone } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';

export default function FacilityTab() {
  const { data: facilities, isLoading } = useGetAllRumahSakitKlinik();
  const addFacility = useAddRumahSakitKlinik();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFacility, setNewFacility] = useState({
    nama: '',
    alamat: '',
    kontak: '',
  });

  const handleAddFacility = () => {
    if (newFacility.nama && newFacility.alamat && newFacility.kontak) {
      addFacility.mutate(newFacility, {
        onSuccess: () => {
          setDialogOpen(false);
          setNewFacility({ nama: '', alamat: '', kontak: '' });
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fasilitas Kesehatan"
        description="Kelola rumah sakit dan klinik tujuan"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Fasilitas</span>
                <span className="sm:hidden">Tambah</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Fasilitas Kesehatan</DialogTitle>
                <DialogDescription>Masukkan detail rumah sakit atau klinik</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nama">Nama Fasilitas</Label>
                  <Input
                    id="nama"
                    placeholder="Contoh: RS Umum Jakarta"
                    value={newFacility.nama}
                    onChange={(e) => setNewFacility({ ...newFacility, nama: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Textarea
                    id="alamat"
                    placeholder="Alamat lengkap fasilitas"
                    value={newFacility.alamat}
                    onChange={(e) => setNewFacility({ ...newFacility, alamat: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="kontak">Nomor Kontak</Label>
                  <Input
                    id="kontak"
                    placeholder="Nomor telepon"
                    value={newFacility.kontak}
                    onChange={(e) => setNewFacility({ ...newFacility, kontak: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddFacility} disabled={addFacility.isPending} className="w-full">
                  {addFacility.isPending ? 'Menambahkan...' : 'Tambah Fasilitas'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border">
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : facilities && facilities.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <Card key={facility.nama} className="border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-2">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{facility.nama}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground line-clamp-2">{facility.alamat}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-muted-foreground truncate">{facility.kontak}</p>
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
              title="Belum ada fasilitas kesehatan"
              description="Tambahkan fasilitas kesehatan pertama Anda"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
