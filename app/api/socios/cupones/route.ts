import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CouponPayload = {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number | string;
  active?: boolean;
  usage_limit?: number | string | null;
  expires_at?: string | null;
  first_purchase_only?: boolean;
  assigned_to?: string | null;
  notes?: string | null;
};

function toNullableString(value: unknown) {
  const v = String(value ?? "").trim();
  return v.length ? v : null;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "No se pudieron cargar los cupones.", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, coupons: data ?? [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error interno.", detail: error?.message ?? "Error desconocido" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = (await req.json()) as CouponPayload;

    const code = String(body.code ?? "").trim().toUpperCase();
    const discount_type = body.discount_type;
    const discount_value = Number(body.discount_value);

    if (!code) {
      return NextResponse.json({ error: "El código es obligatorio." }, { status: 400 });
    }

    if (discount_type !== "percent" && discount_type !== "fixed") {
      return NextResponse.json(
        { error: "Tipo de descuento inválido." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(discount_value) || discount_value <= 0) {
      return NextResponse.json(
        { error: "El valor del descuento debe ser mayor a 0." },
        { status: 400 }
      );
    }

    const payload = {
      code,
      discount_type,
      discount_value,
      active: typeof body.active === "boolean" ? body.active : true,
      usage_limit: toNullableNumber(body.usage_limit),
      expires_at: toNullableString(body.expires_at),
      first_purchase_only:
        typeof body.first_purchase_only === "boolean" ? body.first_purchase_only : false,
      assigned_to: toNullableString(body.assigned_to),
      notes: toNullableString(body.notes),
    };

    const { data, error } = await supabase
      .from("coupons")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo crear el cupón.", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      coupon: data,
      message: "Cupón creado correctamente.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error interno.", detail: error?.message ?? "Error desconocido" },
      { status: 500 }
    );
  }
}