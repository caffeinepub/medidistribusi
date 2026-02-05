import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfileSetupModal() {
  const [nama, setNama] = useState('');
  const [nomorKontak, setNomorKontak] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nama.trim() && nomorKontak.trim()) {
      saveProfile.mutate({ nama: nama.trim(), nomorKontak: nomorKontak.trim() });
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Selamat Datang!</DialogTitle>
          <DialogDescription>
            Silakan lengkapi profil Anda untuk melanjutkan
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input
              id="nama"
              placeholder="Masukkan nama lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kontak">Nomor Kontak</Label>
            <Input
              id="kontak"
              placeholder="Masukkan nomor telepon"
              value={nomorKontak}
              onChange={(e) => setNomorKontak(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
