import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import style from "../styles/Home.module.scss";
import Layout from "@/componentes/Layout";
import { useContext, useEffect } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import ProductoItem from "@/componentes/productos/ProductoItem";
import LinkNext from "next/link";
import { Link } from "react-scroll";
import Loader from "@/componentes/Loader";

import { motion } from "framer-motion";

import { MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%" }}
          >
            <header className={style.header}>
              <div className={style.logo}>
                <img src="https://i.imgur.com/Us77N0f.png" alt="" />{" "}
                <p> 🛸 E S T A M O S EN EL F U T U R O</p>
                <p> ⚡P I C K U P ⚡</p>
                <LinkNext href="/productos">IR AL CATALOGO</LinkNext>
              </div>

              <Link
                activeClass="active"
                to="ofertas"
                spy={true}
                smooth={true}
                offset={50}
                duration={500}
                className={style.flecha}
              >
                <p>VER OFERTAS</p>
                <MdOutlineKeyboardDoubleArrowDown className={style.icon} />
              </Link>
            </header>
          </motion.div>

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

            <LinkNext
              className={style.a}
              href="/productos"
              onClick={filtrarOfertas}
            >
              Ver Ofertas
            </LinkNext>
          </section>
        </main>
      ) : (
        <Loader />
      )}
    </>
  );
}
