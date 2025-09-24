import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminAPI } from "@/lib/api";
import type { AdminArtist } from "@/types/admin";

export function useAdminArtists(status: string) {
  return useQuery<AdminArtist[]>({
    queryKey: ["admin-artists", status],
    queryFn: () => AdminAPI.listArtists(status),
    staleTime: 15_000,
  });
}

export function useApproveArtist(status: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AdminAPI.approveArtist(id),
    onSuccess: (_, id) => {
      qc.setQueryData<AdminArtist[]>(["admin-artists", status], (old) =>
        (old ?? []).map(a => a.id === id ? { ...a, approval_status: "approved", rejection_reason: null } : a)
      );
    },
  });
}

export function useRejectArtist(status: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => AdminAPI.rejectArtist(id, reason),
    onSuccess: ({ status: s, rejection_reason }, { id }) => {
      qc.setQueryData<AdminArtist[]>(["admin-artists", status], (old) =>
        (old ?? []).map(a => a.id === id ? { ...a, approval_status: "rejected", rejection_reason } : a)
      );
    },
  });
}