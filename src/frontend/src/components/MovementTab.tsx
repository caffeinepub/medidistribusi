import { useState } from 'react';
import {
  useGetAllLogPergerakan,
  useLogPergerakanPeralatan,
  useGetAllInventaris,
} from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ArrowRightLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';

export default function MovementTab() {
  const { data: movements, isLoading } = useGetAllLogPergerakan();
  const { data: inventaris } = useGetAllInventaris();
  const logMovement = useLogPergerakanPeralatan();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sourceLocation, setSourceLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');

  const selectedEquipment = inventaris?.find((item) => item.id.toString() === selectedEquipmentId);

  const handleLogMovement = () => {
    if (selectedEquipmentId && quantity && sourceLocation && destinationLocation) {
      logMovement.mutate(
        {
          peralatanId: BigInt(selectedEquipmentId),
          jumlah: BigInt(quantity),
          lokasiAsal: sourceLocation,
          lokasiTujuan: destinationLocation,
        },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setSelectedEquipmentId('');
            setQuantity('');
            setSourceLocation('');
            setDestinationLocation('');
          },
        }
      );
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Log Pergerakan"
        description="Catat pergerakan peralatan antar lokasi"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Catat Pergerakan</span>
                <span className="sm:hidden">Catat</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Catat Pergerakan Peralatan</DialogTitle>
                <DialogDescription>Masukkan detail pergerakan peralatan</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Peralatan</Label>
                  <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih peralatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventaris?.map((item) => (
                        <SelectItem key={item.id.toString()} value={item.id.toString()}>
                          {item.jenis.nama} - {item.lokasi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEquipment && (
                  <div className="rounded-lg border bg-muted/50 p-2.5 text-sm">
                    <p className="text-muted-foreground text-xs">Stok tersedia:</p>
                    <p className="font-medium">{selectedEquipment.jumlah.toString()} unit</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="quantity">Jumlah</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    max={selectedEquipment ? Number(selectedEquipment.jumlah) : undefined}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="source">Lokasi Asal</Label>
                  <Input
                    id="source"
                    placeholder="Contoh: Gudang Pusat"
                    value={sourceLocation}
                    onChange={(e) => setSourceLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="destination">Lokasi Tujuan</Label>
                  <Input
                    id="destination"
                    placeholder="Contoh: Gudang Regional"
                    value={destinationLocation}
                    onChange={(e) => setDestinationLocation(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleLogMovement}
                  disabled={logMovement.isPending}
                  className="w-full"
                >
                  {logMovement.isPending ? 'Mencatat...' : 'Catat Pergerakan'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="border">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : movements && movements.length > 0 ? (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[60px]">ID</TableHead>
                    <TableHead className="min-w-[150px]">Peralatan</TableHead>
                    <TableHead className="min-w-[80px]">Jumlah</TableHead>
                    <TableHead className="min-w-[120px]">Dari</TableHead>
                    <TableHead className="min-w-[120px]">Ke</TableHead>
                    <TableHead className="min-w-[140px]">Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => {
                    const equipment = inventaris?.find((item) => item.id === movement.peralatanId);
                    return (
                      <TableRow key={movement.id.toString()}>
                        <TableCell className="font-medium">#{movement.id.toString()}</TableCell>
                        <TableCell>{equipment?.jenis.nama || `ID: ${movement.peralatanId.toString()}`}</TableCell>
                        <TableCell>{movement.jumlah.toString()}</TableCell>
                        <TableCell>{movement.lokasiAsal}</TableCell>
                        <TableCell>{movement.lokasiTujuan}</TableCell>
                        <TableCell className="text-sm">{formatDate(movement.waktu)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={ArrowRightLeft}
              title="Belum ada pergerakan tercatat"
              description="Catat pergerakan peralatan pertama Anda"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
