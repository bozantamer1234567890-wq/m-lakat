-- Bug fix: diagnostic and drill cases are intentionally unpublished (is_published =
-- false) so they never show up in the public case library, but the only SELECT
-- policy on public.cases required is_published = true — which meant RLS silently
-- hid the diagnostic/drill rows from every signed-in user, breaking /diagnostic
-- with a redirect loop (dashboard -> diagnostic -> dashboard -> ...) for anyone
-- with zero sessions, i.e. every brand-new signup.

create policy "diagnostic and drill cases are readable by signed in users"
  on public.cases for select
  using (is_diagnostic = true or is_drill = true);
