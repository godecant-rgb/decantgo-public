import { NextResponse } from "next/server";

function parseUsers(raw: string) {
  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [username, password] = pair.split(":");
      return {
        username: String(username || "").trim(),
        password: String(password || "").trim(),
      };
    })
    .filter((u) => u.username && u.password);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "").trim();

    const rawUsers = process.env.SOCIOS_USERS;

    if (!rawUsers) {
      return NextResponse.json(
        { error: "Falta SOCIOS_USERS en el entorno." },
        { status: 500 }
      );
    }

    const users = parseUsers(rawUsers);
    const matchedUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!matchedUser) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true, user: matchedUser.username });

    response.cookies.set("socios_auth", "ok", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    response.cookies.set("socios_user", matchedUser.username, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "No se pudo iniciar sesión.",
        detail: error?.message ?? "Error desconocido",
      },
      { status: 500 }
    );
  }
}
