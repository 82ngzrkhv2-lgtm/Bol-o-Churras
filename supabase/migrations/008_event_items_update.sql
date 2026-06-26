-- 008: Adiciona policy de UPDATE na tabela event_items
-- Necessário para participantes poderem marcar/desmarcar itens que vão levar

-- UPDATE policy — qualquer um pode atualizar (participante marca/desmarca item)
create policy "event_items: update"
  on public.event_items for update
  to anon, authenticated
  using ( true )
  with check ( true );

grant update on public.event_items to anon, authenticated;
