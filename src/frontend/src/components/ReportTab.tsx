import { useState } from 'react';
import { useGenerateLaporanRingkasan, useGenerateLaporanByHospital, useGetAllRumahSakitKlinik } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LaporanRingkasan, Pengiriman } from '../backend';
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';

export default function ReportTab() {
  const generateSummary = useGenerateLaporanRingkasan();
  const generateByHospital = useGenerateLaporanByHospital();
  const { data: facilities } = useGetAllRumahSakitKlinik();

  const [summaryStartDate, setSummaryStartDate] = useState('');
  const [summaryEndDate, setSummaryEndDate] = useState('');
  const [summaryReport, setSummaryReport] = useState<LaporanRingkasan | null>(null);

  const [hospitalName, setHospitalName] = useState('');
  const [hospitalStartDate, setHospitalStartDate] = useState('');
  const [hospitalEndDate, setHospitalEndDate] = useState('');
  const [hospitalReport, setHospitalReport] = useState<Pengiriman[] | null>(null);

  const handleGenerateSummary = async () => {
    if (summaryStartDate && summaryEndDate) {
      const start = new Date(summaryStartDate).getTime() * 1000000;
      const end = new Date(summaryEndDate).getTime() * 1000000;

      const result = await generateSummary.mutateAsync({
        periodeAwal: BigInt(start),
        periodeAkhir: BigInt(end),
      });
      setSummaryReport(result);
    }
  };

  const handleGenerateByHospital = async () => {
    if (hospitalName && hospitalStartDate && hospitalEndDate) {
      const start = new Date(hospitalStartDate).getTime() * 1000000;
      const end = new Date(hospitalEndDate).getTime() * 1000000;

      const result = await generateByHospital.mutateAsync({
        namaRumahSakit: hospitalName,
        periodeAwal: BigInt(start),
        periodeAkhir: BigInt(end),
      });
      setHospitalReport(result);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan"
        description="Buat laporan distribusi dan analisis"
      />

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="summary">Laporan Ringkasan</TabsTrigger>
          <TabsTrigger value="hospital">Per Rumah Sakit</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card className="border shadow-xs">
            <CardHeader>
              <CardTitle>Laporan Ringkasan</CardTitle>
              <CardDescription>Buat laporan ringkasan berdasarkan rentang tanggal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="summaryStart">Tanggal Mulai</Label>
                  <Input
                    id="summaryStart"
                    type="date"
                    value={summaryStartDate}
                    onChange={(e) => setSummaryStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summaryEnd">Tanggal Akhir</Label>
                  <Input
                    id="summaryEnd"
                    type="date"
                    value={summaryEndDate}
                    onChange={(e) => setSummaryEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateSummary}
                disabled={generateSummary.isPending || !summaryStartDate || !summaryEndDate}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                {generateSummary.isPending ? 'Membuat Laporan...' : 'Buat Laporan'}
              </Button>
            </CardContent>
          </Card>

          {summaryReport && (
            <Card className="border shadow-xs">
              <CardHeader>
                <CardTitle>Hasil Laporan Ringkasan</CardTitle>
                <CardDescription>
                  Periode: {formatDate(summaryReport.periodeAwal)} - {formatDate(summaryReport.periodeAkhir)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                    <p className="text-sm font-medium text-muted-foreground">Total Pengiriman</p>
                    <p className="text-4xl font-bold mt-2">{summaryReport.totalPengiriman.toString()}</p>
                  </div>
                  <div className="rounded-xl border bg-gradient-to-br from-chart-2/5 to-chart-2/10 p-6">
                    <p className="text-sm font-medium text-muted-foreground">Total Peralatan</p>
                    <p className="text-4xl font-bold mt-2">{summaryReport.totalPeralatan.toString()}</p>
                  </div>
                </div>

                {summaryReport.pengirimanPerTujuan.length > 0 ? (
                  <div>
                    <h4 className="font-semibold mb-3">Pengiriman per Tujuan</h4>
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tujuan</TableHead>
                            <TableHead className="text-right">Jumlah Pengiriman</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summaryReport.pengirimanPerTujuan.map(([tujuan, jumlah]) => (
                            <TableRow key={tujuan}>
                              <TableCell className="font-medium">{tujuan}</TableCell>
                              <TableCell className="text-right">{jumlah.toString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="Tidak ada data pengiriman"
                    description="Tidak ada pengiriman dalam periode ini"
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hospital" className="space-y-6">
          <Card className="border shadow-xs">
            <CardHeader>
              <CardTitle>Laporan per Rumah Sakit</CardTitle>
              <CardDescription>Buat laporan untuk rumah sakit tertentu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rumah Sakit/Klinik</Label>
                <Select value={hospitalName} onValueChange={setHospitalName}>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hospitalStart">Tanggal Mulai</Label>
                  <Input
                    id="hospitalStart"
                    type="date"
                    value={hospitalStartDate}
                    onChange={(e) => setHospitalStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalEnd">Tanggal Akhir</Label>
                  <Input
                    id="hospitalEnd"
                    type="date"
                    value={hospitalEndDate}
                    onChange={(e) => setHospitalEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateByHospital}
                disabled={
                  generateByHospital.isPending ||
                  !hospitalName ||
                  !hospitalStartDate ||
                  !hospitalEndDate
                }
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                {generateByHospital.isPending ? 'Membuat Laporan...' : 'Buat Laporan'}
              </Button>
            </CardContent>
          </Card>

          {hospitalReport && (
            <Card className="border shadow-xs">
              <CardHeader>
                <CardTitle>Hasil Laporan - {hospitalName}</CardTitle>
                <CardDescription>Total pengiriman: {hospitalReport.length}</CardDescription>
              </CardHeader>
              <CardContent>
                {hospitalReport.length > 0 ? (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Jumlah Item</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Waktu</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hospitalReport.map((shipment) => (
                          <TableRow key={shipment.id.toString()}>
                            <TableCell className="font-medium">#{shipment.id.toString()}</TableCell>
                            <TableCell>{shipment.peralatan.length} item</TableCell>
                            <TableCell>{shipment.status}</TableCell>
                            <TableCell>{formatDate(shipment.waktuPengiriman)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="Tidak ada pengiriman"
                    description="Tidak ada pengiriman dalam periode ini"
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
