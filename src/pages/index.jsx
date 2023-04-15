import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import style from "../styles/Home.module.scss";
import Layout from "@/componentes/Layout";
import { useContext, useEffect } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import ProductoItem from "@/componentes/productos/ProductoItem";
import Link from "next/link";
import Loader from "@/componentes/Loader";

import { MdKeyboardArrowDown } from "react-icons/md";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const context = useContext(ContextGeneral);
  const { verificarLogin, llamadaDB, setProductosPublicos } =
    useContext(ContextGeneral);

  const filtrarOfertas = () => {
    const nuevoArray = context.productosPublicosCopia.filter(
      (item) => item.descuento
    );
    setProductosPublicos(nuevoArray);
  };

  useEffect(() => {
    llamadaDB();
    verificarLogin();
  }, []);

  return (
    <>
      {context.loader ? (
        <main className={style.main}>
          <header className={style.header}>
            <div className={style.logo}>
              <img src="https://i.imgur.com/Us77N0f.png" alt="" />{" "}
              <p> 🛸 E S T A M O S EN EL F U T U R O</p>
              <p> ⚡P I C K U P ⚡</p>
              <Link href="/productos">IR AL CATALOGO</Link>
            </div>
            <Link href="#ofertas" className={style.flecha}>
              <p>VER OFERTAS</p>
              <MdKeyboardArrowDown className={style.icon} />
            </Link>
          </header>

          <section className={style.ofertas} id="ofertas">
            <h3>OFERTAS</h3>

            <div className={style.items}>
              {context.productosPublicos &&
                context.productosPublicos
                  .filter((item, i) => item.descuento)
                  .slice(0, 4)
                  .map((item, i) => {
                    return <ProductoItem key={i} item={item} />;
                  })}
            </div>

            <Link
              className={style.a}
              href="/productos"
              onClick={filtrarOfertas}
            >
              Ver Ofertas
            </Link>
          </section>
        </main>
      ) : (
        <Loader />
      )}
    </>
  );
}
