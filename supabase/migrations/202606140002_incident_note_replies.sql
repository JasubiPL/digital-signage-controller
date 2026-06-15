alter table public.location_incident_notes
  add column if not exists parent_note_id uuid references public.location_incident_notes(id) on delete set null;

create index if not exists location_incident_notes_parent_note_id_idx
on public.location_incident_notes (parent_note_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'location_incident_notes_parent_not_self_check'
  ) then
    alter table public.location_incident_notes
      add constraint location_incident_notes_parent_not_self_check
      check (parent_note_id is null or parent_note_id <> id);
  end if;
end $$;

drop policy if exists "location_incident_notes_update_super_admin" on public.location_incident_notes;
drop policy if exists "location_incident_notes_update_owner" on public.location_incident_notes;
create policy "location_incident_notes_update_owner"
on public.location_incident_notes
for update
to authenticated
using (event_type = 'note' and author_id = auth.uid())
with check (event_type = 'note' and author_id = auth.uid());

drop policy if exists "location_incident_notes_delete_super_admin" on public.location_incident_notes;
drop policy if exists "location_incident_notes_delete_owner" on public.location_incident_notes;
create policy "location_incident_notes_delete_owner"
on public.location_incident_notes
for delete
to authenticated
using (event_type = 'note' and author_id = auth.uid());
