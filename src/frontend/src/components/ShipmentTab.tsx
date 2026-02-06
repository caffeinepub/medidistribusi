import { useState } from 'react';
import {
  useGetAllPengiriman,
  useCreatePengiriman,
  useUpdatePengirimanStatus,
  useGetAllInventaris,
  useGetAllRumahSakitKlinik,
} from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Truck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';

export default function ShipmentTab() {
  const { data: pengiriman, isLoading } = useGetAllPengiriman();
  const { data: inventaris } = useGetAllInventaris();
  const { data: facilities } = useGetAllRumahSakitKlinik();
  const createPengiriman = useCreatePengiriman();
  const updateStatus = useUpdatePengirimanStatus();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<bigint[]>([]);

  const handleCreateShipment = () => {
    if (selectedDestination && selectedEquipment.length > 0) {
      createPengiriman.mutate(
        {
          tujuan: selectedDestination,
          peralatanIds: selectedEquipment,
        },
        {
          onSuccess: () => {
            setCreateDialogOpen(false);
            setSelectedDestination('');
            setSelectedEquipment([]);
          },
        }
      );
    }
  };

  const handleStatusChange = (id: bigint, newStatus: string) => {
    updateStatus.mutate({ id, statusBaru: newStatus });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in-transit':
        return <Badge variant="outline" className="border-warning text-warning">Dalam Perjalanan</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="border-success text-success">Terkirim</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const toggleEquipment = (id: bigint) => {
    setSelectedEquipment((prev) =>
      prev.some((eqId) => eqId === id)
        ? prev.filter((eqId) => eqId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pengiriman"
        description="Kelola pengiriman peralatan kesehatan"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Buat Pengiriman</span>
                <span className="sm:hidden">Buat</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Buat Pengiriman Baru</DialogTitle>
                <DialogDescription>Pilih tujuan dan peralatan yang akan dikirim</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Tujuan</Label>
                  <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih rumah sakit/klinik" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities?.map((facility) => (
                        <SelectItem key={facility.nama} value={facility.nama}>
                          {facility.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Pilih Peralatan</Label>
                  <ScrollArea className="h-[280px] rounded-lg border p-3">
                    <div className="space-y-2">
                      {inventaris
                        ?.filter((item) => item.jumlah > BigInt(0))
                        .map((item) => (
                          <div key={item.id.toString()} className="flex items-center space-x-2">
                            <Checkbox
                              id={`equipment-${item.id}`}
                              checked={selectedEquipment.some((id) => id === item.id)}
                              onCheckedChange={() => toggleEquipment(item.id)}
                            />
                            <label
                              htmlFor={`equipment-${item.id}`}
                              className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{item.jenis.nama}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {item.lokasi} - {item.jumlah.toString()} unit
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>

                <Button
                  onClick={handleCreateShipment}
                  disabled={createPengiriman.isPending || !selectedDestination || selectedEquipment.length === 0}
                  className="w-full"
                >
                  {createPengiriman.isPending ? 'Membuat...' : 'Buat Pengiriman'}
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
          ) : pengiriman && pengiriman.length > 0 ? (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[60px]">ID</TableHead>
                    <TableHead className="min-w-[150px]">Tujuan</TableHead>
                    <TableHead className="min-w-[80px]">Item</TableHead>
                    <TableHead className="min-w-[140px]">Waktu</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="text-right min-w-[140px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pengiriman.map((shipment) => (
                    <TableRow key={shipment.id.toString()}>
                      <TableCell className="font-medium">#{shipment.id.toString()}</TableCell>
                      <TableCell>{shipment.tujuan}</TableCell>
                      <TableCell>{shipment.peralatan.length}</TableCell>
                      <TableCell className="text-sm">{formatDate(shipment.waktuPengiriman)}</TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={shipment.status}
                          onValueChange={(value) => handleStatusChange(shipment.id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-transit">Dalam Perjalanan</SelectItem>
                            <SelectItem value="delivered">Terkirim</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Truck}
              title="Belum ada pengiriman"
              description="Buat pengiriman pertama Anda"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
