import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DraftListing {
  id: string;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  property_type?: string;
  status: 'draft' | 'active' | 'inactive';
  broker_id: string;
  created_at: string;
  updated_at: string;
  draft_data: Record<string, unknown>;
}

export const useDraftListings = () => {
  const { user } = useAuth();
  const [draftListings, setDraftListings] = useState<DraftListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDraftListings = async () => {
    if (!user) {
      setDraftListings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('broker_id', user.id)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setDraftListings(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching draft listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch draft listings');
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (draftData: Partial<DraftListing>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error: saveError } = await supabase
        .from('properties')
        .upsert({
          ...draftData,
          broker_id: user.id,
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      // Refresh the draft listings
      await fetchDraftListings();
      return data;
    } catch (err) {
      console.error('Error saving draft:', err);
      throw err;
    }
  };

  const deleteDraft = async (draftId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', draftId)
        .eq('broker_id', user?.id);

      if (deleteError) {
        throw deleteError;
      }

      // Refresh the draft listings
      await fetchDraftListings();
    } catch (err) {
      console.error('Error deleting draft:', err);
      throw err;
    }
  };

  const publishDraft = async (draftId: string) => {
    try {
      const { data, error: publishError } = await supabase
        .from('properties')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', draftId)
        .eq('broker_id', user?.id)
        .select()
        .single();

      if (publishError) {
        throw publishError;
      }

      // Refresh the draft listings
      await fetchDraftListings();
      return data;
    } catch (err) {
      console.error('Error publishing draft:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDraftListings();
  }, [user]);

  return {
    draftListings,
    loading,
    error,
    saveDraft,
    deleteDraft,
    publishDraft,
    refetch: fetchDraftListings,
  };
};