import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import DashboardOverview from '../components/DashboardOverview';
import InventoryTab from '../components/InventoryTab';
import ShipmentTab from '../components/ShipmentTab';
import MovementTab from '../components/MovementTab';
import ReportTab from '../components/ReportTab';
import FacilityTab from '../components/FacilityTab';
import CRMTab from '../components/CRMTab';
import { LayoutDashboard, Package, Truck, ArrowRightLeft, FileText, Building2, Users } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { value: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { value: 'inventory', label: 'Inventaris', icon: Package },
    { value: 'shipment', label: 'Pengiriman', icon: Truck },
    { value: 'movement', label: 'Pergerakan', icon: ArrowRightLeft },
    { value: 'facility', label: 'Fasilitas', icon: Building2 },
    { value: 'crm', label: 'CRM', icon: Users },
    { value: 'report', label: 'Laporan', icon: FileText },
  ];

  return (
    <div className="container py-4 md:py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-10 w-full justify-start rounded-lg bg-muted p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>

        <TabsContent value="overview" className="space-y-4 animate-fade-in">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 animate-fade-in">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="shipment" className="space-y-4 animate-fade-in">
          <ShipmentTab />
        </TabsContent>

        <TabsContent value="movement" className="space-y-4 animate-fade-in">
          <MovementTab />
        </TabsContent>

        <TabsContent value="facility" className="space-y-4 animate-fade-in">
          <FacilityTab />
        </TabsContent>

        <TabsContent value="crm" className="space-y-4 animate-fade-in">
          <CRMTab />
        </TabsContent>

        <TabsContent value="report" className="space-y-4 animate-fade-in">
          <ReportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
