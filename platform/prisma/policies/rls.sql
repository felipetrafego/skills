-- Motora — Row-Level Security (isolamento multi-tenant no banco).
--
-- Defesa em profundidade: mesmo que a camada de aplicação esqueça um filtro,
-- o Postgres só devolve linhas do tenant do contexto da sessão.
--
-- Contrato: a aplicação define, por request/transação, o tenant atual:
--     SELECT set_config('app.tenant_id', '<tenantId>', true);
-- e as policies abaixo restringem o acesso a esse tenant.
--
-- IMPORTANTE: o DONO das tabelas ignora RLS por padrão. Em produção a aplicação
-- deve conectar com um papel NÃO-dono e SEM BYPASSRLS (ex.: `motora_app`), para
-- que as policies sejam efetivamente aplicadas. Rodar como dono mantém o
-- comportamento atual (útil em migrações/seeds).

-- Tabelas estritamente do tenant (tenantId NOT NULL)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'Membership','Lead','Deal','Activity','Message','MessageTemplate',
    'LandingPage','Campaign','Automation','Subscription'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING ("tenantId" = current_setting(''app.tenant_id'', true));',
      t
    );
  END LOOP;
END $$;

-- Tabelas do tenant que também têm registros da plataforma (tenantId pode ser NULL)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['Invoice','AuditLog']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING ("tenantId" IS NULL OR "tenantId" = current_setting(''app.tenant_id'', true));',
      t
    );
  END LOOP;
END $$;
