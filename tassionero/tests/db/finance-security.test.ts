import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type pg from "pg";
import { asRole, book, bookingPayload, ids, local, newPool, nextWeekday, resetData } from "./helpers";

let pool: pg.Pool;
let S: Awaited<ReturnType<typeof ids>>;
const monday = nextWeekday(1);

beforeAll(async () => {
  pool = newPool();
  S = await ids(pool);
});
afterAll(async () => pool.end());
beforeEach(async () => resetData(pool));

async function newAppointment(start = "08:00") {
  const code = await book(
    pool,
    bookingPayload({ service_ids: [S.service["lavagem-detalhada"]], vehicle_category_id: S.category.sedan, starts_at: local(monday, start) }),
  );
  const { rows } = await pool.query<{ id: string }>(`select id from public.appointments where public_code = $1`, [code]);
  return { id: rows[0].id, code };
}

async function incomeTotal() {
  const { rows } = await pool.query(`select coalesce(sum(amount), 0)::numeric as n from public.transactions where type = 'income'`);
  return Number(rows[0].n);
}

async function appt(id: string) {
  const { rows } = await pool.query(`select * from public.appointments where id = $1`, [id]);
  return rows[0];
}

describe("financeiro", () => {
  it("criar e confirmar reserva não gera receita", async () => {
    const a = await newAppointment();
    expect(await incomeTotal()).toBe(0);
    await asRole(pool, "owner", `select public.owner_update_appointment_status($1, 'confirmed')`, [a.id]);
    expect(await incomeTotal()).toBe(0);
    expect((await appt(a.id)).payment_status).toBe("unpaid");
  });

  it("registrar pagamento gera entrada; parcial não quita", async () => {
    const a = await newAppointment();
    await asRole(pool, "owner", `select public.owner_update_appointment_status($1, 'confirmed')`, [a.id]);
    await asRole(pool, "owner", `select public.owner_update_final_price($1, 120, null, 'avaliado')`, [a.id]);
    await asRole(pool, "owner", `select public.owner_register_payment($1, 50, 'pix')`, [a.id]);
    expect(await incomeTotal()).toBe(50);
    let row = await appt(a.id);
    expect(row.payment_status).toBe("partially_paid");
    expect(Number(row.amount_paid)).toBe(50);
    await asRole(pool, "owner", `select public.owner_register_payment($1, 70, 'cash')`, [a.id]);
    row = await appt(a.id);
    expect(row.payment_status).toBe("paid");
  });

  it("preço final personalizado não altera o catálogo e fica no histórico", async () => {
    const a = await newAppointment();
    const before = await pool.query(`select price from public.service_category_prices where service_id = $1 and vehicle_category_id = $2`, [
      S.service["lavagem-detalhada"], S.category.sedan,
    ]);
    await asRole(pool, "owner", `select public.owner_update_final_price($1, 150, null, 'carro muito sujo')`, [a.id]);
    const after = await pool.query(`select price from public.service_category_prices where service_id = $1 and vehicle_category_id = $2`, [
      S.service["lavagem-detalhada"], S.category.sedan,
    ]);
    expect(after.rows[0].price).toBe(before.rows[0].price);
    const row = await appt(a.id);
    expect(Number(row.final_total)).toBe(150);
    expect(Number(row.reference_total)).toBe(100);
    const h = await pool.query(`select new_value, note from public.appointment_history where appointment_id = $1 and kind = 'price'`, [a.id]);
    expect(h.rows[0]).toMatchObject({ new_value: "150", note: "carro muito sujo" });
  });

  it("despesa reduz o resultado operacional", async () => {
    const a = await newAppointment();
    await asRole(pool, "owner", `select public.owner_register_payment($1, 100, 'pix', $2)`, [a.id, new Date().toISOString()]);
    await asRole(
      pool, "owner",
      `insert into public.transactions (type, description, category, amount, payment_method, status, paid_at)
       values ('expense', 'Shampoo automotivo', 'Produtos', 30, 'pix', 'paid', now())`,
    );
    const from = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const to = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
    const r = await asRole<{ d: { income_paid: number; expenses_paid: number } }>(pool, "owner", `select public.owner_dashboard($1, $2) as d`, [from, to]);
    expect(Number(r.rows[0].d.income_paid) - Number(r.rows[0].d.expenses_paid)).toBe(70);
  });

  it("cancelar reserva não apaga transações; estorno é explícito", async () => {
    const a = await newAppointment();
    await asRole(pool, "owner", `select public.owner_register_payment($1, 40, 'pix')`, [a.id]);
    await asRole(pool, "owner", `select public.owner_update_appointment_status($1, 'cancelled')`, [a.id]);
    expect(await incomeTotal()).toBe(40);
    await asRole(pool, "owner", `select public.owner_register_refund($1, 40, 'pix')`, [a.id]);
    expect((await appt(a.id)).payment_status).toBe("refunded");
    expect(await incomeTotal()).toBe(40); // entrada original preservada
  });
});

describe("segurança", () => {
  it("visitante não lê reservas, clientes, veículos, transações nem configurações privadas", async () => {
    await newAppointment();
    for (const table of ["appointments", "customers", "vehicles", "transactions", "business_settings", "appointment_items", "blocked_periods", "profiles"]) {
      await expect(asRole(pool, "anon", `select * from public.${table}`), table).rejects.toThrow(/permission denied/);
    }
  });

  it("visitante não insere reserva direto na tabela", async () => {
    await expect(
      asRole(pool, "anon", `insert into public.customers (name, phone) values ('X', '+5549999999999')`),
    ).rejects.toThrow(/permission denied/);
  });

  it("visitante não executa operações do proprietário", async () => {
    const a = await newAppointment();
    await expect(
      asRole(pool, "anon", `select public.owner_update_appointment_status($1, 'confirmed')`, [a.id]),
    ).rejects.toThrow(/permission denied/);
    await expect(asRole(pool, "anon", `select public.owner_dashboard(current_date, current_date + 1)`)).rejects.toThrow(/permission denied/);
  });

  it("usuário autenticado que não é o proprietário não lê nem altera dados", async () => {
    const a = await newAppointment();
    const r = await asRole(pool, "stranger", `select * from public.appointments`);
    expect(r.rows).toHaveLength(0);
    const c = await asRole(pool, "stranger", `select * from public.customers`);
    expect(c.rows).toHaveLength(0);
    await expect(
      asRole(pool, "stranger", `select public.owner_update_appointment_status($1, 'confirmed')`, [a.id]),
    ).rejects.toThrow(/not_authorized/);
    await expect(
      asRole(pool, "stranger", `update public.services set base_price = 1 where slug = 'limpeza-de-motor' returning id`),
    ).resolves.toMatchObject({ rowCount: 0 });
  });

  it("proprietário administra os dados", async () => {
    await newAppointment();
    const r = await asRole(pool, "owner", `select * from public.appointments`);
    expect(r.rows).toHaveLength(1);
    const c = await asRole(pool, "owner", `select * from public.customers`);
    expect(c.rows).toHaveLength(1);
  });

  it("proprietário não altera status direto na tabela (só via funções validadas)", async () => {
    const a = await newAppointment();
    await expect(
      asRole(pool, "owner", `update public.appointments set status = 'completed' where id = $1`, [a.id]),
    ).rejects.toThrow(/permission denied/);
    await asRole(pool, "owner", `update public.appointments set internal_notes = 'cliente pediu cera' where id = $1`, [a.id]);
  });

  it("visitante lê só o catálogo ativo e a galeria publicada", async () => {
    await pool.query(`update public.services set is_active = false where slug = 'limpeza-de-motor'`);
    const s = await asRole<{ slug: string }>(pool, "anon", `select slug from public.services`);
    expect(s.rows.map((r) => r.slug)).not.toContain("limpeza-de-motor");
    await pool.query(`update public.services set is_active = true where slug = 'limpeza-de-motor'`);
  });

  it("chave Pix só aparece no resumo de pedido com Pix", async () => {
    const pix = await newAppointment("08:00");
    const cash = await book(pool, bookingPayload({ payment_method: "cash", service_ids: [S.service["lavagem-simples"]], vehicle_category_id: S.category.hatch, starts_at: local(monday, "13:00") }));
    const a = await asRole<{ r: { pix: unknown } }>(pool, "anon", `select public.get_public_appointment($1) as r`, [pix.code]);
    const b = await asRole<{ r: { pix: unknown } }>(pool, "anon", `select public.get_public_appointment($1) as r`, [cash]);
    expect(a.rows[0].r.pix).toMatchObject({ key: "tassionero@exemplo.com" });
    expect(b.rows[0].r.pix).toBeNull();
    const info = await asRole<{ r: Record<string, unknown> }>(pool, "anon", `select public.get_public_business_info() as r`);
    expect(JSON.stringify(info.rows[0].r)).not.toContain("tassionero@exemplo.com");
  });
});
