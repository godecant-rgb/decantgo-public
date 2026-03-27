import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type PurchasePayload = {
  perfume: string;
  marca?: string | null;
  categoria?: string | null;
  genero?: string | null;
  ml_bottle?: number | string | null;
  quantity_bottles?: number | string | null;
  unit_cost?: number | string | null;
  supplier?: string | null;
  notes?: string | null;
  purchased_at?: string | null;
  foto_url?: string | null;
  precio_5ml?: number | string | null;
  precio_10ml?: number | string | null;
  activo?: boolean | null;
  destacado?: boolean | null;
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

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase en el servidor." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = (await req.json()) as PurchasePayload;

    const perfume = String(body.perfume ?? "").trim();
    if (!perfume) {
      return NextResponse.json(
        { error: "El nombre del perfume es obligatorio." },
        { status: 400 }
      );
    }

    const marca = toNullableString(body.marca);
    const categoria = toNullableString(body.categoria);
    const genero = toNullableString(body.genero);
    const supplier = toNullableString(body.supplier);
    const notes = toNullableString(body.notes);
    const foto_url = toNullableString(body.foto_url);

    const ml_bottle = toNullableNumber(body.ml_bottle);
    const quantity_bottles = Number(body.quantity_bottles ?? 1);
    const unit_cost = toNullableNumber(body.unit_cost);
    const precio_5ml = toNullableNumber(body.precio_5ml);
    const precio_10ml = toNullableNumber(body.precio_10ml);

    const activo = typeof body.activo === "boolean" ? body.activo : true;
    const destacado = typeof body.destacado === "boolean" ? body.destacado : false;

    const purchased_at =
      toNullableString(body.purchased_at) ??
      new Date().toISOString().slice(0, 10);

    if (!ml_bottle || ml_bottle <= 0) {
      return NextResponse.json(
        { error: "Los ml de la botella deben ser mayores a 0." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(quantity_bottles) || quantity_bottles <= 0) {
      return NextResponse.json(
        { error: "La cantidad de botellas debe ser mayor a 0." },
        { status: 400 }
      );
    }

    const mlCompra = ml_bottle * quantity_bottles;
    const costoPorMl = unit_cost !== null && ml_bottle > 0 ? unit_cost / ml_bottle : null;

    const { data: existingRows, error: existingError } = await supabase
      .from("public_products")
      .select("*");

    if (existingError) {
      return NextResponse.json(
        { error: "No se pudo consultar el catálogo.", detail: existingError.message },
        { status: 500 }
      );
    }

    const existingProduct =
      (existingRows ?? []).find(
        (row: any) => normalizeName(row.perfume || "") === normalizeName(perfume)
      ) ?? null;

    let productId: string | null = null;
    let action: "created" | "updated" = "created";

    if (existingProduct) {
      productId = existingProduct.id;
      action = "updated";

      const updatePayload: Record<string, any> = {
        ml_total: Number(existingProduct.ml_total ?? 0) + mlCompra,
        ml_disponible: Number(existingProduct.ml_disponible ?? 0) + mlCompra,
      };

      if (!existingProduct.marca && marca) updatePayload.marca = marca;
      if (!existingProduct.categoria && categoria) updatePayload.categoria = categoria;
      if (!existingProduct.genero && genero) updatePayload.genero = genero;
      if (!existingProduct.foto_url && foto_url) updatePayload.foto_url = foto_url;
      if (precio_5ml !== null) updatePayload.precio_5ml = precio_5ml;
      if (precio_10ml !== null) updatePayload.precio_10ml = precio_10ml;
      if (unit_cost !== null) updatePayload.costo_ref = unit_cost;
      if (costoPorMl !== null) updatePayload.costo_por_ml = costoPorMl;
      if (typeof body.activo === "boolean") updatePayload.activo = activo;
      if (typeof body.destacado === "boolean") updatePayload.destacado = destacado;

      const { error: updateError } = await supabase
        .from("public_products")
        .update(updatePayload)
        .eq("id", existingProduct.id);

      if (updateError) {
        return NextResponse.json(
          { error: "No se pudo actualizar el producto.", detail: updateError.message },
          { status: 500 }
        );
      }
    } else {
      const insertProductPayload = {
        perfume,
        marca,
        categoria,
        genero,
        foto_url,
        precio_5ml,
        precio_10ml,
        activo,
        destacado,
        ml_total: mlCompra,
        ml_disponible: mlCompra,
        costo_ref: unit_cost,
        costo_por_ml: costoPorMl,
      };

      const { data: insertedProduct, error: insertProductError } = await supabase
        .from("public_products")
        .insert(insertProductPayload)
        .select("id, perfume")
        .single();

      if (insertProductError || !insertedProduct) {
        return NextResponse.json(
          {
            error: "No se pudo crear el producto en el catálogo.",
            detail: insertProductError?.message ?? "Sin detalle",
          },
          { status: 500 }
        );
      }

      productId = insertedProduct.id;
    }

    const purchasePayload = {
      product_id: productId,
      perfume,
      marca,
      categoria,
      genero,
      ml_bottle,
      quantity_bottles,
      unit_cost,
      supplier,
      notes,
      purchased_at,
    };

    const { data: insertedPurchase, error: purchaseError } = await supabase
      .from("product_purchases")
      .insert(purchasePayload)
      .select("*")
      .single();

    if (purchaseError) {
      return NextResponse.json(
        { error: "No se pudo guardar la compra.", detail: purchaseError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      action,
      product_id: productId,
      purchase: insertedPurchase,
      ml_compra: mlCompra,
      costo_por_ml: costoPorMl,
      message:
        action === "created"
          ? "Perfume creado y compra registrada correctamente."
          : "Compra registrada, stock actualizado y costo por ml recalculado.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error interno al guardar la compra.",
        detail: error?.message ?? "Error desconocido",
      },
      { status: 500 }
    );
  }
}