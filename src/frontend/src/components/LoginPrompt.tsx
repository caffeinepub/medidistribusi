import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Shield, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-chart-2 shadow-glow">
            <Package className="h-12 w-12 text-primary-foreground" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl">MediDistribusi</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sistem Manajemen Distribusi Peralatan Kesehatan yang Modern dan Efisien
            </p>
          </div>
        </div>

        <Card className="border-2 shadow-soft">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Selamat Datang</CardTitle>
            <CardDescription className="text-base">
              Masuk untuk mengakses sistem manajemen distribusi peralatan kesehatan
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              className="min-w-[200px] h-12 text-base gap-2 shadow-sm"
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border shadow-xs hover:shadow-soft transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/10 mb-3">
                <Package className="h-6 w-6 text-chart-1" />
              </div>
              <CardTitle className="text-lg">Inventaris</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kelola stok peralatan kesehatan secara real-time dengan sistem yang terintegrasi
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-xs hover:shadow-soft transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10 mb-3">
                <TrendingUp className="h-6 w-6 text-chart-2" />
              </div>
              <CardTitle className="text-lg">Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Lacak pengiriman ke rumah sakit dan klinik dengan status real-time
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-xs hover:shadow-soft transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10 mb-3">
                <Users className="h-6 w-6 text-chart-3" />
              </div>
              <CardTitle className="text-lg">Pergerakan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Catat dan monitor pergerakan peralatan antar lokasi dengan mudah
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-xs hover:shadow-soft transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-4/10 mb-3">
                <Shield className="h-6 w-6 text-chart-4" />
              </div>
              <CardTitle className="text-lg">Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Buat laporan distribusi dan analisis untuk pengambilan keputusan
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
