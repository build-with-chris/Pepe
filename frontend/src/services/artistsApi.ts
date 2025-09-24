import { getSupabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const BASE_URL = "https://pepe-backend-4nid.onrender.com/api";

export interface Artist {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  address?: string;
  disciplines?: string[];
  price_min?: number;
  price_max?: number;
  is_admin?: boolean;
}

export interface ArtistPayload {
  name?: string;
  email?: string;
  password?: string;
  phone_number?: string;
  address?: string;
  disciplines?: string[];
  price_min?: number;
  price_max?: number;
  is_admin?: boolean;
}

// Fetch all artists
export async function getArtists(): Promise<Artist[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("artists")
    .select("*");
  if (error) throw new Error(error.message);
  return data as Artist[];
}

// Fetch single artist by ID
export async function getArtist(id: number): Promise<Artist> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data as Artist;
}

// Create a new artist
export async function createArtist(payload: ArtistPayload): Promise<Artist> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("artists")
    .insert([payload])
    .single();
  if (error) throw new Error(error.message);
  return data as Artist;
}

// Update an existing artist
export async function updateArtist(id: number, payload: ArtistPayload): Promise<Artist> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("artists")
    .update(payload)
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data as Artist;
}

// Delete an artist
export async function deleteArtist(id: number): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("artists")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
