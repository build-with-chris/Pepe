export type ApprovalStatus = "pending" | "approved" | "rejected" | "unsubmitted";

export interface AdminArtist {
  id: number;
  name: string;
  email: string;
  approval_status: ApprovalStatus;
  rejection_reason?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  disciplines?: string[];
  profile_image_url?: string | null;
  instagram?: string | null;
  bio?: string | null;
}