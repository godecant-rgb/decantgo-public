import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CheckoutItem = {
  product: {
    id: string;
    perfume: string;
  };
  presentacion: "5ml" | "10ml" | string;
  cantidad: number;
  precio: number;
};

type CheckoutBody = {
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  customerNotes: string;
  subtotal: number;
  discountAmount: number;
  totalFinal: number;
  couponCode?: string | null;
  items: CheckoutItem[];
};

function toNullableString(value: unknown) {
  const v = String(value ?? "").trim();
  return v.length ? v : null;
}

function makeOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DG-${y}${m}${d}-${rand}`;
}

function getMlFromPresentacion(value: string) {
  const txt = String(value ?? "").toLowerCase().trim();

  if (txt.includes("10")) return 10;
  if (txt.includes("5")) return 5;

  return 0;
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
    const body = (await req.json()) as CheckoutBody;

    const items = Array.isArray(body.items) ? body.items : [];
    const customerName = String(body.customerName ?? "").trim();
    const customerPhone = String(body.customerPhone ?? "").trim();
    const customerCity = String(body.customerCity ?? "").trim();
    const customerAddress = String(body.customerAddress ?? "").trim();
    const customerNotes = String(body.customerNotes ?? "").trim();
    const subtotal = Number(body.subtotal ?? 0);
    const discountAmount = Number(body.discountAmount ?? 0);
    const totalFinal = Number(body.totalFinal ?? 0);
    const couponCode = String(body.couponCode ?? "").trim().toUpperCase();

    if (!items.length) {
      return NextResponse.json(
        { error: "El carrito está vacío." },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    if (!customerPhone) {
      return NextResponse.json(
        { error: "El teléfono es obligatorio." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json(
        { error: "Subtotal inválido." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(discountAmount) || discountAmount < 0) {
      return NextResponse.json(
        { error: "Descuento inválido." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(totalFinal) || totalFinal < 0) {
      return NextResponse.json(
        { error: "Total inválido." },
        { status: 400 }
      );
    }

    const orderNumber = makeOrderNumber();

    const orderPayload = {
      order_number: orderNumber,
      customer_name: customerName,
      phone: customerPhone,
      instagram: null,
      city: toNullableString(customerCity),
      channel: "web",
      status: "pendiente",
      subtotal,
      discount: discountAmount,
      shipping_cost: 0,
      total: totalFinal,
      notes: toNullableString(
        [
          customerNotes ? `Notas cliente: ${customerNotes}` : null,
          couponCode ? `Cupón: ${couponCode}` : null,
        ]
          .filter(Boolean)
          .join(" | ")
      ),
    };

    const { data: order, error: orderError } = await supabase
      .from("public_orders")
      .insert(orderPayload)
      .select("*")
      .single();

    if (orderError) {
      return NextResponse.json(
        {
          error: "No se pudo crear el pedido.",
          detail: orderError.message,
          where: "public_orders",
        },
        { status: 500 }
      );
    }

    const orderItemsPayload = items.map((item) => ({
      order_id: order.id,
      perfume_name: item.product.perfume,
      presentation: item.presentacion,
      quantity: Number(item.cantidad ?? 0),
      unit_price: Number(item.precio ?? 0),
      line_total: Number(item.cantidad ?? 0) * Number(item.precio ?? 0),
    }));

    const { error: itemsError } = await supabase
      .from("public_order_items")
      .insert(orderItemsPayload);

    if (itemsError) {
      return NextResponse.json(
        {
          error: "Se creó el pedido pero falló el detalle.",
          detail: itemsError.message,
          where: "public_order_items",
          orderId: order.id,
        },
        { status: 500 }
      );
    }

    // Descontar ml disponibles del stock vendido
    for (const item of items) {
      const productId = String(item?.product?.id ?? "").trim();
      const cantidad = Number(item?.cantidad ?? 0);
      const mlPorUnidad = getMlFromPresentacion(String(item?.presentacion ?? ""));
      const mlAVender = cantidad * mlPorUnidad;

      if (!productId || mlAVender <= 0) continue;

      const { data: productRow, error: productReadError } = await supabase
        .from("public_products")
        .select("id, ml_disponible")
        .eq("id", productId)
        .single();

      if (productReadError) {
        return NextResponse.json(
          {
            error: "No se pudo leer el stock del producto.",
            detail: productReadError.message,
            where: "public_products.read",
            productId,
          },
          { status: 500 }
        );
      }

      const mlActual = Number(productRow?.ml_disponible ?? 0);
      const nuevoMlDisponible = Math.max(0, mlActual - mlAVender);

      const { error: productUpdateError } = await supabase
        .from("public_products")
        .update({ ml_disponible: nuevoMlDisponible })
        .eq("id", productId);

      if (productUpdateError) {
        return NextResponse.json(
          {
            error: "No se pudo actualizar el stock del producto.",
            detail: productUpdateError.message,
            where: "public_products.update",
            productId,
          },
          { status: 500 }
        );
      }
    }

    const shippingPayload = {
      order_id: order.id,
      recipient_name: customerName,
      phone: customerPhone,
      address_line: toNullableString(customerAddress),
      city: toNullableString(customerCity),
      reference: null,
      notes: toNullableString(customerNotes),
    };

    const { error: shippingError } = await supabase
      .from("shipping_addresses")
      .insert(shippingPayload);

    if (shippingError) {
      return NextResponse.json(
        {
          error: "Se creó el pedido pero falló la dirección de envío.",
          detail: shippingError.message,
          where: "shipping_addresses",
          orderId: order.id,
        },
        { status: 500 }
      );
    }

    if (couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("id, used_count")
        .eq("code", couponCode)
        .maybeSingle();

      if (coupon?.id) {
        await supabase
          .from("coupons")
          .update({ used_count: Number(coupon.used_count ?? 0) + 1 })
          .eq("id", coupon.id);
      }
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.order_number,
      message: "Pedido creado correctamente.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error interno al crear el pedido.",
        detail: error?.message ?? "Error desconocido",
      },
      { status: 500 }
    );
  }
}