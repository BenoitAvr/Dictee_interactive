-- Init script exécuté par le conteneur Postgres à la première initialisation
-- de la base (via /docker-entrypoint-initdb.d/).
--
-- Le modèle `score` du schema Prisma utilise
--   @default(dbgenerated("nextval('score_id_seq'::regclass)"))
-- qui référence une séquence non gérée par Prisma. On la crée en amont
-- pour que `prisma db push` réussisse.
CREATE SEQUENCE IF NOT EXISTS score_id_seq;
