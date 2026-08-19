import Head from "next/head";
import { useContext, useEffect } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import LinkNext from "next/link";
import { Link as ScrollLink } from "react-scroll";
import { motion } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import {
  FiArrowRight,
  FiCheckCircle,
  FiMessageCircle,
  FiPlayCircle,
} from "react-icons/fi";
import {
  MdOutlineAutoGraph,
  MdOutlineDashboardCustomize,
  MdOutlineInventory2,
  MdOutlineLocalOffer,
  MdOutlineStorefront,
} from "react-icons/md";

const sectionLabel =
  "text-[0.6875rem] font-extrabold uppercase tracking-[0.08em] text-brand-coral";
const sectionTitle =
  "m-0 max-w-3xl font-display text-3xl font-extrabold leading-tight text-zinc-950 sm:text-4xl lg:text-5xl";
const sectionText =
  "m-0 max-w-2xl text-base font-medium leading-8 text-zinc-600";
const primaryAction =
  "inline-flex min-h-[3.125rem] w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-5 text-sm font-extrabold text-white no-underline shadow-xl shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800 sm:w-auto";
const secondaryAction =
  "inline-flex min-h-[3.125rem] w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-5 text-sm font-extrabold text-zinc-950 no-underline transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 sm:w-auto";

export default function Home() {
  const context = useContext(ContextGeneral);
  const { verificarLogin } = useContext(ContextGeneral);
  const googleProvider = new GoogleAuthProvider();

  const storyCards = [
    {
      title: "Tus productos no deberian vivir perdidos entre chats",
      desc: "Cuando cada cliente pregunta por privado, mostrar lo que vendes consume tiempo y energia que deberias usar para cerrar ventas.",
    },
    {
      title: "Responder rapido tambien es parte de vender",
      desc: "Si el catalogo no esta claro, cada consulta se transforma en un ida y vuelta eterno de fotos, precios y stock.",
    },
    {
      title: "La confianza aparece cuando todo se ve ordenado",
      desc: "Una tienda simple, prolija y facil de compartir hace que el cliente compre con menos dudas y mas decision.",
    },
  ];

  const steps = [
    {
      icon: <FcGoogle />,
      title: "Creas tu cuenta en minutos",
      desc: "Entras con Google, armas tu perfil y ya tienes la base lista sin configuraciones tecnicas.",
    },
    {
      icon: <MdOutlineStorefront />,
      title: "Subes productos y organizas categorias",
      desc: "Muestras fotos, precios, stock y ofertas desde un panel pensado para autogestionarte.",
    },
    {
      icon: <FiMessageCircle />,
      title: "Compartes el link y recibes pedidos por WhatsApp",
      desc: "Tu cliente navega, agrega al carrito y te escribe con una intencion de compra mucho mas clara.",
    },
  ];

  const outcomes = [
    {
      icon: <MdOutlineInventory2 />,
      title: "Stock mas claro",
      desc: "Los productos sin stock dejan de aparecer en la vidriera publica para evitar conversaciones frustrantes.",
    },
    {
      icon: <MdOutlineLocalOffer />,
      title: "Promos que se notan",
      desc: "Descuentos y cupones visibles para mover productos, empujar compras y darle ritmo a la tienda.",
    },
    {
      icon: <MdOutlineDashboardCustomize />,
      title: "Panel facil de mantener",
      desc: "Todo esta pensado para actualizar tu tienda sin depender de un programador en cada cambio.",
    },
    {
      icon: <MdOutlineAutoGraph />,
      title: "Mas seriedad comercial",
      desc: "Tu marca se ve mejor, comunica mejor y llega con mas claridad al momento de vender.",
    },
  ];

  const clientStores = [
    {
      url: "minime.byvalerie",
      nombre: "Minime By Valerie",
      rubro: "Moda infantil",
      logo: "https://i.ibb.co/yhHmSzv/IMG-20240415-WA0001-jpg.jpg",
    },
    {
      url: "susi.moda",
      nombre: "Susi Moda",
      rubro: "Indumentaria",
      logo: "https://i.ibb.co/Ny16hJ3/zy1-Xa6q-png.png",
    },
  ];

  const plans = [
    {
      name: "Premium",
      monthly: "$9999",
      annual: "$79999",
      audience:
        "Para emprendimientos, tiendas chicas y marcas que necesitan vender con mas orden sin manejar catalogos enormes.",
      limit: "Hasta 100 productos",
      badge: "Ideal para empezar",
      features: [
        "Hasta 100 productos publicados",
        "Categorias, ofertas y cupones",
        "Stock visible y pedidos por WhatsApp",
        "Panel simple para autogestion diaria",
      ],
    },
    {
      name: "Pro",
      monthly: "$18999",
      annual: "$149999",
      audience:
        "Pensado para mayoristas, distribuidores y tiendas con catalogos grandes que necesitan crecer sin limite de productos.",
      limit: "Productos sin limite",
      badge: "Para catalogos grandes",
      features: [
        "Productos sin limite",
        "Mejor para mayoristas y catalogos amplios",
        "Categorias y promociones para muchas lineas",
        "Escala sin preocuparte por el limite del catalogo",
      ],
    },
  ];

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
    verificarLogin();
  }, []);

  return (
    <>
      <Head>
        <title>MyStore | Tu catalogo online listo para vender por WhatsApp</title>
        <meta
          name="description"
          content="Muestra tus productos, organiza stock y recibe pedidos por WhatsApp con una tienda simple de administrar."
        />
      </Head>

      <main className="w-full overflow-x-hidden bg-white pb-28 text-zinc-950 md:pb-0 [&_*]:box-border">
        <section className="relative isolate flex min-h-[calc(100dvh-3.75rem)] items-center overflow-hidden bg-[linear-gradient(180deg,#fff8f2_0%,#ffffff_54%,#f8f3ee_100%)] px-5 py-10 sm:min-h-[calc(100dvh-5rem)] sm:px-8 lg:px-10">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
            <motion.div
              className="min-w-0"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <span className={sectionLabel}>
                Catalogos digitales para vender por WhatsApp
              </span>
              <h1 className="m-0 mt-5 max-w-4xl font-display text-[2.1rem] font-extrabold leading-[1.12] text-zinc-950 sm:text-5xl lg:text-6xl xl:text-7xl">
                Deja de perder ventas por explicar productos uno por uno.
              </h1>
              <p className="m-0 mt-6 max-w-2xl text-base font-medium leading-7 text-zinc-600 sm:text-lg sm:leading-8">
                MyStore convierte tus productos, stock, precios y promociones en
                una tienda clara para que el cliente entienda, elija y te
                escriba por WhatsApp con el pedido armado.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
                {context.user ? (
                  <LinkNext href="/panel-de-control" className={primaryAction}>
                    Ir al panel
                    <FiArrowRight className="text-lg" />
                  </LinkNext>
                ) : (
                  <button className={primaryAction} onClick={iniciarSesion}>
                    <FcGoogle className="text-xl" />
                    Crear mi catalogo con Google
                  </button>
                )}

                {context.user && context.nombreTienda ? (
                  <LinkNext
                    href={`/u/${context.nombreTienda}`}
                    className={secondaryAction}
                  >
                    Ver mi tienda publica
                  </LinkNext>
                ) : (
                  <ScrollLink
                    to="story"
                    smooth={true}
                    duration={500}
                    className={secondaryAction}
                  >
                    Ver como funciona
                    <FiPlayCircle className="text-lg" />
                  </ScrollLink>
                )}
              </div>

              {context.user && (
                <button
                  className="mt-4 border-0 bg-transparent p-0 text-sm font-bold text-zinc-500 underline underline-offset-4 transition hover:text-zinc-950"
                  onClick={() => signOut(context.auth)}
                >
                  Cerrar sesion
                </button>
              )}

              <div className="mt-10 hidden gap-3 sm:grid sm:grid-cols-3">
                {[
                  ["30 dias", "para probar sin friccion"],
                  ["100 productos", "incluidos en el plan Premium"],
                  ["1 solo link", "para bio, estados y campanas"],
                ].map(([value, label]) => (
                  <div
                    key={value}
                    className="rounded-lg border border-zinc-200 bg-white/80 p-4 shadow-sm shadow-zinc-950/5"
                  >
                    <strong className="block font-display text-lg font-extrabold text-zinc-950">
                      {value}
                    </strong>
                    <span className="mt-1 block text-sm font-semibold leading-5 text-zinc-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="hidden min-w-0 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-950/10 lg:block"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.55 }}
            >
              <div className="rounded-2xl bg-zinc-950 p-6 text-white">
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <span className="text-[0.625rem] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
                      Lo que ordena MyStore
                    </span>
                    <h2 className="m-0 mt-3 max-w-md font-display text-3xl font-extrabold leading-tight">
                      Tus clientes entienden antes de escribirte.
                    </h2>
                  </div>
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
                    <img
                      src={context.urlLogo || "/logo.png"}
                      alt="MyStore"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                </div>

                <div className="mt-7 grid gap-3">
                  {[
                    [
                      "01",
                      "Ven productos, precios y stock",
                      "La informacion clave queda clara sin pedir fotos por chat.",
                    ],
                    [
                      "02",
                      "Eligen y arman el pedido",
                      "Navegan categorias, ofertas y productos disponibles.",
                    ],
                    [
                      "03",
                      "Te escriben por WhatsApp",
                      "El mensaje llega con contexto para cerrar mas rapido.",
                    ],
                  ].map(([number, title, detail]) => (
                    <div
                      key={number}
                      className="grid grid-cols-[2.75rem_1fr] gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <strong className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-extrabold text-zinc-950">
                        {number}
                      </strong>
                      <div>
                        <p className="m-0 text-base font-extrabold leading-6 text-white">
                          {title}
                        </p>
                        <span className="mt-1 block text-sm font-semibold leading-6 text-zinc-400">
                          {detail}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-brand-soft p-4">
                  <span className="text-[0.625rem] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
                    Menos ida y vuelta
                  </span>
                  <p className="m-0 mt-2 text-base font-extrabold leading-7 text-zinc-950">
                    Menos consultas repetidas y mas tiempo para cerrar ventas.
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-100 p-4">
                  <span className="text-[0.625rem] font-extrabold uppercase tracking-[0.08em] text-zinc-500">
                    Pedido mas claro
                  </span>
                  <p className="m-0 mt-2 text-base font-extrabold leading-7 text-zinc-950">
                    Tu WhatsApp recibe clientes con una decision mejor formada.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="story" className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
              <div className="min-w-0">
                <span className={sectionLabel}>Problema comercial</span>
                <h2 className={`${sectionTitle} mt-3`}>
                  Vender por chat funciona mejor cuando el catalogo ordena la
                  conversacion.
                </h2>
                <p className={`${sectionText} mt-5`}>
                  Muchas tiendas no necesitan una web enorme. Necesitan una
                  experiencia clara para mostrar, convencer y guiar la compra.
                </p>
              </div>

              <div className="grid gap-4">
                {storyCards.map((item, index) => (
                  <motion.article
                    key={item.title}
                    className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5 sm:p-6"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                  >
                    <span className="text-xs font-extrabold text-brand-coral">
                      0{index + 1}
                    </span>
                    <h3 className="m-0 mt-3 font-display text-xl font-extrabold leading-snug text-zinc-950">
                      {item.title}
                    </h3>
                    <p className="m-0 mt-3 text-sm font-medium leading-7 text-zinc-600 sm:text-base">
                      {item.desc}
                    </p>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-50 px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <span className={sectionLabel}>Implementacion simple</span>
              <h2 className={`${sectionTitle} mt-3`}>
                Tres pasos para pasar de consultas sueltas a una tienda clara.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((item, index) => (
                <motion.article
                  key={item.title}
                  className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm shadow-zinc-950/5"
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-brand-coral">
                      Paso {index + 1}
                    </span>
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-soft text-2xl text-brand-coral">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="m-0 mt-6 font-display text-xl font-extrabold leading-snug text-zinc-950">
                    {item.title}
                  </h3>
                  <p className="m-0 mt-3 text-sm font-medium leading-7 text-zinc-600">
                    {item.desc}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
            <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
              <span className={sectionLabel}>Impacto comercial real</span>
              <h2 className={`${sectionTitle} mt-3`}>
                No se trata solo de subir productos. Se trata de vender con mas
                orden.
              </h2>
              <p className={`${sectionText} mt-5`}>
                La aplicacion esta pensada para que la tienda se vea mejor,
                responda mejor y convierta mejor sin volverte dependiente de un
                proceso complejo.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {outcomes.map((item, index) => (
                <motion.article
                  key={item.title}
                  className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm shadow-zinc-950/5"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                >
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-soft text-2xl text-brand-coral">
                    {item.icon}
                  </div>
                  <h3 className="m-0 mt-5 font-display text-xl font-extrabold leading-snug text-zinc-950">
                    {item.title}
                  </h3>
                  <p className="m-0 mt-3 text-sm font-medium leading-7 text-zinc-600">
                    {item.desc}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-zinc-50 px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-3xl text-left sm:text-center">
              <span className={sectionLabel}>Tiendas reales</span>
              <h2 className={`${sectionTitle} mx-auto mt-3`}>
                Marcas que usan MyStore para ordenar su venta diaria.
              </h2>
              <p className={`${sectionText} mx-auto mt-5`}>
                Cuando el link se entiende rapido, compartirlo se vuelve mucho
                mas facil.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
              {clientStores.map((item, index) => (
                <motion.div
                  key={item.url}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <LinkNext
                    href={`/u/${item.url}`}
                    className="grid min-h-[6.5rem] grid-cols-[4rem_1fr_auto] items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 text-zinc-950 no-underline shadow-sm shadow-zinc-950/5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-950/10"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-lg bg-brand-soft">
                      <img
                        src={item.logo}
                        alt={item.nombre}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <strong className="block truncate font-display text-base font-extrabold text-zinc-950">
                        {item.nombre}
                      </strong>
                      <span className="mt-1 block text-sm font-semibold text-zinc-500">
                        {item.rubro}
                      </span>
                    </div>
                    <FiArrowRight className="text-xl text-brand-coral" />
                  </LinkNext>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="precio" className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-3xl text-left sm:text-center">
              <span className={sectionLabel}>Planes MyStore</span>
              <h2 className={`${sectionTitle} mx-auto mt-3`}>
                Elegi el plan segun el tamano real de tu catalogo.
              </h2>
              <p className={`${sectionText} mx-auto mt-5`}>
                Premium esta pensado para emprendimientos que necesitan una vidriera clara. Pro es para mayoristas y tiendas con mucho volumen de productos.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {plans.map((plan, index) => (
                <motion.article
                  key={plan.name}
                  className={`relative overflow-hidden rounded-2xl border p-6 shadow-xl sm:p-8 ${
                    index === 1
                      ? "border-zinc-900 bg-zinc-950 text-white shadow-zinc-950/20"
                      : "border-zinc-200 bg-white text-zinc-950 shadow-zinc-950/8"
                  }`}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          index === 1
                            ? "bg-white/10 text-brand-cream"
                            : "bg-brand-soft text-brand-coral"
                        }`}
                      >
                        {plan.badge}
                      </span>
                      <h3 className="m-0 mt-5 font-display text-3xl font-bold leading-tight">
                        Plan {plan.name}
                      </h3>
                      <p
                        className={`m-0 mt-3 max-w-xl text-sm font-medium leading-7 ${
                          index === 1 ? "text-white/70" : "text-zinc-600"
                        }`}
                      >
                        {plan.audience}
                      </p>
                    </div>
                    <strong
                      className={`w-fit rounded-2xl px-4 py-3 text-sm font-semibold ${
                        index === 1
                          ? "bg-white text-zinc-950"
                          : "bg-slate-100 text-zinc-950"
                      }`}
                    >
                      {plan.limit}
                    </strong>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div
                      className={`rounded-2xl border p-5 ${
                        index === 1
                          ? "border-white/10 bg-white/5"
                          : "border-zinc-200 bg-slate-50"
                      }`}
                    >
                      <p className={`m-0 text-sm font-semibold ${index === 1 ? "text-white/60" : "text-zinc-500"}`}>
                        Mensual
                      </p>
                      <p className="m-0 mt-2 font-display text-4xl font-bold leading-none">
                        {plan.monthly}
                      </p>
                      <span className={`mt-2 block text-xs font-medium ${index === 1 ? "text-white/50" : "text-zinc-500"}`}>
                        Finales por mes
                      </span>
                    </div>

                    <div
                      className={`rounded-2xl border p-5 ${
                        index === 1
                          ? "border-white/10 bg-white/5"
                          : "border-zinc-200 bg-slate-50"
                      }`}
                    >
                      <p className={`m-0 text-sm font-semibold ${index === 1 ? "text-white/60" : "text-zinc-500"}`}>
                        Anual
                      </p>
                      <p className="m-0 mt-2 font-display text-4xl font-bold leading-none">
                        {plan.annual}
                      </p>
                      <span className={`mt-2 block text-xs font-medium ${index === 1 ? "text-white/50" : "text-zinc-500"}`}>
                        Mejor precio pagando el ano completo
                      </span>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="grid grid-cols-[1.5rem_1fr] gap-3">
                        <FiCheckCircle className={`mt-0.5 text-xl ${index === 1 ? "text-brand-cream" : "text-brand-coral"}`} />
                        <p className={`m-0 text-sm font-semibold leading-6 ${index === 1 ? "text-white/80" : "text-zinc-700"}`}>
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    {context.user ? (
                      <LinkNext
                        href="/panel-de-control"
                        className={`inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-bold no-underline transition hover:-translate-y-0.5 ${
                          index === 1
                            ? "bg-white text-zinc-950 hover:bg-zinc-100"
                            : "bg-zinc-950 text-white hover:bg-zinc-800"
                        }`}
                      >
                        Ir al panel
                        <FiArrowRight className="text-lg" />
                      </LinkNext>
                    ) : (
                      <button
                        className={`inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-md border-0 px-5 text-sm font-bold transition hover:-translate-y-0.5 ${
                          index === 1
                            ? "bg-white text-zinc-950 hover:bg-zinc-100"
                            : "bg-zinc-950 text-white hover:bg-zinc-800"
                        }`}
                        onClick={iniciarSesion}
                      >
                        <FcGoogle className="text-xl" />
                        Empezar con {plan.name}
                      </button>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-zinc-200 bg-slate-50 p-5 sm:p-6">
              <span className={sectionLabel}>Diferencia rapida</span>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <p className="m-0 text-sm font-medium leading-7 text-zinc-600">
                  <strong className="font-bold text-zinc-950">Premium</strong> es para emprendimientos, marcas chicas y tiendas que quieren ordenar su venta diaria con hasta 100 productos.
                </p>
                <p className="m-0 text-sm font-medium leading-7 text-zinc-600">
                  <strong className="font-bold text-zinc-950">Pro</strong> es para mayoristas, distribuidores o tiendas con catalogos grandes que necesitan productos sin limite.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#fafafa_0%,#fff7f0_100%)] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-950/10 sm:p-10 lg:p-12">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45 }}
            >
              <span className={sectionLabel}>Tu siguiente paso</span>
              <h2 className="m-0 mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight text-zinc-950 sm:text-4xl lg:text-5xl">
                Haz que tu catalogo deje de pedir explicaciones y empiece a
                empujar decisiones.
              </h2>
              <p className="m-0 mt-5 max-w-3xl text-base font-medium leading-8 text-zinc-600">
                Si tu negocio ya vende por WhatsApp o redes, el siguiente salto
                no siempre es una app compleja. A veces es una tienda clara,
                prolija y facil de compartir.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {context.user ? (
                  <LinkNext href="/panel-de-control" className={primaryAction}>
                    Seguir configurando mi tienda
                    <FiArrowRight className="text-lg" />
                  </LinkNext>
                ) : (
                  <button className={primaryAction} onClick={iniciarSesion}>
                    <FcGoogle className="text-xl" />
                    Crear mi catalogo con Google
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}



