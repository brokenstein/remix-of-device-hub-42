import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Platform {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const usePlatforms = () => {
  return useQuery({
    queryKey: ["platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platforms")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Platform[];
    },
  });
};

export const useAddPlatform = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (platform: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from("platforms")
        .insert(platform)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
    },
  });
};

export const useUpdatePlatform = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      platform,
    }: {
      id: string;
      platform: { name: string; description?: string };
    }) => {
      const { error } = await supabase
        .from("platforms")
        .update(platform)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
    },
  });
};

export const useDeletePlatform = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("platforms").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
};
