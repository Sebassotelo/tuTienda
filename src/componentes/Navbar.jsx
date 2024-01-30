import React, { useContext, useEffect, useState } from "react";
import style from "../styles/Navbar.module.scss";
import Link from "next/link";
import ContextGeneral from "@/servicios/contextPrincipal";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import {
  AiOutlineShoppingCart,
  AiOutlineHome,
  AiOutlineSearch,
  AiOutlineGoogle,
} from "react-icons/ai";
import { MdOutlineDashboardCustomize, MdOutlineLogout } from "react-icons/md";

import { RiStore2Line } from "react-icons/ri";
import { motion } from "framer-motion";

import BuscadorTienda from "./BuscadorTienda";

import { useRouter } from "next/router";

function Navbar({ showCarrito, show }) {
  const context = useContext(ContextGeneral);
  const { setProductosPublicos } = useContext(ContextGeneral);
  const [contadorProductos, setContadorProductos] = useState(0);
  const [showBuscador, setShowBuscador] = useState(false);

  const googleProvider = new GoogleAuthProvider();

  const router = useRouter();
  const currentPath = router.asPath;

  const cantidadProductos = () => {
    let acumulador = 0;
    for (let i = 0; i < context.carrito.length; i++) {
      acumulador = acumulador + context.carrito[i].cantidad;
    }
    setContadorProductos(acumulador);
  };

  const mostrarBuscador = () => {
    setShowBuscador(!showBuscador);
  };

  useEffect(() => {
    cantidadProductos();
  }, [context.actuCarrito]);

  return (
    <div className={style.container}>
      <Link
        href="/"
        className={style.img}
        onClick={() => setProductosPublicos(context.productosPublicosCopia)}
      >
        <img src="https://i.imgur.com/ZQ7yfOm.png" alt="" />
      </Link>

      <ul className={style.navbar}>
        {context.estadoUsuario == 1 && context.nombreTienda != "" && (
          <Link href={`/u/${context.nombreTienda}`}>
            <RiStore2Line className={style.icon} />{" "}
          </Link>
        )}

        {currentPath.includes("/u/") && (
          <AiOutlineSearch className={style.icon} onClick={mostrarBuscador} />
        )}

        {currentPath.includes("/u/") && (
          <p className={style.icon} onClick={showCarrito}>
            <AiOutlineShoppingCart style={{ color: show && "#f2ced1" }} />{" "}
            {contadorProductos > 0 && (
              <p style={{ color: show && "#f2ced1" }}>({contadorProductos})</p>
            )}
          </p>
        )}
        {context.estadoUsuario == 0 && !currentPath.includes("/u/") && (
          <AiOutlineGoogle
            className={style.icon}
            onClick={() => signInWithPopup(context.auth, googleProvider)}
          />
        )}
        {context.estadoUsuario == 1 && (
          <>
            {" "}
            <Link href="/panel-de-control">
              <MdOutlineDashboardCustomize className={style.icon} />
            </Link>
            {context.user && (
              <MdOutlineLogout
                onClick={() => signOut(context.auth)}
                className={style.icon}
              />
            )}
          </>
        )}
      </ul>
      {showBuscador && (
        <motion.div
          initial={{ y: -200 }}
          animate={{ y: 0 }}
          transition={{ type: "lineal" }}
          className={style.buscador}
        >
          <BuscadorTienda setShow={setShowBuscador} />
        </motion.div>
      )}
    </div>
  );
}

export default Navbar;
