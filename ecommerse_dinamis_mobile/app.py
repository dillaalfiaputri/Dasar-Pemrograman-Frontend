from flask import Flask, render_template, request, redirect, session
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask import jsonify
import os
from werkzeug.utils import secure_filename


app = Flask(__name__)
app.secret_key = "secret123"
UPLOAD_FOLDER = "static/img"
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
    if "cart" not in session:
        session["cart"] = {}

    # tambahkan quantity
    if id in session["cart"]:
        session["cart"][id] += 1
    else:
        session["cart"][id] = 1

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
    #GET: tampilkan halaman sukses
    if request.method == "GET":
        return render_template("checkout.html")

    #POST: proses checkout
    if "cart" not in session or not isinstance(session["cart"], dict):
        session["cart"] = {}

    for pid, qty in session["cart"].items():
        product = products_collection.find_one({"_id": ObjectId(pid)})
        if product:
            products_collection.update_one(
                {"_id": ObjectId(pid)},
                {"$inc": {"terjual": qty}}
            )

    # reset cart
    session["cart"] = {}
    session.modified = True

    # redirect ke halaman sukses
    return redirect("/checkout")

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
            "role": "admin"
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

@app.route("/produk/tambah", methods=["GET", "POST"])
def tambah_produk():
    if session.get("role") != "admin":
        return "Akses ditolak", 403

    if request.method == "POST":
        nama = request.form["nama"]
        harga = int(request.form["harga"])
        kategori = request.form["kategori"]

        file = request.files["gambar"]

        if not file or not allowed_file(file.filename):
            return "File gambar tidak valid", 400

        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

        products_collection.insert_one({
            "nama": nama,
            "harga": harga,
            "kategori": kategori,
            "gambar": f"img/{filename}",
            "terjual": 0
        })

        return redirect("/")

    return render_template("tambah_produk.html")


@app.route("/produk/hapus/<id>")
def hapus_produk(id):
    if session.get("role") != "admin":
        return "Akses ditolak", 403

    products_collection.delete_one({"_id": ObjectId(id)})
    return redirect("/")

@app.route("/produk/edit/<id>", methods=["GET", "POST"])
def edit_produk(id):
    if session.get("role") != "admin":
        return "Akses ditolak", 403

    produk = products_collection.find_one({"_id": ObjectId(id)})

    if not produk:
        return "Produk tidak ditemukan", 404

    if request.method == "POST":
        nama = request.form["nama"]
        harga = int(request.form["harga"])
        kategori = request.form["kategori"]
        gambar = request.form["gambar"]

        products_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {
                "nama": nama,
                "harga": harga,
                "kategori": kategori,
                "gambar": gambar
            }}
        )

        return redirect("/")

    return render_template("edit_produk.html", produk=produk)

if __name__ == "__main__":
    app.run(debug=True)