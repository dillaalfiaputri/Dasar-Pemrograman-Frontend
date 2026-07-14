// app/api/login/route.js
import connectDB from "../../lib/mongo";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return Response.json({ message: "User tidak ditemukan" }, { status: 404 });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return Response.json({ message: "Password salah" }, { status: 400 });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    "SECRET_KEY",
    { expiresIn: "1d" }
  );

  return Response.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}