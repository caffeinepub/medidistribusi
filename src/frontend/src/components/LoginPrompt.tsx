import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Shield, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">MediDistribusi</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Sistem Manajemen Distribusi Peralatan Kesehatan
            </p>
          </div>
        </div>

        <Card className="border">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl">Selamat Datang</CardTitle>
            <CardDescription>
              Masuk untuk mengakses sistem manajemen distribusi
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              className="min-w-[180px] gap-2"
            >
              {isLoggingIn ? 'Memproses...' : (
                <>
                  Masuk
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10 mb-2">
                <Package className="h-5 w-5 text-chart-1" />
              </div>
              <CardTitle className="text-base">Inventaris</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Kelola stok peralatan kesehatan secara real-time
              </p>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10 mb-2">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
              <CardTitle className="text-base">Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lacak pengiriman ke rumah sakit dan klinik
              </p>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10 mb-2">
                <Users className="h-5 w-5 text-chart-3" />
              </div>
              <CardTitle className="text-base">Pergerakan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Catat pergerakan peralatan antar lokasi
              </p>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10 mb-2">
                <Shield className="h-5 w-5 text-chart-4" />
              </div>
              <CardTitle className="text-base">Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Buat laporan distribusi dan analisis
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
