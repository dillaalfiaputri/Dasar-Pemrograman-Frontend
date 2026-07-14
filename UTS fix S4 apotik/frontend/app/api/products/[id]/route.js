import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongo";

export async function GET(req, { params }) {
  const { id } = await params;
  const db = await getDb();
  const product = await db
    .collection("produks")
    .findOne({ _id: new ObjectId(id) });
  if (!product) {
    return Response.json({ message: "Product not found" }, { status: 404 });
  }
  product._id = product._id.toString();
  return Response.json(product);
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const db = await getDb();
  const body = await req.json();
  const payload = { ...body };
  delete payload._id;
  await db
    .collection("produks")
    .updateOne({ _id: new ObjectId(id) }, { $set: payload });
  const updated = await db
    .collection("produks")
    .findOne({ _id: new ObjectId(id) });
  if (!updated) {
    return Response.json({ message: "Product not found" }, { status: 404 });
  }
  updated._id = updated._id.toString();

  return Response.json(updated);
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const db = await getDb();
  await db.collection("produks").deleteOne({ _id: new ObjectId(id) });

  return Response.json({ message: "Deleted" });
}