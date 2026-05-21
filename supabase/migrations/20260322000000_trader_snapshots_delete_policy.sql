-- Allow users to delete their own snapshot row (account cleanup flows).

drop policy if exists "trader_snapshots_delete_own" on public.trader_snapshots;

create policy "trader_snapshots_delete_own"
  on public.trader_snapshots for delete
  using (auth.uid() = user_id);
