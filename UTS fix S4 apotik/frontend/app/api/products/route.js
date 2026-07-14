import { getDb } from "../../../lib/mongo";

export async function GET() {
  const db = await getDb();
  const data = await db.collection("produks").find().toArray();
  const normalized = data.map((item) => ({
    ...item,
    _id: item._id?.toString(),
  }));

  return Response.json(normalized);
}