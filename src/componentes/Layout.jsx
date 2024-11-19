import React, { useEffect, useState } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import style from "../styles/Layout.module.scss";
import Carrito from "./Carrito";
import Footer from "./Footer";

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
  };

  return (
    <div style={{ display: "grid" }}>
      <Head>
        <title>
          MyShop | Creá tu Catalogo Online Y recibe los pedidos al Whatsapp
        </title>
        <meta
          name="description"
          content="MyShop te permite mostrar tus productos de manera fácil y recibir pedidos directamente en tu WhatsApp"
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
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Kanit:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Navbar showCarrito={mostrarCarrito} show={showCarrito} />

      <div className={style.body}>{children}</div>

      <Carrito showCarrito={mostrarCarrito} show={showCarrito} />

      <Footer />
    </div>
  );
}

export default Layout;
