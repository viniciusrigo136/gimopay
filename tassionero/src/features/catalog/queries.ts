import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { GalleryItem, PublicBusinessInfo, ServiceWithPrices, VehicleCategory } from "@/domain/types";

export const catalogKeys = {
  business: ["public", "business"] as const,
  services: ["public", "services"] as const,
  categories: ["public", "categories"] as const,
  gallery: ["public", "gallery"] as const,
};

export const businessInfoQuery = queryOptions({
  queryKey: catalogKeys.business,
  queryFn: async (): Promise<PublicBusinessInfo> => {
    const { data, error } = await supabase.rpc("get_public_business_info");
    if (error) throw error;
    return data as unknown as PublicBusinessInfo;
  },
  staleTime: 5 * 60_000,
});

export const servicesQuery = queryOptions({
  queryKey: catalogKeys.services,
  queryFn: async (): Promise<ServiceWithPrices[]> => {
    const { data, error } = await supabase
      .from("services")
      .select("*, service_category_prices(*)")
      .eq("is_active", true)
      .order("sort_order")
      .order("name");
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});

export const categoriesQuery = queryOptions({
  queryKey: catalogKeys.categories,
  queryFn: async (): Promise<VehicleCategory[]> => {
    const { data, error } = await supabase.from("vehicle_categories").select("*").eq("is_active", true).order("sort_order");
    if (error) throw error;
    return data;
  },
  staleTime: 5 * 60_000,
});

export const galleryQuery = queryOptions({
  queryKey: catalogKeys.gallery,
  queryFn: async (): Promise<GalleryItem[]> => {
    const { data, error } = await supabase.from("gallery_items").select("*").eq("is_published", true).order("sort_order").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});
