import Header from "@/components/Header";
import DeviceCard from "@/components/DeviceCard";
import { useDevices } from "@/hooks/useDevices";
import { usePlatforms } from "@/hooks/usePlatforms";
import { Layers, Loader2, FolderOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";

const Index = () => {
  const { data: devices, isLoading: devicesLoading, error: devicesError } = useDevices();
  const { data: platforms, isLoading: platformsLoading } = usePlatforms();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const isLoading = devicesLoading || platformsLoading;

  const groupedDevices = useMemo(() => {
    if (!devices || !platforms) return {};
    
    const groups: Record<string, typeof devices> = {
      unassigned: devices.filter((d) => !d.platform_id),
    };

    platforms.forEach((platform) => {
      groups[platform.id] = devices.filter((d) => d.platform_id === platform.id);
    });

    return groups;
  }, [devices, platforms]);

  const filteredDevices = useMemo(() => {
    if (!devices) return [];
    if (selectedPlatform === "all") return devices;
    if (selectedPlatform === "unassigned") return devices.filter((d) => !d.platform_id);
    return devices.filter((d) => d.platform_id === selectedPlatform);
  }, [devices, selectedPlatform]);

  const getPlatformName = (id: string) => {
    if (id === "all") return "All Platforms";
    if (id === "unassigned") return "Unassigned";
    return platforms?.find((p) => p.id === id)?.name || id;
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="mb-8 flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers className="w-5 h-5 text-primary" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">
                {devices?.length ?? 0}
              </span>{" "}
              Registered Devices
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FolderOpen className="w-5 h-5 text-primary" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">
                {platforms?.length ?? 0}
              </span>{" "}
              Platforms
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {devicesError && (
          <div className="text-center py-12 text-destructive">
            Failed to load devices. Please try again.
          </div>
        )}

        {/* Platform Tabs */}
        {!isLoading && !devicesError && platforms && (
          <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto gap-2">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All ({devices?.length ?? 0})
              </TabsTrigger>
              {platforms.map((platform) => (
                <TabsTrigger 
                  key={platform.id} 
                  value={platform.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {platform.name} ({groupedDevices[platform.id]?.length ?? 0})
                </TabsTrigger>
              ))}
              {groupedDevices.unassigned?.length > 0 && (
                <TabsTrigger 
                  value="unassigned"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Unassigned ({groupedDevices.unassigned.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value={selectedPlatform} className="mt-0">
              {/* Devices Grid */}
              {filteredDevices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredDevices.map((device) => (
                    <DeviceCard key={device.id} device={device} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  {selectedPlatform === "all" 
                    ? "No devices registered yet. Click \"Add Device\" to get started."
                    : `No devices in ${getPlatformName(selectedPlatform)}.`}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
