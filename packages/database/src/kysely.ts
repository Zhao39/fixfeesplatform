import type { Kysely, Transaction } from "kysely";
import type { KyselifyDatabase } from "kysely-supabase";
import type { Database } from "./types";

export type DB = KyselifyDatabase<Database>;
export type KyselyDB = Kysely<DB>;
export type KyselyTx = Transaction<DB>;
