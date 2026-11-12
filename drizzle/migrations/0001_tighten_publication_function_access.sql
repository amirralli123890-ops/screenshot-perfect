REVOKE ALL ON public.comment_contacts,public.contact_messages,public.user_roles,public.profiles,public.submission_limits FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user(),public.assign_initial_admin() FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid,public.app_role),public.is_staff() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role),public.is_staff() TO authenticated,service_role;