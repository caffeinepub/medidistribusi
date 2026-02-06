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
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description="Ringkasan sistem distribusi peralatan kesehatan"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventaris</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-1/10">
              <Package className="h-4 w-4 text-chart-1" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{dashboardData?.totalInventaris.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Item peralatan</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{dashboardData?.lowStockCount.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Perlu perhatian</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengiriman Pending</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{dashboardData?.pendingShipments.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Menunggu pengiriman</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terkirim</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{dashboardData?.deliveredShipments.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Pengiriman selesai</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Stok Rendah</CardTitle>
            <CardDescription className="text-sm">Peralatan yang perlu diisi ulang</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : lowStockItems && lowStockItems.length > 0 ? (
              <ScrollArea className="h-[280px] pr-3">
                <div className="space-y-2">
                  {lowStockItems.map((item) => (
                    <div key={item.id.toString()} className="flex items-center justify-between rounded-lg border bg-card p-3">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="font-medium leading-none text-sm truncate">{item.jenis.nama}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.lokasi}</p>
                      </div>
                      <Badge variant="destructive" className="ml-2 flex-shrink-0">{item.jumlah.toString()}</Badge>
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

        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pengiriman Pending</CardTitle>
            <CardDescription className="text-sm">Pengiriman yang menunggu diproses</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : pendingShipments && pendingShipments.length > 0 ? (
              <ScrollArea className="h-[280px] pr-3">
                <div className="space-y-2">
                  {pendingShipments.map((shipment) => (
                    <div key={shipment.id.toString()} className="flex items-center justify-between rounded-lg border bg-card p-3">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="font-medium leading-none text-sm truncate">{shipment.tujuan}</p>
                        <p className="text-xs text-muted-foreground">
                          {shipment.peralatan.length} item
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2 flex-shrink-0">Pending</Badge>
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
