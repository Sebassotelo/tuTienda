import React, { useContext, useEffect, useState } from "react";
import style from "../styles/Navbar.module.scss";
import Link from "next/link";
import ContextGeneral from "@/servicios/contextPrincipal";
import { signOut } from "firebase/auth";

function navbar({ showCarrito }) {
  const context = useContext(ContextGeneral);
  const [contadorProductos, setContadorProductos] = useState(0);

  const cantidadProductos = () => {
    let acumulador = 0;
    for (let i = 0; i < context.carrito.length; i++) {
      acumulador = acumulador + context.carrito[i].cantidad;
    }
    setContadorProductos(acumulador);
  };

  useEffect(() => {
    cantidadProductos();
  }, [context.actuCarrito]);

  return (
    <div className={style.container}>
      <ul className={style.navbar}>
        <Link href="/">Home</Link>
        <Link href="/productos">Productos</Link>
        <p onClick={showCarrito}>Carrito {`(${contadorProductos})`} </p>
        {context.estadoUsuario == 1 && (
          <>
            {" "}
            <Link href="/panel-de-control">Panel de Control</Link>
            {context.user && (
              <p onClick={() => signOut(context.auth)}>Cerrar Sesion</p>
            )}
          </>
        )}
      </ul>
    </div>
  );
}

export default navbar;
