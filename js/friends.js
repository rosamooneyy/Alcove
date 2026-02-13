// Friends Module for Alcove - Supabase integration
window.Alcove = window.Alcove || {};

(function() {
  // Helper to get current user ID
  function getUserId() {
    const user = Alcove.auth?.getCurrentUser();
    return user?.id;
  }

  // Helper to check if we should use cloud
  function useCloud() {
    return Alcove.isSupabaseConfigured() && Alcove.auth?.isAuthenticated();
  }

  // ==================== USER SEARCH ====================

  // Search for users by name or email
  async function searchUsers(query) {
    if (!useCloud() || !query || query.trim().length < 2) return [];

    const searchTerm = query.trim().toLowerCase();
    const currentUserId = getUserId();

    const { data, error } = await Alcove.supabase
      .from('profiles')
      .select('id, name, favorite_genres, created_at')
      .or(`name.ilike.%${searchTerm}%`)
      .neq('id', currentUserId)
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data || [];
  }

  // Get user profile by ID
  async function getUserProfile(userId) {
    if (!useCloud()) return null;

    const { data, error } = await Alcove.supabase
      .from('profiles')
      .select('id, name, favorite_genres, created_at')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  }

  // ==================== FRIEND REQUESTS ====================

  // Send a friend request
  async function sendFriendRequest(addresseeId) {
    if (!useCloud()) return { success: false, error: 'Not authenticated' };

    const requesterId = getUserId();

    // Check if friendship already exists
    const { data: existing } = await Alcove.supabase
      .from('friendships')
      .select('id, status')
      .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`)
      .single();

    if (existing) {
      if (existing.status === 'accepted') {
        return { success: false, error: 'Already friends' };
      } else if (existing.status === 'pending') {
        return { success: false, error: 'Request already pending' };
      }
    }

    const { error } = await Alcove.supabase
      .from('friendships')
      .insert({
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: 'pending'
      });

    if (error) {
      console.error('Error sending friend request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // Accept a friend request
  async function acceptFriendRequest(friendshipId) {
    if (!useCloud()) return { success: false, error: 'Not authenticated' };

    const { error } = await Alcove.supabase
      .from('friendships')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', friendshipId)
      .eq('addressee_id', getUserId());

    if (error) {
      console.error('Error accepting friend request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // Reject a friend request
  async function rejectFriendRequest(friendshipId) {
    if (!useCloud()) return { success: false, error: 'Not authenticated' };

    const { error } = await Alcove.supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .eq('addressee_id', getUserId());

    if (error) {
      console.error('Error rejecting friend request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // Cancel a sent friend request
  async function cancelFriendRequest(friendshipId) {
    if (!useCloud()) return { success: false, error: 'Not authenticated' };

    const { error } = await Alcove.supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .eq('requester_id', getUserId());

    if (error) {
      console.error('Error canceling friend request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // Remove a friend
  async function removeFriend(friendshipId) {
    if (!useCloud()) return { success: false, error: 'Not authenticated' };

    const userId = getUserId();

    const { error } = await Alcove.supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) {
      console.error('Error removing friend:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // ==================== FRIEND LISTS ====================

  // Get all friends (accepted)
  async function getFriends() {
    if (!useCloud()) return [];

    const userId = getUserId();

    const { data, error } = await Alcove.supabase
      .from('friendships')
      .select(`
        id,
        requester_id,
        addressee_id,
        created_at,
        requester:profiles!friendships_requester_id_fkey(id, name, favorite_genres),
        addressee:profiles!friendships_addressee_id_fkey(id, name, favorite_genres)
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) {
      console.error('Error fetching friends:', error);
      return [];
    }

    // Map to friend profiles
    return (data || []).map(f => {
      const friend = f.requester_id === userId ? f.addressee : f.requester;
      return {
        friendshipId: f.id,
        ...friend,
        friendsSince: f.created_at
      };
    });
  }

  // Get pending friend requests (received)
  async function getPendingRequests() {
    if (!useCloud()) return [];

    const { data, error } = await Alcove.supabase
      .from('friendships')
      .select(`
        id,
        created_at,
        requester:profiles!friendships_requester_id_fkey(id, name, favorite_genres)
      `)
      .eq('status', 'pending')
      .eq('addressee_id', getUserId())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }

    return (data || []).map(r => ({
      friendshipId: r.id,
      ...r.requester,
      requestedAt: r.created_at
    }));
  }

  // Get sent friend requests (outgoing)
  async function getSentRequests() {
    if (!useCloud()) return [];

    const { data, error } = await Alcove.supabase
      .from('friendships')
      .select(`
        id,
        created_at,
        addressee:profiles!friendships_addressee_id_fkey(id, name, favorite_genres)
      `)
      .eq('status', 'pending')
      .eq('requester_id', getUserId())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sent requests:', error);
      return [];
    }

    return (data || []).map(r => ({
      friendshipId: r.id,
      ...r.addressee,
      requestedAt: r.created_at
    }));
  }

  // Get friendship status with a user
  async function getFriendshipStatus(userId) {
    if (!useCloud()) return null;

    const currentUserId = getUserId();

    const { data } = await Alcove.supabase
      .from('friendships')
      .select('id, status, requester_id, addressee_id')
      .or(`and(requester_id.eq.${currentUserId},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${currentUserId})`)
      .single();

    if (!data) return { status: 'none' };

    return {
      friendshipId: data.id,
      status: data.status,
      isRequester: data.requester_id === currentUserId
    };
  }

  // ==================== FRIEND ACTIVITY ====================

  // Get activity feed from friends
  async function getFriendActivity(limit = 50) {
    if (!useCloud()) return [];

    const userId = getUserId();

    // First get friend IDs
    const friends = await getFriends();
    const friendIds = friends.map(f => f.id);

    if (friendIds.length === 0) return [];

    const { data, error } = await Alcove.supabase
      .from('activity')
      .select(`
        *,
        books (id, title, authors, thumbnail),
        profiles:user_id (id, name)
      `)
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching friend activity:', error);
      return [];
    }

    return (data || []).map(a => ({
      id: a.id,
      type: a.type,
      details: a.details,
      createdAt: a.created_at,
      user: a.profiles,
      book: a.books
    }));
  }

  // ==================== FRIEND COUNT ====================

  // Get count of pending requests
  async function getPendingRequestCount() {
    if (!useCloud()) return 0;

    const { count, error } = await Alcove.supabase
      .from('friendships')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('addressee_id', getUserId());

    if (error) return 0;
    return count || 0;
  }

  // Export friends module
  Alcove.friends = {
    searchUsers,
    getUserProfile,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getFriends,
    getPendingRequests,
    getSentRequests,
    getFriendshipStatus,
    getFriendActivity,
    getPendingRequestCount
  };
})();
