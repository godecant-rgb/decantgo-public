import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ValidatePayload = {
  code: string;
  subtotal: number;
};

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

    const body = (await req.json()) as ValidatePayload;

    const code = String(body.code ?? "").trim().toUpperCase();
    const subtotal = Number(body.subtotal ?? 0);

    if (!code) {
      return NextResponse.json(
        { error: "Debes ingresar un código." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return NextResponse.json(
        { error: "Subtotal inválido." },
        { status: 400 }
      );
    }

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo validar el cupón.", detail: error.message },
        { status: 500 }
      );
    }

    if (!coupon) {
      return NextResponse.json(
        { error: "Cupón no encontrado." },
        { status: 404 }
      );
    }

    if (!coupon.active) {
      return NextResponse.json(
        { error: "Este cupón no está activo." },
        { status: 400 }
      );
    }

    if (
      coupon.expires_at &&
      new Date(coupon.expires_at).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "Este cupón ya venció." },
        { status: 400 }
      );
    }

    if (
      coupon.usage_limit !== null &&
      coupon.usage_limit !== undefined &&
      Number(coupon.used_count ?? 0) >= Number(coupon.usage_limit)
    ) {
      return NextResponse.json(
        { error: "Este cupón alcanzó su límite de uso." },
        { status: 400 }
      );
    }

    let discountAmount = 0;

    if (coupon.discount_type === "percent") {
      discountAmount = subtotal * (Number(coupon.discount_value) / 100);
    } else if (coupon.discount_type === "fixed") {
      discountAmount = Number(coupon.discount_value);
    }

    if (!Number.isFinite(discountAmount) || discountAmount < 0) {
      discountAmount = 0;
    }

    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    const total = subtotal - discountAmount;

    return NextResponse.json({
      ok: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        first_purchase_only: coupon.first_purchase_only,
      },
      subtotal,
      discount: discountAmount,
      total,
      message: "Cupón aplicado correctamente.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error interno al validar el cupón.",
        detail: error?.message ?? "Error desconocido",
      },
      { status: 500 }
    );
  }
}