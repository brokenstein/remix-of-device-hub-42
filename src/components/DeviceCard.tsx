import { Monitor, Cpu, Trash2, Download, Copy } from "lucide-react";
import { Device, useDeleteDevice, useAddDevice } from "@/hooks/useDevices";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EditDeviceDialog from "./EditDeviceDialog";

interface DeviceCardProps {
  device: Device;
}

const DeviceCard = ({ device }: DeviceCardProps) => {
  const deleteDevice = useDeleteDevice();
  const addDevice = useAddDevice();
  const { isAdmin } = useAuth();

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${device.name}?`)) {
      try {
        await deleteDevice.mutateAsync(device.id);
        toast.success("Device deleted");
      } catch {
        toast.error("Failed to delete device");
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      await addDevice.mutateAsync({
        device: {
          name: `${device.name} (Copy)`,
          model: device.model,
          os: device.os,
          image_url: device.image_url || undefined,
          download_url: device.download_url || undefined,
          platform_id: device.platform_id || undefined,
        },
        softwareVersions: device.software_versions.map((sv) => ({
          name: sv.name,
          version: sv.version,
        })),
      });
      toast.success("Device duplicated");
    } catch {
      toast.error("Failed to duplicate device");
    }
  };

  return (
    <div className="device-card">
      {/* Device Image */}
      <div className="relative h-48 bg-gradient-to-br from-secondary to-muted flex items-center justify-center p-6">
        {device.image_url ? (
          <img
            src={device.image_url}
            alt={device.name}
            className="max-h-full max-w-full object-contain drop-shadow-2xl"
          />
        ) : (
          <Monitor className="w-24 h-24 text-muted-foreground/50" />
        )}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={handleDuplicate}
              disabled={addDevice.isPending}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <EditDeviceDialog device={device} />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">
              {device.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
              <Cpu className="w-4 h-4" />
              <span>{device.model}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Monitor className="w-3.5 h-3.5" />
            <span>Active</span>
          </div>
        </div>

        {/* OS Badge and Download */}
        <div className="mb-4 flex items-center justify-between">
          <span className="version-badge">{device.os}</span>
          {device.download_url && (
            <a
              href={device.download_url}
              download
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          )}
        </div>

        {/* Software Versions Table */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Software Versions
          </h3>
          <div className="bg-secondary/50 rounded-lg overflow-hidden">
            {device.software_versions.length > 0 ? (
              <table className="w-full text-sm table-fixed">
                <tbody>
                  {device.software_versions.map((software, index) => (
                    <tr
                      key={software.id}
                      className={`${
                        index % 2 === 0 ? "bg-transparent" : "bg-secondary/50"
                      } hover:bg-primary/5 transition-colors`}
                    >
                      <td className="py-2.5 px-4 text-card-foreground font-medium truncate">
                        {software.name}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <span className="font-mono text-primary font-medium">
                          {software.version}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-center text-muted-foreground text-sm">
                No software versions registered
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
