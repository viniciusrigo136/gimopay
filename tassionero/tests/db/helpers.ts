import pg from "pg";

export const DB_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

export type Role = "anon" | "owner" | "stranger";

export const OWNER_ID = "00000000-0000-4000-8000-000000000001";
export const STRANGER_ID = "00000000-0000-4000-8000-000000000002";

export function newPool() {
  return new pg.Pool({ connectionString: DB_URL, max: 6 });
}

/** Executa SQL como um papel da API (anon/authenticated), igual ao PostgREST. */
export async function asRole<T extends pg.QueryResultRow>(
  pool: pg.Pool,
  role: Role,
  sql: string,
  params: unknown[] = [],
): Promise<pg.QueryResult<T>> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    if (role === "anon") {
      await client.query("set local role anon");
      await client.query(`select set_config('request.jwt.claims', '{"role":"anon"}', true)`);
    } else {
      const sub = role === "owner" ? OWNER_ID : STRANGER_ID;
      await client.query("set local role authenticated");
      await client.query(`select set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify({ sub, role: "authenticated" }),
      ]);
    }
    const res = await client.query<T>(sql, params);
    await client.query("commit");
    return res;
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

/** Zera os dados transacionais e garante proprietário + um usuário sem permissão. */
export async function resetData(pool: pg.Pool) {
  await pool.query(`
    truncate public.transactions, public.appointment_history, public.appointment_items,
             public.appointments, public.vehicles, public.customers, public.blocked_periods,
             public.booking_attempts restart identity cascade;
    update public.business_settings set min_advance_minutes = 120, max_advance_days = 60,
           slot_interval_minutes = 15, max_pending_per_phone = 2,
           pix_key = 'tassionero@exemplo.com', pix_key_type = 'email';
  `);
  await pool.query(
    `insert into auth.users (id, email, aud, role, instance_id)
     values ($1, 'dono@teste.local', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
            ($2, 'intruso@teste.local', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000')
     on conflict (id) do nothing`,
    [OWNER_ID, STRANGER_ID],
  );
  await pool.query(`update public.profiles set role = null where id <> $1`, [OWNER_ID]);
  await pool.query(`update public.profiles set role = 'owner' where id = $1`, [OWNER_ID]);
}

export async function ids(pool: pg.Pool) {
  const s = await pool.query<{ slug: string; id: string }>(`select slug, id from public.services`);
  const c = await pool.query<{ slug: string; id: string }>(`select slug, id from public.vehicle_categories`);
  return {
    service: Object.fromEntries(s.rows.map((r) => [r.slug, r.id])) as Record<string, string>,
    category: Object.fromEntries(c.rows.map((r) => [r.slug, r.id])) as Record<string, string>,
  };
}

/** Próxima data local (YYYY-MM-DD) com o dia da semana pedido, a pelo menos 3 dias. */
export function nextWeekday(dow: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 3);
  while (d.getUTCDay() !== dow) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** "2026-12-07" + "08:40" em America/Sao_Paulo (UTC-3, sem horário de verão) → ISO. */
export function local(date: string, time: string): string {
  return new Date(`${date}T${time}:00-03:00`).toISOString();
}

let phoneSeq = 0;
export function uniquePhone() {
  phoneSeq += 1;
  return `(49) 9${String(80000000 + phoneSeq).padStart(8, "0")}`;
}

export function bookingPayload(over: Record<string, unknown>) {
  return {
    name: "Cliente Teste",
    phone: uniquePhone(),
    vehicle_model: "Onix 2020",
    payment_method: "pix",
    ...over,
  };
}

export async function book(pool: pg.Pool, payload: Record<string, unknown>) {
  const r = await asRole<{ r: { public_code: string } }>(
    pool,
    "anon",
    `select public.create_public_appointment($1::jsonb) as r`,
    [JSON.stringify(payload)],
  );
  return r.rows[0].r.public_code;
}

export async function slots(pool: pg.Pool, date: string, services: string[], category: string) {
  const r = await asRole<{ starts_at: Date }>(
    pool,
    "anon",
    `select starts_at from public.get_available_slots($1::date, $2::uuid[], $3::uuid)`,
    [date, services, category],
  );
  return r.rows.map((x) =>
    new Date(x.starts_at).toLocaleTimeString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
}
