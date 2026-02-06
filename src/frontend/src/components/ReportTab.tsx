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
    <div className="space-y-4">
      <PageHeader
        title="Laporan"
        description="Buat laporan distribusi dan analisis"
      />

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="summary">Ringkasan</TabsTrigger>
          <TabsTrigger value="hospital">Per Rumah Sakit</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Laporan Ringkasan</CardTitle>
              <CardDescription className="text-sm">Buat laporan berdasarkan rentang tanggal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="summaryStart">Tanggal Mulai</Label>
                  <Input
                    id="summaryStart"
                    type="date"
                    value={summaryStartDate}
                    onChange={(e) => setSummaryStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
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
                {generateSummary.isPending ? 'Membuat...' : 'Buat Laporan'}
              </Button>
            </CardContent>
          </Card>

          {summaryReport && (
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Hasil Laporan Ringkasan</CardTitle>
                <CardDescription className="text-sm">
                  {formatDate(summaryReport.periodeAwal)} - {formatDate(summaryReport.periodeAkhir)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border bg-primary/5 p-4">
                    <p className="text-xs font-medium text-muted-foreground">Total Pengiriman</p>
                    <p className="text-3xl font-semibold mt-1">{summaryReport.totalPengiriman.toString()}</p>
                  </div>
                  <div className="rounded-lg border bg-chart-2/5 p-4">
                    <p className="text-xs font-medium text-muted-foreground">Total Peralatan</p>
                    <p className="text-3xl font-semibold mt-1">{summaryReport.totalPeralatan.toString()}</p>
                  </div>
                </div>

                {summaryReport.pengirimanPerTujuan.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Pengiriman per Tujuan</h4>
                    <div className="rounded-lg border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tujuan</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
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
                    title="Tidak ada data"
                    description="Tidak ada pengiriman dalam periode ini"
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hospital" className="space-y-4">
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Laporan per Rumah Sakit</CardTitle>
              <CardDescription className="text-sm">Buat laporan untuk rumah sakit tertentu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="hospitalStart">Tanggal Mulai</Label>
                  <Input
                    id="hospitalStart"
                    type="date"
                    value={hospitalStartDate}
                    onChange={(e) => setHospitalStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
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
                {generateByHospital.isPending ? 'Membuat...' : 'Buat Laporan'}
              </Button>
            </CardContent>
          </Card>

          {hospitalReport && (
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Hasil - {hospitalName}</CardTitle>
                <CardDescription className="text-sm">Total: {hospitalReport.length} pengiriman</CardDescription>
              </CardHeader>
              <CardContent>
                {hospitalReport.length > 0 ? (
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Waktu</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hospitalReport.map((shipment) => (
                          <TableRow key={shipment.id.toString()}>
                            <TableCell className="font-medium">#{shipment.id.toString()}</TableCell>
                            <TableCell>{shipment.peralatan.length}</TableCell>
                            <TableCell>{shipment.status}</TableCell>
                            <TableCell className="text-sm">{formatDate(shipment.waktuPengiriman)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="Tidak ada pengiriman"
                    description="Tidak ada data dalam periode ini"
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
