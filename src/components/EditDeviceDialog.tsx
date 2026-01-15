import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Pencil, Upload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Device, useUpdateDevice } from "@/hooks/useDevices";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "sonner";

const deviceSchema = z.object({
  name: z.string().min(1, "Device name is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  os: z.string().min(1, "OS is required").max(100),
  image_url: z.string().optional(),
  download_url: z.string().optional(),
  platform_id: z.string().optional(),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

interface SoftwareVersionInput {
  id?: string;
  name: string;
  version: string;
}

interface EditDeviceDialogProps {
  device: Device;
}

const EditDeviceDialog = ({ device }: EditDeviceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [softwareVersions, setSoftwareVersions] = useState<SoftwareVersionInput[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateDevice = useUpdateDevice();
  const { data: platforms } = usePlatforms();
  const { uploadFile, isUploading } = useFileUpload();

  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: device.name,
      model: device.model,
      os: device.os,
      image_url: device.image_url || "",
      download_url: device.download_url || "",
      platform_id: device.platform_id || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: device.name,
        model: device.model,
        os: device.os,
        image_url: device.image_url || "",
        download_url: device.download_url || "",
        platform_id: device.platform_id || "",
      });
      setSoftwareVersions(
        device.software_versions.length > 0
          ? device.software_versions.map((sv) => ({
              id: sv.id,
              name: sv.name,
              version: sv.version,
            }))
          : [{ name: "", version: "" }]
      );
    }
  }, [open, device, form]);

  const addSoftwareVersion = () => {
    setSoftwareVersions([...softwareVersions, { name: "", version: "" }]);
  };

  const removeSoftwareVersion = (index: number) => {
    setSoftwareVersions(softwareVersions.filter((_, i) => i !== index));
  };

  const updateSoftwareVersion = (
    index: number,
    field: "name" | "version",
    value: string
  ) => {
    const updated = [...softwareVersions];
    updated[index][field] = value;
    setSoftwareVersions(updated);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileName = `${device.id}/${file.name}`;
      const publicUrl = await uploadFile(file, "device-downloads", fileName);
      form.setValue("download_url", publicUrl);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    }
  };

  const onSubmit = async (data: DeviceFormData) => {
    const validVersions = softwareVersions.filter(
      (sv) => sv.name.trim() && sv.version.trim()
    );

    try {
      await updateDevice.mutateAsync({
        deviceId: device.id,
        device: {
          name: data.name,
          model: data.model,
          os: data.os,
          image_url: data.image_url || undefined,
          download_url: data.download_url || undefined,
          platform_id: data.platform_id || undefined,
        },
        softwareVersions: validVersions,
      });
      toast.success("Device updated successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update device");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Giada DN74" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. DN74" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="os"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operating System</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Android 11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platforms?.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. /device-image.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="download_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Download File</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="e.g. /autorun.zip or upload a file" {...field} />
                    </FormControl>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".zip,.brs,.bsfw"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Software Versions</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSoftwareVersion}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Version
                </Button>
              </div>

              <div className="space-y-3">
                {softwareVersions.map((sv, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <Input
                      placeholder="Software name"
                      value={sv.name}
                      onChange={(e) =>
                        updateSoftwareVersion(index, "name", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Version"
                      value={sv.version}
                      onChange={(e) =>
                        updateSoftwareVersion(index, "version", e.target.value)
                      }
                      className="w-32"
                    />
                    {softwareVersions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSoftwareVersion(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateDevice.isPending}>
                {updateDevice.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDeviceDialog;
