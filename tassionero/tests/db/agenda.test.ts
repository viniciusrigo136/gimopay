import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type pg from "pg";
import { asRole, book, bookingPayload, ids, local, newPool, nextWeekday, resetData, slots } from "./helpers";

let pool: pg.Pool;
let S: Awaited<ReturnType<typeof ids>>;
const monday = nextWeekday(1);
const saturday = nextWeekday(6);
const sunday = nextWeekday(0);

beforeAll(async () => {
  pool = newPool();
  S = await ids(pool);
});
afterAll(async () => pool.end());
beforeEach(async () => resetData(pool));

const wash = () => [S.service["lavagem-simples"]]; // 40 min
const leather = () => [S.service["hidratacao-de-couro"]]; // 120 min
const hatch = () => S.category.hatch;

describe("geração de horários", () => {
  it("serviço de 40 min às 08:00 termina 08:40", async () => {
    const r = await asRole<{ starts_at: Date; ends_at: Date }>(
      pool,
      "anon",
      `select * from public.get_available_slots($1::date, $2::uuid[], $3::uuid) limit 1`,
      [monday, wash(), hatch()],
    );
    expect(new Date(r.rows[0].starts_at).toISOString()).toBe(local(monday, "08:00"));
    expect(new Date(r.rows[0].ends_at).toISOString()).toBe(local(monday, "08:40"));
  });

  it("serviço seguinte de 2h pode começar 08:40 quando o anterior ocupa 08:00–08:40", async () => {
    await book(pool, bookingPayload({ service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "08:00") }));
    const free = await slots(pool, monday, leather(), hatch());
    expect(free[0]).toBe("08:40"); // encaixa logo após o término
    expect(free[1]).toBe("08:45"); // depois segue a grade de 15 min
    expect(free).not.toContain("08:30");
  });

  it("um serviço de 40 min pode começar 10:40 e terminar 11:20 (exemplo do SPEC)", async () => {
    await book(pool, bookingPayload({ service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "08:00") }));
    await book(pool, bookingPayload({ service_ids: leather(), vehicle_category_id: hatch(), starts_at: local(monday, "08:40") }));
    // 08:00–10:40 ocupado; próximo encaixe de 40 min às 10:40.
    const free = await slots(pool, monday, wash(), hatch());
    expect(free).toContain("10:40");
    expect(free).not.toContain("10:30");
  });

  it("serviço que ultrapassa o fechamento não aparece (limite do dia)", async () => {
    const free = await slots(pool, monday, leather(), hatch());
    expect(free.at(-1)).toBe("16:00"); // 16:00 + 2h = 18:00
    expect(free).not.toContain("16:15");
  });

  it("domingo não oferece horários", async () => {
    expect(await slots(pool, sunday, wash(), hatch())).toEqual([]);
  });

  it("sábado respeita 12:00 como encerramento", async () => {
    const free = await slots(pool, saturday, wash(), hatch());
    expect(free[0]).toBe("08:00");
    expect(free.at(-1)).toBe("11:15"); // 11:15 + 40 = 11:55; 11:30 + 40 = 12:10
    expect(await slots(pool, saturday, [S.service["polimento-tecnico"]], hatch())).toEqual([]);
  });

  it("vários serviços somam as durações", async () => {
    const free = await slots(pool, monday, [...wash(), ...leather()], hatch()); // 160 min
    expect(free.at(-1)).toBe("15:15"); // 15:15 + 2h40 = 17:55
  });

  it("não oferece datas fora da janela de antecedência", async () => {
    const far = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
    expect(await slots(pool, far, wash(), hatch())).toEqual([]);
  });

  it("serviço com agendamento pelo WhatsApp não pode ser reservado online", async () => {
    await expect(slots(pool, monday, [S.service.vitrificacao], hatch())).rejects.toThrow(/invalid_services/);
  });
});

describe("bloqueio da agenda por status", () => {
  it("reserva pending bloqueia o horário", async () => {
    await book(pool, bookingPayload({ service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "09:00") }));
    const free = await slots(pool, monday, wash(), hatch());
    expect(free).not.toContain("09:00");
    expect(free).not.toContain("08:30"); // 08:30–09:10 sobreporia
    expect(free).toContain("08:15"); // 08:15–08:55 cabe
    expect(free).toContain("09:45");
  });

  it("reserva rejected ou cancelled libera o horário", async () => {
    const code = await book(pool, bookingPayload({ service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "09:00") }));
    const { rows } = await pool.query<{ id: string }>(`select id from public.appointments where public_code = $1`, [code]);
    await asRole(pool, "owner", `select public.owner_update_appointment_status($1, 'rejected', 'teste')`, [rows[0].id]);
    expect(await slots(pool, monday, wash(), hatch())).toContain("09:00");

    const code2 = await book(pool, bookingPayload({ service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "09:00") }));
    const r2 = await pool.query<{ id: string }>(`select id from public.appointments where public_code = $1`, [code2]);
    await asRole(pool, "owner", `select public.owner_update_appointment_status($1, 'cancelled', '')`, [r2.rows[0].id]);
    expect(await slots(pool, monday, wash(), hatch())).toContain("09:00");
  });

  it("bloqueio impede reserva", async () => {
    await asRole(pool, "owner", `select public.owner_create_block($1, $2, 'Manutenção')`, [
      local(monday, "10:00"),
      local(monday, "12:00"),
    ]);
    const free = await slots(pool, monday, wash(), hatch());
    expect(free).not.toContain("10:00");
    expect(free).not.toContain("09:30"); // 09:30–10:10 invade
    expect(free).toContain("12:00");
    await expect(
      book(pool, bookingPayload({ service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "10:30") })),
    ).rejects.toThrow(/slot_unavailable/);
  });

  it("concluir antes do previsto não deixa registro antigo bloqueando", async () => {
    const code = await book(pool, bookingPayload({ service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "09:00") }));
    const { rows } = await pool.query<{ id: string }>(`select id from public.appointments where public_code = $1`, [code]);
    await asRole(pool, "owner", `select public.owner_update_appointment_status($1, 'confirmed')`, [rows[0].id]);
    await asRole(pool, "owner", `select public.owner_update_appointment_status($1, 'completed')`, [rows[0].id]);
    expect(await slots(pool, monday, wash(), hatch())).toContain("09:00");
  });
});

describe("criação atômica", () => {
  it("revalida no servidor: horário fora do expediente é recusado", async () => {
    await expect(
      book(pool, bookingPayload({ service_ids: leather(), vehicle_category_id: hatch(), starts_at: local(monday, "16:30") })),
    ).rejects.toThrow(/slot_unavailable/);
  });

  it("duas requisições concorrentes para o mesmo período: somente uma é aceita", async () => {
    const attempts = Array.from({ length: 6 }, (_, i) =>
      book(
        pool,
        bookingPayload({
          service_ids: leather(),
          vehicle_category_id: hatch(),
          // Intervalos diferentes, porém sobrepostos (10:00–12:00 e 10:15–12:15 ...).
          starts_at: local(monday, i % 2 === 0 ? "10:00" : "10:15"),
        }),
      ),
    );
    const results = await Promise.allSettled(attempts);
    const ok = results.filter((r) => r.status === "fulfilled");
    const fail = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    expect(ok).toHaveLength(1);
    for (const f of fail) expect(String(f.reason)).toMatch(/slot_unavailable/);
    const { rows } = await pool.query(`select count(*)::int as n from public.appointments`);
    expect(rows[0].n).toBe(1);
  });

  it("limite de reservas pendentes por telefone", async () => {
    const phone = "(49) 99999-0000";
    await book(pool, bookingPayload({ phone, service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "08:00") }));
    await book(pool, bookingPayload({ phone, service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "09:00") }));
    await expect(
      book(pool, bookingPayload({ phone, service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "10:00") })),
    ).rejects.toThrow(/too_many_pending/);
  });

  it("honeypot preenchido é recusado", async () => {
    await expect(
      book(pool, bookingPayload({ website: "http://spam", service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "08:00") })),
    ).rejects.toThrow(/invalid_request/);
  });

  it("telefone inválido é recusado e válido é normalizado para E.164", async () => {
    await expect(
      book(pool, bookingPayload({ phone: "123", service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "08:00") })),
    ).rejects.toThrow(/invalid_phone/);
    const code = await book(pool, bookingPayload({ phone: "49 99123-4567", service_ids: wash(), vehicle_category_id: hatch(), starts_at: local(monday, "08:00") }));
    const { rows } = await pool.query(`select customer_phone_snapshot from public.appointments where public_code = $1`, [code]);
    expect(rows[0].customer_phone_snapshot).toBe("+5549991234567");
  });

  it("preço e duração vêm do banco, não do navegador", async () => {
    const code = await book(
      pool,
      bookingPayload({
        service_ids: wash(),
        vehicle_category_id: S.category.suv,
        starts_at: local(monday, "08:00"),
        reference_total: 1, // campo ignorado
        ends_at: local(monday, "08:05"), // campo ignorado
      }),
    );
    const { rows } = await pool.query(`select reference_total, ends_at from public.appointments where public_code = $1`, [code]);
    expect(Number(rows[0].reference_total)).toBe(65);
    expect(new Date(rows[0].ends_at).toISOString()).toBe(local(monday, "08:40"));
  });

  it("categoria sob avaliação não tem preço de referência", async () => {
    const code = await book(pool, bookingPayload({ service_ids: wash(), vehicle_category_id: S.category.outros, starts_at: local(monday, "08:00") }));
    const r = await asRole<{ r: { reference_total: number | null; is_estimate: boolean } }>(
      pool, "anon", `select public.get_public_appointment($1) as r`, [code],
    );
    expect(r.rows[0].r.reference_total).toBeNull();
    expect(r.rows[0].r.is_estimate).toBe(true);
  });
});

describe("painel: reagendamento, bloqueios e histórico", () => {
  async function bookedId(start: string, services = wash()) {
    const code = await book(pool, bookingPayload({ service_ids: services, vehicle_category_id: hatch(), starts_at: local(monday, start) }));
    const { rows } = await pool.query<{ id: string }>(`select id from public.appointments where public_code = $1`, [code]);
    return rows[0].id;
  }

  it("reagendamento verifica conflitos", async () => {
    const a = await bookedId("08:00");
    await bookedId("10:00");
    await expect(
      asRole(pool, "owner", `select public.owner_reschedule_appointment($1, $2)`, [a, local(monday, "09:45")]),
    ).rejects.toThrow(/slot_unavailable/);
    await asRole(pool, "owner", `select public.owner_reschedule_appointment($1, $2)`, [a, local(monday, "11:00")]);
    const { rows } = await pool.query(`select ends_at from public.appointments where id = $1`, [a]);
    expect(new Date(rows[0].ends_at).toISOString()).toBe(local(monday, "11:40"));
  });

  it("mudança de duração no catálogo não altera reservas antigas", async () => {
    const a = await bookedId("08:00");
    await pool.query(`update public.services set duration_minutes = 90 where slug = 'lavagem-simples'`);
    const { rows } = await pool.query(
      `select a.ends_at, i.duration_minutes_snapshot from public.appointments a join public.appointment_items i on i.appointment_id = a.id where a.id = $1`,
      [a],
    );
    expect(rows[0].duration_minutes_snapshot).toBe(40);
    expect(new Date(rows[0].ends_at).toISOString()).toBe(local(monday, "08:40"));
    await asRole(pool, "owner", `select public.owner_reschedule_appointment($1, $2)`, [a, local(monday, "13:00")]);
    const r2 = await pool.query(`select ends_at from public.appointments where id = $1`, [a]);
    expect(new Date(r2.rows[0].ends_at).toISOString()).toBe(local(monday, "13:40"));
    await pool.query(`update public.services set duration_minutes = 40 where slug = 'lavagem-simples'`);
  });

  it("bloqueio sobre reservas exige resolver todas; sem isso nada é criado", async () => {
    const a = await bookedId("09:00");
    const b = await bookedId("10:00");
    await expect(
      asRole(pool, "owner", `select public.owner_create_block($1, $2, 'Feriado', $3::jsonb)`, [
        local(monday, "08:00"), local(monday, "12:00"),
        JSON.stringify([{ appointment_id: a, action: "cancel" }]),
      ]),
    ).rejects.toThrow(/block_conflicts/);
    const none = await pool.query(`select count(*)::int as n from public.blocked_periods`);
    expect(none.rows[0].n).toBe(0);
    const st = await pool.query(`select status from public.appointments where id = $1`, [a]);
    expect(st.rows[0].status).toBe("pending"); // cancelamento também foi desfeito

    await asRole(pool, "owner", `select public.owner_create_block($1, $2, 'Feriado', $3::jsonb)`, [
      local(monday, "08:00"), local(monday, "12:00"),
      JSON.stringify([
        { appointment_id: a, action: "cancel" },
        { appointment_id: b, action: "reschedule", new_start: local(monday, "14:00") },
      ]),
    ]);
    const after = await pool.query(`select id, status, starts_at from public.appointments order by starts_at`);
    expect(after.rows.find((r) => r.id === a)?.status).toBe("cancelled");
    expect(new Date(after.rows.find((r) => r.id === b)?.starts_at).toISOString()).toBe(local(monday, "14:00"));
  });

  it("transições de status inválidas são recusadas e o histórico é gravado", async () => {
    const a = await bookedId("08:00");
    await expect(
      asRole(pool, "owner", `select public.owner_update_appointment_status($1, 'completed')`, [a]),
    ).rejects.toThrow(/invalid_transition/);
    await asRole(pool, "owner", `select public.owner_update_appointment_status($1, 'confirmed', 'ok pelo whats')`, [a]);
    const h = await pool.query(`select kind, old_value, new_value from public.appointment_history where appointment_id = $1 order by created_at`, [a]);
    expect(h.rows.map((r) => r.kind)).toEqual(["created", "status"]);
    expect(h.rows[1]).toMatchObject({ old_value: "pending", new_value: "confirmed" });
  });
});
