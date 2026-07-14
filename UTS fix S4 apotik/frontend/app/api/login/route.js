import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongo';

export async function POST(req) {
  try {
    const db = await getDb();

    const { username, password } = await req.json();

    const user = await db.collection("users").findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    if (password !== user.password) {
      return NextResponse.json(
        { message: 'Password salah' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      username: user.username,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.log("ERROR LOGIN:", error);

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}