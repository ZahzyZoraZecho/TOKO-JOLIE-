grant usage on schema private to authenticated;
grant execute on function private.jolie_has_role(uuid,text[]) to authenticated;
revoke execute on function private.jolie_has_role(uuid,text[]) from anon, public;
