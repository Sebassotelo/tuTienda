import React, { useEffect, useState } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import style from "../styles/Layout.module.scss";
import Carrito from "./Carrito";

function Layout({ children, title }) {
  const [showCarrito, setShowCarrito] = useState(false);

  const mostrarCarrito = () => {
    setShowCarrito(!showCarrito);
    if (showCarrito === true) {
      document.body.style.overflow = "";
    } else {
      if (window.innerWidth < 900) {
        document.body.style.overflow = "hidden";
      }
    }
    console.log(showCarrito);
  };

  return (
    <div style={{ display: "grid" }}>
      <Head>
        <title>SrasMedias 🧦 | Home</title>
        <meta
          name="description"
          content="SrasMedias 🧦 |  🛸 E S T A M O S EN EL F U T U R O"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        ></link>
      </Head>
      <Navbar showCarrito={mostrarCarrito} show={showCarrito} />

      <div className={style.body}>{children}</div>

      <Carrito showCarrito={mostrarCarrito} show={showCarrito} />

      <footer className={style.footer}>
        <p>
          Hecho por <span>Sebas Sotelo</span>
        </p>
      </footer>
    </div>
  );
}

export default Layout;
