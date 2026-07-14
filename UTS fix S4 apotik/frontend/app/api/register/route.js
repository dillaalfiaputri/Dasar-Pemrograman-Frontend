import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongo";

export async function POST(req) {
  try {
    const db = await getDb();
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Username, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });
    if (existing) {
      return NextResponse.json(
        { message: "Username atau email sudah terdaftar" },
        { status: 400 }
      );
    }

    await db.collection("users").insertOne({
      username,
      email,
      password,
      role: "user",
    });

    return NextResponse.json({ message: "Register berhasil" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
