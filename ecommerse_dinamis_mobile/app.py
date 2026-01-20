from flask import Flask, render_template, request, redirect, session, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from werkzeug.utils import secure_filename

APOTIK_LAT = -8.2314783
APOTIK_LNG = 114.3660722

app = Flask(__name__)
app.secret_key = "secret123"
UPLOAD_FOLDER = r"D:/Kuliah/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def allowed_file(filename):
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["apotik"]
products_collection = db["produks"]
users_collection = db["users"]

@app.route("/")
def index():
    products = list(products_collection.find())
    return render_template("index.html", products=products)

@app.route("/product/<id>")
def product_detail(id):
    product = products_collection.find_one({"_id": ObjectId(id)})
    return render_template("product_detail.html", product=product)

@app.route("/cart/add/<id>")
def add_to_cart(id):
    product = products_collection.find_one({"_id": ObjectId(id)})
    if not product or product.get("jumlah", 0) <= 0:
        return "Stok habis", 400

    if "cart" not in session:
        session["cart"] = {}

    session["cart"][id] = session["cart"].get(id, 0) + 1
    session.modified = True

    return redirect("/cart")

@app.route("/cart")
def cart():
    if "user_id" not in session:
        return redirect("/login")

    if "cart" not in session:
        session["cart"] = {}

    cart_items = []
    total_harga = 0

    for pid, qty in session["cart"].items():
        product = products_collection.find_one({"_id": ObjectId(pid)})
        if product:
            subtotal = product["harga"] * qty
            total_harga += subtotal
            
            cart_items.append({
                "id": pid,
                "nama": product["nama"],
                "harga": product["harga"],
                "qty": qty,
                "subtotal": subtotal
            })

    return render_template("cart.html", cart_items=cart_items, total_harga=total_harga)

@app.route("/checkout", methods=["GET", "POST"])
def checkout():
    if request.method == "GET":
        return render_template("checkout.html")

    cart = session.get("cart", {})
    if not cart:
        return "Keranjang kosong", 400

    alamat = request.form.get("alamat")
    ongkir = int(request.form.get("ongkir", 0))

    if not alamat:
        return "Alamat wajib diisi", 400

    total_harga = 0

    for pid, qty in cart.items():
        product = products_collection.find_one({"_id": ObjectId(pid)})

        if not product:
            continue

        # ✅ CEK STOK (FIELD JUMLAH)
        if product.get("jumlah", 0) < qty:
            return f"Stok {product['nama']} tidak mencukupi", 400

        subtotal = product["harga"] * qty
        total_harga += subtotal

        # ✅ UPDATE TERJUAL & JUMLAH
        products_collection.update_one(
            {"_id": ObjectId(pid)},
            {
                "$inc": {
                    "terjual": qty,
                    "jumlah": -qty
                }
            }
        )

    total_bayar = total_harga + ongkir

    session["alamat_pengiriman"] = alamat
    session["ongkir"] = ongkir
    session["total_bayar"] = total_bayar

    session["cart"] = {}
    session.modified = True

    return redirect("/checkout")



    total_bayar = total_harga + ongkir

    session["alamat_pengiriman"] = alamat
    session["ongkir"] = ongkir
    session["total_bayar"] = total_bayar

    session["cart"] = {}
    session.modified = True

    return redirect("/")


# @app.route("/checkout", methods=["GET", "POST"])
# def checkout():
#     if request.method == "GET":
#         return render_template("checkout.html")

#     alamat = request.form.get("alamat")

#     if not alamat:
#         return "Alamat wajib diisi", 400

#     if "cart" not in session or not isinstance(session["cart"], dict):
#         session["cart"] = {}

#     for pid, qty in session["cart"].items():
#         product = products_collection.find_one({"_id": ObjectId(pid)})
#         if product:
#             products_collection.update_one(
#                 {"_id": ObjectId(pid)},
#                 {"$inc": {"terjual": qty}}
#             )

#     # contoh: simpan alamat ke session (atau ke database nanti)
#     session["alamat_pengiriman"] = alamat

#     session["cart"] = {}
#     session.modified = True

#     return redirect("/checkout")


@app.route("/cart/remove/<id>")
def remove_from_cart(id):
    if "cart" in session and id in session["cart"]:
        session["cart"][id] -= 1
        if session["cart"][id] <= 0:
            del session["cart"][id]
        session.modified = True
    return redirect("/cart")

@app.route("/cart/delete/<id>")
def delete_item(id):
    if "cart" in session and id in session["cart"]:
        del session["cart"][id]
        session.modified = True
    return redirect("/cart")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        # cek user sudah ada
        existing = users_collection.find_one({"username": username})
        if existing:
            return "Username sudah dipakai!"

        # simpan user baru
        hashed_pw = generate_password_hash(password)
        users_collection.insert_one({
            "username": username,
            "password": hashed_pw,
        })

        return redirect("/login")

    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = users_collection.find_one({"username": username})

        if not user:
            return "User tidak ditemukan!"

        if not check_password_hash(user["password"], password):
            return "Password salah!"

        # simpan session user
        session["user_id"] = str(user["_id"])
        session["username"] = user["username"]
        session["role"] = user.get("role", "user")
        # cart user terpisah
        session["cart"] = {}

        return redirect("/")

    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

@app.route("/api/produk")
def api_produk():
    kategori = request.args.get("kategori")

    products = list(products_collection.find({
        "kategori": {"$regex": f"^{kategori}$", "$options": "i"}
    }))

    for p in products:
        p["_id"] = str(p["_id"])

    return jsonify(products)

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/api/pt")
def api_pt():
    pts = products_collection.distinct("pt")
    return jsonify(pts)

@app.route("/api/kategori")
def api_kategori():
    pt = request.args.get("pt")
    kategori = products_collection.distinct("kategori", {"pt": pt})
    return jsonify(kategori)

@app.route("/api/produk/filter")
def api_produk_filter():
    pt = request.args.get("pt")
    kategori = request.args.get("kategori")

    query = {}
    if pt:
        query["pt"] = pt
    if kategori:
        query["kategori"] = {"$regex": f"^{kategori}$", "$options": "i"}

    products = list(products_collection.find(query))
    for p in products:
        p["_id"] = str(p["_id"])

    return jsonify(products)
    


if __name__ == "__main__":
    app.run(debug=True)