import Head from "next/head";
import style from "../styles/Home.module.scss";
import { useContext, useEffect, useState } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import LinkNext from "next/link";
import { Link } from "react-scroll";

import { color, motion } from "framer-motion";

import ItemAbout from "../componentes/itemAbout/ItemAbout";

export default function Home() {
  const context = useContext(ContextGeneral);
  const { verificarLogin } = useContext(ContextGeneral);

  const [itemsCategoria, setItemsCategoria] = useState([]);

  const arrayAbout = [
    {
      icon: "😁",
      title: "Panel autoadministable",
      desc: "Panel que te permite manejar todos tus productos",
    },
    {
      icon: "😁",
      title: "Panel autoadministable",
      desc: "Panel que te permite manejar todos tus productos",
    },
    {
      icon: "😁",
      title: "Panel autoadministable",
      desc: "Panel que te permite manejar todos tus productos",
    },
    {
      icon: "😁",
      title: "Panel autoadministable",
      desc: "Panel que te permite manejar todos tus productos",
    },
  ];
  const [arrayMostrar, setArrayMostrar] = useState(arrayAbout);

  const arrayPrecio = [
    {
      icon: "😁",
      title: "Panel autoadministable",
      desc: "Panel que te permite manejar todos tus productos",
    },
    {
      icon: "😁",
      title: "Panel autoadministable",
      desc: "Panel que te permite manejar todos tus productos",
    },
    {
      icon: "😁",
      title: "Panel autoadministable",
      desc: "Panel que te permite manejar todos tus productos",
    },
    {
      icon: "😁",
      title: "Panel autoadministable",
      desc: "Panel que te permite manejar todos tus productos",
    },
  ];

  const [arrayMostrarPrecio, setArrayMostrarPrecio] = useState(arrayPrecio);
  useEffect(() => {
    verificarLogin();
  }, []);

  return (
    <>
      <main className={style.main}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%" }}
        >
          <header className={style.header}>
            <div className={style.container}>
              <div className={style.title}>
                <h1>
                  Creá tu tienda Y recibe los pedidos al{" "}
                  <span style={{ color: "rgb(48, 160, 20)" }}>Whatsapp!</span>{" "}
                </h1>
                <button>Creá tu Tienda con Google</button>
              </div>
              <div className={style.logo}>
                <img src={context.urlLogo} alt="" />
              </div>
            </div>
          </header>
        </motion.div>

        <section className={style.about} id="about">
          <div className={style.container}>
            <h2>Que hacemos?</h2>
            <p>
              Empretienda es una plataforma que te permite crear y administrar
              tu propia tienda online de manera simple y completa.
            </p>
            <p> Creando tu cuenta automáticamente tenes acceso a:</p>

            <div className={style.about__icons}>
              {arrayMostrar.map((item, i) => {
                return (
                  <ItemAbout
                    icon={item.icon}
                    title={item.title}
                    desc={item.desc}
                    key={i}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className={style.pasos}>
          <img src="https://i.imgur.com/QiTODWB.jpg" alt="" />
          <div className={style.pasos__text}>
            <div>
              <h3>Hazlo, de una u otra forma.</h3>
            </div>
            <div>
              <p>
                Nosotros nos encargamos de que tu catalogo esté siempre
                disponible.
              </p>
              <p>Cualquier duda te respondera una persona.</p>
              <p>Todo feedback para mejorar sera bienvenido.</p>
            </div>
          </div>
        </section>

        <section className={style.precio} id="precio">
          <div className={style.precio__precio}>
            <div className={style.conte}>
              <p>ÚNICO PRECIO</p>
              <h3>$3990</h3>
              <p>Finales por mes.</p>
              <button>Creá tu tienda con Google</button>
            </div>
          </div>
          <div className={style.precio__benef}>
            {arrayMostrarPrecio.map((item, i) => {
              return (
                <div className={style.card} key={i}>
                  <h4>
                    {item.icon} {item.title}
                  </h4>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
