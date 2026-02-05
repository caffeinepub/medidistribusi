import { useGetDashboardData, useGetLowStockItems, useGetPengirimanByStatus } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';

export default function DashboardOverview() {
  const { data: dashboardData, isLoading: dashboardLoading } = useGetDashboardData();
  const { data: lowStockItems, isLoading: lowStockLoading } = useGetLowStockItems();
  const { data: pendingShipments, isLoading: pendingLoading } = useGetPengirimanByStatus('pending');

  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan sistem distribusi peralatan kesehatan"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Inventaris</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-1/10">
              <Package className="h-4 w-4 text-chart-1" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData?.totalInventaris.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Item peralatan</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData?.lowStockCount.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Perlu perhatian</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Pengiriman Pending</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData?.pendingShipments.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Menunggu pengiriman</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Terkirim</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData?.deliveredShipments.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Pengiriman selesai</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle>Stok Rendah</CardTitle>
            <CardDescription>Peralatan yang perlu diisi ulang</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : lowStockItems && lowStockItems.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id.toString()} className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-xs">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{item.jenis.nama}</p>
                        <p className="text-sm text-muted-foreground">{item.lokasi}</p>
                      </div>
                      <Badge variant="destructive" className="ml-2">{item.jumlah.toString()} unit</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <EmptyState
                icon={Package}
                title="Tidak ada stok rendah"
                description="Semua peralatan memiliki stok yang cukup"
              />
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle>Pengiriman Pending</CardTitle>
            <CardDescription>Pengiriman yang menunggu diproses</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pendingShipments && pendingShipments.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {pendingShipments.map((shipment) => (
                    <div key={shipment.id.toString()} className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-xs">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{shipment.tujuan}</p>
                        <p className="text-sm text-muted-foreground">
                          {shipment.peralatan.length} item
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">Pending</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <EmptyState
                icon={Clock}
                title="Tidak ada pengiriman pending"
                description="Semua pengiriman sudah diproses"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
