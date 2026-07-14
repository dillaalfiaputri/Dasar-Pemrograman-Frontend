// app/api/register/route.js
import connectDB from "../../lib/mongo";
import User from "../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();

  const { username, email, password } = await req.json();

  const existing = await User.findOne({ email });
  if (existing) {
    return Response.json({ message: "Email sudah terdaftar" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  return Response.json({ message: "Register berhasil", user });
}