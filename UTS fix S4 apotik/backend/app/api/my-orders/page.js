"use client";

import { useEffect, useState } from "react";

export default function MyOrdersPage() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {

    const user =
      JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    fetch(
      `http://localhost:5000/my-orders/${
        user.email || user.user?.email
      }`
    )

      .then(res => res.json())
      .then(data => setOrders(data));

  }, []);

  return (

    <div className="container">

      <h1>📦 Pesanan Saya</h1>

      {orders.length === 0 ? (

        <p>Belum ada pesanan</p>

      ) : (

        orders.map((order) => (

          <div
            key={order._id}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px"
            }}
          >

            <h3>
              {order.no_order}
            </h3>

            <p>
              Tanggal:
              {order.tanggal}
            </p>

            <p>
              Status:
              {order.status}
            </p>

            <p>
              Metode Bayar:
              {order.metode_bayar}
            </p>

            <h4>Barang:</h4>

            {order.items.map((item, index) => (

              <div key={index}>

                <p>
                  {item.nama_barang}
                  ({item.qty}x)
                </p>

              </div>

            ))}

            <h3>
              Total:
              Rp {order.total}
            </h3>

          </div>

        ))

      )}

    </div>

  );

}