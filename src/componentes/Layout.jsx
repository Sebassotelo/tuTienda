import React, { useState } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import Carrito from "./Carrito";
import Footer from "./Footer";

function Layout({ children, title }) {
  const [showCarrito, setShowCarrito] = useState(false);

  const mostrarCarrito = () => {
    setShowCarrito(!showCarrito);
    if (showCarrito === true) {
      document.body.style.overflow = "";
    } else if (window.innerWidth < 900) {
      document.body.style.overflow = "hidden";
    }
  };

  return (
    <div className="grid min-h-screen w-full max-w-full overflow-x-hidden bg-white">
      <Head>
        <title>{title || "MyStore | Crea tu catalogo online y recibe pedidos por WhatsApp"}</title>
        <meta
          name="description"
          content="MyStore te permite mostrar tus productos de manera clara y recibir pedidos directamente en tu WhatsApp"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar showCarrito={mostrarCarrito} show={showCarrito} />

      <main className="min-h-[90vh] min-w-0 max-w-full overflow-x-hidden pt-[60px] pb-16 sm:pt-20 sm:pb-0">
        {children}
      </main>

      <Carrito showCarrito={mostrarCarrito} show={showCarrito} />

      <Footer />
    </div>
  );
}

export default Layout;
