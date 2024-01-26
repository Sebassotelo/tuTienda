import Head from "next/head";
import style from "../styles/Home.module.scss";
import { useContext, useEffect, useState } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import LinkNext from "next/link";
import { Link } from "react-scroll";

import { color, motion } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

import ItemAbout from "../componentes/itemAbout/ItemAbout";

export default function Home() {
  const context = useContext(ContextGeneral);
  const { verificarLogin } = useContext(ContextGeneral);
  const googleProvider = new GoogleAuthProvider();

  const [itemsCategoria, setItemsCategoria] = useState([]);

  const arrayAbout = [
    {
      icon: "🤓",
      title: "Creación Intuitiva de Tiendas",
      desc: "No se requieren habilidades técnicas; simplemente creá tu tienda con Google, carga tus productos y personaliza según tus preferencias.",
    },
    {
      icon: "🙋‍♂️",
      title: "Autogestionable",
      desc: "Administras tu tienda online sin ayuda de profesionales y desde cualquier dispositivo.",
    },
    {
      icon: "📋",
      title: "Catálogo Online Atractivo:",
      desc: "Destaca tus productos con un catálogo online atractivo y fácil de navegar. Carga imágenes de alta calidad, proporciona descripciones detalladas y organiza tus productos de manera lógica para que tus clientes encuentren lo que necesitan de manera rápida.",
    },
    {
      icon: "🌐",
      title: "Pedidos a través de WhatsApp:",
      desc: "Facilitamos la comunicación directa con tus clientes al integrar un sistema de pedidos a través de WhatsApp. Tus clientes pueden realizar pedidos fácilmente, y tú recibirás notificaciones instantáneas para procesarlos rápidamente.",
    },
    {
      icon: "🛍️",
      title: "Gran cantidad de productos:",
      desc: "Podes agregar hasta 100 productos.",
    },
    {
      icon: "🥳",
      title: "7 dias de prueba gratis:",
      desc: "Sin configurar un medio de pago.",
    },
  ];
  const [arrayMostrar, setArrayMostrar] = useState(arrayAbout);

  const arrayPrecio = [
    {
      icon: "🛍️",
      title: "Genera cupones de descuentos y ofertas",
      desc: "Armá cupones de monto fijo o porcentual, descuentos individuales o por categorias.",
    },
    {
      icon: "⚡",
      title: "Recibe tus pedidos al WhatsApp",
      desc: "Tus clientes tendran que entrar a la tienda, agregar al carrito y podran mandarte el pedido directamente a tu WhatsApp.",
    },
    {
      icon: "🛒",
      title: "Productos visibles segun Stock",
      desc: "En el catalogo publico solamente se mostraran aquellos productos que cuenten con stock disponible.",
    },
    {
      icon: "😁",
      title: "Disponible en cualquier dispositivo",
      desc: "La tienda para tus clientes tanto como para los emprendedores esta disponible en cualquier dispositivo.",
    },
    {
      icon: "🎥",
      title: "Videos explicativos",
      desc: "Videos que te guian a como configurar tu perfil y subir los productos.",
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

                {context.user ? (
                  <button onClick={() => signOut(context.auth)}>
                    Cerrar Sesion
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      signInWithPopup(context.auth, googleProvider)
                    }
                  >
                    Creá tu Tienda con Google
                  </button>
                )}
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
              MyShop es una innovadora aplicación diseñada para simplificar la
              creación y gestión de tiendas y catálogos online, ofreciendo a
              emprendedores y pequeños negocios la oportunidad de llevar sus
              productos al mundo digital de manera sencilla y efectiva.
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
              <h3>Hazlo, de una u otra forma...</h3>
            </div>
            <div>
              <p>
                Nosotros nos encargamos de que tu catalogo esté siempre
                disponible.
              </p>
              <p>Cualquier duda te respondera una persona.</p>
              <p>Todo feedback para mejorar será bienvenido.</p>
            </div>
          </div>
        </section>

        <section className={style.precio} id="precio">
          <div className={style.precio__precio}>
            <div className={style.conte}>
              <p>ÚNICO PRECIO.</p>
              <h3>
                $3990{" "}
                <span style={{ textDecoration: "line-through" }}>$4999</span>
              </h3>
              <p>Finales por mes.</p>
              <p>Obtene la suscripcion de 1 año pagando solo 8 meses!</p>
              <h3>
                $31990{" "}
                <span style={{ textDecoration: "line-through" }}>$59999</span>
              </h3>
              {context.user ? (
                <button onClick={() => signOut(context.auth)}>
                  Cerrar Sesion
                </button>
              ) : (
                <button
                  onClick={() => signInWithPopup(context.auth, googleProvider)}
                >
                  Creá tu Tienda con Google
                </button>
              )}
            </div>
          </div>
          <div className={style.precio__benef}>
            {arrayMostrarPrecio.map((item, i) => {
              return (
                <div className={style.card} key={i}>
                  <div>
                    <h4>
                      {item.icon} {item.title}
                    </h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
