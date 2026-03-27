import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PerfumeRow = {
  id: string;
  perfume: string;
  marca: string | null;
  categoria: string | null;
  genero: string | null;
  ocasion: string | null;
  estacion: string | null;
  intensidad: string | null;
  perfil: string | null;
  etiquetas_ia: string | null;
  precio_5ml: number | null;
  precio_10ml: number | null;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scorePerfume(userMessage: string, perfume: PerfumeRow) {
  const q = normalize(userMessage);

  let score = 0;

  const fields = [
    perfume.perfume,
    perfume.marca,
    perfume.categoria,
    perfume.genero,
    perfume.ocasion,
    perfume.estacion,
    perfume.intensidad,
    perfume.perfil,
    perfume.etiquetas_ia,
  ]
    .filter(Boolean)
    .join(" ");

  const hay = normalize(fields);

  const keywords = q.split(/\s+/).filter((w) => w.length > 2);

  for (const word of keywords) {
    if (hay.includes(word)) score += 2;
  }

  if (q.includes("hombre") && normalize(perfume.genero || "") === "hombre") score += 4;
  if (q.includes("mujer") && normalize(perfume.genero || "") === "mujer") score += 4;
  if (q.includes("unisex") && normalize(perfume.genero || "") === "unisex") score += 4;

  if (q.includes("noche") && normalize(perfume.ocasion || "").includes("noche")) score += 4;
  if (q.includes("diario") && normalize(perfume.ocasion || "").includes("diario")) score += 4;
  if (q.includes("cita") && normalize(perfume.ocasion || "").includes("cita")) score += 4;
  if (q.includes("oficina") && normalize(perfume.ocasion || "").includes("oficina")) score += 4;
  if (q.includes("verano") && normalize(perfume.estacion || "").includes("verano")) score += 4;
  if (q.includes("invierno") && normalize(perfume.estacion || "").includes("invierno")) score += 4;

  if (q.includes("suave") && normalize(perfume.intensidad || "").includes("suave")) score += 3;
  if (q.includes("media") && normalize(perfume.intensidad || "").includes("media")) score += 3;
  if (q.includes("alta") && normalize(perfume.intensidad || "").includes("alta")) score += 3;
  if (q.includes("intenso") && normalize(perfume.intensidad || "").includes("alta")) score += 3;

  return score;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Falta el mensaje del usuario." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Falta OPENAI_API_KEY en el entorno." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { data, error } = await supabase
      .from("public_products")
      .select(`
        id,
        perfume,
        marca,
        categoria,
        genero,
        ocasion,
        estacion,
        intensidad,
        perfil,
        etiquetas_ia,
        precio_5ml,
        precio_10ml
      `)
      .eq("activo", true)
      .order("perfume", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "No se pudo leer el catálogo.", detail: error.message },
        { status: 500 }
      );
    }

    const perfumes = (data || []) as PerfumeRow[];

    const ranked = perfumes
      .map((p) => ({
        ...p,
        _score: scorePerfume(message, p),
      }))
      .sort((a, b) => b._score - a._score);

    const candidates = ranked.slice(0, 8).map(({ _score, ...rest }) => rest);

    const systemPrompt = `
Sos un asesor experto de perfumes para una tienda llamada Decant Go.
Tu trabajo es recomendar SOLO perfumes que existan en el catálogo recibido.
No inventes productos.
No menciones perfumes que no estén en la lista.
Respondé en español, de forma premium pero simple.
Recomendá 2 o 3 opciones como máximo.
Explicá brevemente por qué encajan con lo que busca el cliente.
Si la coincidencia es débil, decilo con honestidad.
Si sirve, mencioná ocasión, estación, intensidad, perfil y etiquetas.
Terminá con una invitación breve a elegir entre 5 ml o 10 ml.
`;

    const userPrompt = `
Consulta del cliente:
"${message}"

Perfumes candidatos del catálogo:
${JSON.stringify(candidates, null, 2)}
`;

    const response = await openai.responses.create({
      model: "gpt-5-chat-latest",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_output_tokens: 500,
    });

    const text = response.output_text?.trim();

    return NextResponse.json({
      reply:
        text ||
        "Encontré algunas opciones del catálogo, pero no pude generar la recomendación final.",
      candidates,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Error interno del asistente.",
        detail: err?.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}