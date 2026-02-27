-- ============================================================================
-- Alcove Account Deletion - Database Migration
-- ============================================================================
-- This migration adds functionality for:
-- 1. Clear All Data - Wipes user data while preserving account
-- 2. Delete Account - Completely removes user account and all data
-- ============================================================================
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- FUNCTION: delete_all_user_data
-- ============================================================================
-- Deletes all user data in the correct order to respect foreign key constraints
-- Parameters:
--   include_profile: If TRUE, deletes the profile (for account deletion)
--                    If FALSE, preserves profile (for clear data)
-- Returns: JSON object with success status and deletion counts
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_all_user_data(include_profile BOOLEAN DEFAULT FALSE)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid UUID;
  count_community_trope_votes INTEGER;
  count_poll_votes INTEGER;
  count_friendships INTEGER;
  count_shelf_books INTEGER;
  count_ratings INTEGER;
  count_reviews INTEGER;
  count_reading_progress INTEGER;
  count_quotes INTEGER;
  count_book_tropes INTEGER;
  count_activity INTEGER;
  count_shelves INTEGER;
  count_profile INTEGER := 0;
BEGIN
  -- Get the current authenticated user's ID
  user_uuid := auth.uid();

  -- Ensure user is authenticated
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete in correct order respecting foreign key constraints

  -- 1. Delete community_trope_votes (no dependencies)
  DELETE FROM community_trope_votes WHERE user_id = user_uuid;
  GET DIAGNOSTICS count_community_trope_votes = ROW_COUNT;

  -- 2. Delete poll_votes (no dependencies)
  DELETE FROM poll_votes WHERE user_id = user_uuid;
  GET DIAGNOSTICS count_poll_votes = ROW_COUNT;

  -- 3. Delete friendships (both directions - where user is requester OR addressee)
  DELETE FROM friendships
  WHERE requester_id = user_uuid OR addressee_id = user_uuid;
  GET DIAGNOSTICS count_friendships = ROW_COUNT;

  -- 4. Delete shelf_books (references shelves)
  DELETE FROM shelf_books WHERE user_id = user_uuid;
  GET DIAGNOSTICS count_shelf_books = ROW_COUNT;

  -- 5. Delete user content (can be done in parallel, no interdependencies)
  DELETE FROM ratings WHERE user_id = user_uuid;
  GET DIAGNOSTICS count_ratings = ROW_COUNT;

  DELETE FROM reviews WHERE user_id = user_uuid;
  GET DIAGNOSTICS count_reviews = ROW_COUNT;

  DELETE FROM reading_progress WHERE user_id = user_uuid;
  GET DIAGNOSTICS count_reading_progress = ROW_COUNT;

  DELETE FROM quotes WHERE user_id = user_uuid;
  GET DIAGNOSTICS count_quotes = ROW_COUNT;

  DELETE FROM book_tropes WHERE user_id = user_uuid;
  GET DIAGNOSTICS count_book_tropes = ROW_COUNT;

  DELETE FROM activity WHERE user_id = user_uuid;
  GET DIAGNOSTICS count_activity = ROW_COUNT;

  -- 6. Delete shelves
  IF include_profile THEN
    -- Delete ALL shelves (including built-in) for account deletion
    DELETE FROM shelves WHERE user_id = user_uuid;
    GET DIAGNOSTICS count_shelves = ROW_COUNT;
  ELSE
    -- Delete only custom shelves for clear data
    DELETE FROM shelves WHERE user_id = user_uuid AND is_built_in = false;
    GET DIAGNOSTICS count_shelves = ROW_COUNT;
  END IF;

  -- 7. Delete or reset profile
  IF include_profile THEN
    -- Complete account deletion - delete the profile
    -- This will trigger the auth user deletion via trigger
    DELETE FROM profiles WHERE id = user_uuid;
    GET DIAGNOSTICS count_profile = ROW_COUNT;
  ELSE
    -- Clear data only - reset profile fields but keep the profile
    UPDATE profiles SET
      favorite_genres = ARRAY[]::TEXT[],
      top_books = ARRAY[]::TEXT[],
      reader_dna_type = NULL,
      earned_badges = ARRAY[]::TEXT[]
    WHERE id = user_uuid;
  END IF;

  -- Return success with deletion counts
  RETURN json_build_object(
    'success', true,
    'user_id', user_uuid,
    'include_profile', include_profile,
    'deleted_counts', json_build_object(
      'community_trope_votes', count_community_trope_votes,
      'poll_votes', count_poll_votes,
      'friendships', count_friendships,
      'shelf_books', count_shelf_books,
      'ratings', count_ratings,
      'reviews', count_reviews,
      'reading_progress', count_reading_progress,
      'quotes', count_quotes,
      'book_tropes', count_book_tropes,
      'activity', count_activity,
      'shelves', count_shelves,
      'profile', count_profile
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error information
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- ============================================================================
-- FUNCTION: delete_auth_user_on_profile_delete (TRIGGER)
-- ============================================================================
-- Automatically deletes the auth.users record when a profile is deleted
-- This ensures complete account removal when user deletes their account
-- Uses SECURITY DEFINER to have permission to delete from auth schema
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_auth_user_on_profile_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete the corresponding auth user
  -- This only runs when a profile is deleted, which only happens during account deletion
  DELETE FROM auth.users WHERE id = OLD.id;

  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent profile deletion
    RAISE WARNING 'Failed to delete auth user %: %', OLD.id, SQLERRM;
    RETURN OLD;
END;
$$;

-- ============================================================================
-- TRIGGER: on_profile_delete
-- ============================================================================
-- Executes delete_auth_user_on_profile_delete() after a profile is deleted
-- ============================================================================

DROP TRIGGER IF EXISTS on_profile_delete ON profiles;

CREATE TRIGGER on_profile_delete
  AFTER DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION delete_auth_user_on_profile_delete();

-- ============================================================================
-- PERMISSIONS
-- ============================================================================
-- Grant execute permissions to authenticated users
-- ============================================================================

GRANT EXECUTE ON FUNCTION delete_all_user_data(BOOLEAN) TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'SUCCESS! Account deletion functions and trigger created.' as status;

-- ============================================================================
-- TESTING (Optional - uncomment to test)
-- ============================================================================
-- To test the clear data function (preserves profile):
-- SELECT delete_all_user_data(false);

-- To test the delete account function (deletes profile + auth user):
-- WARNING: This will delete your account! Only test with a test account!
-- SELECT delete_all_user_data(true);
-- ============================================================================
