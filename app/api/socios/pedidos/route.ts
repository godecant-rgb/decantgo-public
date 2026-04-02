import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET() {
  try {
    const supabase = getAdminClient();

    const { data: orders, error: ordersError } = await supabase
      .from("public_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      return NextResponse.json(
        { error: "Error leyendo public_orders", detail: ordersError.message },
        { status: 500 }
      );
    }

    const { data: items, error: itemsError } = await supabase
      .from("public_order_items")
      .select("*")
      .order("created_at", { ascending: true });

    if (itemsError) {
      return NextResponse.json(
        { error: "Error leyendo public_order_items", detail: itemsError.message },
        { status: 500 }
      );
    }

    const { data: shipping, error: shippingError } = await supabase
      .from("shipping_addresses")
      .select("*")
      .order("created_at", { ascending: false });

    if (shippingError) {
      return NextResponse.json(
        { error: "Error leyendo shipping_addresses", detail: shippingError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orders: orders ?? [],
      items: items ?? [],
      shipping: shipping ?? [],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error interno al leer pedidos.",
        detail: error?.message ?? "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await req.json();

    const orderId = String(body.orderId ?? "").trim();
    const status = String(body.status ?? "").trim().toLowerCase();

    if (!orderId) {
      return NextResponse.json({ error: "Falta orderId." }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "Falta status." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("public_orders")
      .update({ status })
      .eq("id", orderId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo actualizar el estado.", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, order: data });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error interno al actualizar pedido.",
        detail: error?.message ?? "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(req.url);
    const orderId = String(searchParams.get("orderId") ?? "").trim();

    if (!orderId) {
      return NextResponse.json({ error: "Falta orderId." }, { status: 400 });
    }

    const { error: itemsError } = await supabase
      .from("public_order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) {
      return NextResponse.json(
        { error: "No se pudieron eliminar los items.", detail: itemsError.message },
        { status: 500 }
      );
    }

    const { error: shippingError } = await supabase
      .from("shipping_addresses")
      .delete()
      .eq("order_id", orderId);

    if (shippingError) {
      return NextResponse.json(
        { error: "No se pudo eliminar la dirección.", detail: shippingError.message },
        { status: 500 }
      );
    }

    const { error: orderError } = await supabase
      .from("public_orders")
      .delete()
      .eq("id", orderId);

    if (orderError) {
      return NextResponse.json(
        { error: "No se pudo eliminar el pedido.", detail: orderError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error interno al eliminar pedido.",
        detail: error?.message ?? "Error desconocido",
      },
      { status: 500 }
    );
  }
}