import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { push } from "next/router";
import ContextGeneral from "@/servicios/contextPrincipal";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import {
  AiOutlineShoppingCart,
  AiOutlineSearch,
  AiOutlineGoogle,
} from "react-icons/ai";
import { MdOutlineDashboardCustomize, MdOutlineLogout } from "react-icons/md";
import { RiStore2Line } from "react-icons/ri";
import { useRouter } from "next/router";

function Navbar({ showCarrito, show }) {
  const context = useContext(ContextGeneral);
  const { setProductosPublicos } = useContext(ContextGeneral);
  const [contadorProductos, setContadorProductos] = useState(0);

  const googleProvider = new GoogleAuthProvider();
  const router = useRouter();
  const currentPath = router.asPath;
  const isStoreRoute = currentPath.includes("/u/");

  const cantidadProductos = () => {
    let acumulador = 0;
    for (let i = 0; i < context.carrito.length; i++) {
      acumulador = acumulador + context.carrito[i].cantidad;
    }
    setContadorProductos(acumulador);
  };

  const mostrarBuscador = () => {
    const searchSection = document.getElementById("catalog-search-section");
    const searchInput = document.getElementById("catalog-search-input");

    searchSection?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => searchInput?.focus(), 350);
  };

  const iniciarSesion = async () => {
    try {
      await signInWithPopup(context.auth, googleProvider);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("El usuario cerro el popup antes de iniciar sesion.");
      } else {
        console.error("Error de autenticacion:", error);
      }
    }
  };

  useEffect(() => {
    cantidadProductos();
  }, [context.actuCarrito]);

  const iconClass =
    "relative grid h-10 w-10 cursor-pointer place-items-center rounded-2xl border border-white/10 bg-white/[0.06] p-0 text-xl text-white no-underline shadow-sm shadow-zinc-950/10 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.12] sm:h-11 sm:w-11 sm:text-2xl";

  const navItems = (
    <>
      {context.estadoUsuario == 1 && context.nombreTienda != "" && (
        <Link href={`/u/${context.nombreTienda}`} className={iconClass} aria-label="Mi tienda">
          <RiStore2Line />
        </Link>
      )}

      {isStoreRoute && (
        <button
          type="button"
          className={iconClass}
          onClick={mostrarBuscador}
          aria-label="Buscar productos"
        >
          <AiOutlineSearch />
        </button>
      )}

      {isStoreRoute && (
        <button
          type="button"
          className={`${iconClass} ${show ? "border-brand-cream/50 text-brand-cream" : ""}`}
          onClick={showCarrito}
          aria-label="Abrir carrito"
        >
          <AiOutlineShoppingCart />
          {contadorProductos > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-brand-coral px-1.5 text-[11px] font-bold leading-none text-white ring-2 ring-brand-dark">
              {contadorProductos}
            </span>
          )}
        </button>
      )}

      {context.estadoUsuario == 0 && !isStoreRoute && (
        <button
          type="button"
          className={iconClass}
          onClick={iniciarSesion}
          aria-label="Iniciar sesion con Google"
        >
          <AiOutlineGoogle />
        </button>
      )}

      {context.estadoUsuario == 1 && (
        <>
          <Link href="/panel-de-control" className={iconClass} aria-label="Panel de control">
            <MdOutlineDashboardCustomize />
          </Link>
          {context.user && (
            <button
              type="button"
              onClick={() => {
                signOut(context.auth);
                push(`/u/${context.nombreTienda}`);
              }}
              className={iconClass}
              aria-label="Cerrar sesion"
            >
              <MdOutlineLogout />
            </button>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[300] h-[60px] w-full max-w-full border-b border-white/10 bg-brand-dark/95 shadow-[0_10px_30px_rgba(15,23,42,0.18)] backdrop-blur-md sm:h-20">
        <div className="grid h-full w-full max-w-full grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6 lg:px-8">
          <div />
          <Link
            href="/"
            className="grid h-full cursor-pointer place-items-center no-underline transition hover:scale-[1.02]"
            onClick={() => setProductosPublicos(context.productosPublicosCopia)}
            aria-label="MyStore"
          >
            <img
              src="/logo.png"
              alt="MyStore"
              className="h-[58px] w-auto object-contain sm:h-[74px]"
            />
          </Link>
          <nav className="hidden min-w-0 items-center justify-end gap-2 sm:flex">
            {navItems}
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-[300] flex h-16 w-full max-w-full items-center justify-around border-t border-white/10 bg-brand-dark/95 px-4 shadow-[0_-16px_40px_rgba(15,23,42,0.24)] backdrop-blur-md sm:hidden">
        {navItems}
      </nav>
    </>
  );
}

export default Navbar;

