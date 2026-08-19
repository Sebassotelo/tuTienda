import ProductoNuevo from "@/componentes/ProductoNuevo";
import React, { useContext, useEffect, useState } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import ProductoPanel from "@/componentes/ProductoPanel";
import SeccionNueva from "@/componentes/SeccionNueva";
import Head from "next/head";
import Descuentos from "@/componentes/Descuentos";
import BuscadorPanel from "@/componentes/BuscadorPanel";
import { push } from "next/router";
import Loader from "@/componentes/Loader";
import Configuracion from "@/componentes/configuracion/Configuracion";
import {
  MdAdminPanelSettings,
  MdOutlineDiscount,
  MdOutlineShoppingBasket,
  MdPerson,
  MdOutlineSettings,
} from "react-icons/md";
import Tutorial from "@/componentes/tutorial/Tutorial";

const tabs = [
  {
    id: 0,
    label: "Configuracion",
    description: "Perfil, redes y suscripcion",
    icon: MdOutlineSettings,
  },
  {
    id: 1,
    label: "Productos",
    description: "Catalogo, categorias y stock",
    icon: MdOutlineShoppingBasket,
  },
  {
    id: 2,
    label: "Descuentos",
    description: "Promos, cupones y ofertas",
    icon: MdOutlineDiscount,
  },
];

function Index() {
  const context = useContext(ContextGeneral);
  const { verificarLogin } = useContext(ContextGeneral);

  const [showSeccion, setShowSeccion] = useState(0);
  const [showNuevoProducto, setShowNuevoProducto] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const mostrarVentana = () => {
    setShowNuevoProducto(!showNuevoProducto);
    document.body.style.overflow = showNuevoProducto ? "" : "hidden";
  };

  useEffect(() => {
    verificarLogin();

    if (context.estadoUsuario == 0) {
      push("/");
    }
  }, []);

  const activeTab = tabs.find((tab) => tab.id === showSeccion) || tabs[0];

  return (
    <>
      <Head>
        <title>{context.nombreTienda} | Panel de Control</title>
      </Head>

      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f2_0%,#ffffff_44%,#f8fafc_100%)] pb-28 pt-20 text-zinc-950 lg:pb-0 lg:pt-20 [&_*]:box-border">
        {context.loader ? (
          <div className="w-full lg:min-h-[calc(100vh-5rem)]">
            <aside className="fixed left-0 top-20 z-40 hidden h-[calc(100vh-5rem)] w-[304px] overflow-y-auto border-r border-zinc-200/80 bg-white/95 p-5 shadow-[14px_0_45px_rgba(15,23,42,0.07)] backdrop-blur lg:block">
              <div className="rounded-2xl border border-zinc-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#fff7f0_100%)] p-5 text-zinc-950 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
                  Panel MyStore
                </span>
                <h1 className="m-0 mt-2 font-display text-2xl font-extrabold leading-tight">
                  Gestion de tienda
                </h1>
                {context.nombreTienda && (
                  <button
                    type="button"
                    onClick={() => push(`/u/${context.nombreTienda}`)}
                    className="mt-5 inline-flex w-full items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm font-bold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    <MdPerson className="text-lg text-brand-coral" />
                    <span className="min-w-0 truncate">u/{context.nombreTienda}</span>
                  </button>
                )}
              </div>

              <nav className="mt-6 grid gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = showSeccion === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setShowSeccion(tab.id)}
                      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-brand-coral/25 bg-[#fff7f0] text-zinc-950 shadow-sm"
                          : "border-transparent bg-white text-zinc-600 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950"
                      }`}
                    >
                      <Icon
                        className={`mt-0.5 text-xl ${
                          active ? "text-brand-coral" : "text-zinc-400"
                        }`}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold">
                          {tab.label}
                        </span>
                        <span className="mt-1 block text-xs font-semibold leading-5 text-zinc-500">
                          {tab.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>

              {context.admin && (
                <button
                  type="button"
                  onClick={() => push("/admin")}
                  className="mt-4 flex w-full items-center gap-3 rounded-xl border border-brand-coral/25 bg-[#fff7f0] px-4 py-3 text-left text-sm font-extrabold text-zinc-950 shadow-sm transition hover:border-brand-coral/40 hover:bg-white"
                >
                  <MdAdminPanelSettings className="text-xl text-brand-coral" />
                  Admin global
                </button>
              )}
            </aside>

            <section className="min-w-0 px-4 sm:px-6 lg:ml-[304px] lg:px-8 lg:py-8 xl:px-10">
              <div className="mb-5 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-5 lg:hidden">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
                  Panel MyStore
                </span>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="m-0 font-display text-2xl font-extrabold leading-tight text-zinc-950">
                      {activeTab.label}
                    </h1>
                    <p className="m-0 mt-1 text-sm font-semibold text-zinc-600">
                      {activeTab.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    {context.nombreTienda && (
                      <button
                        type="button"
                        onClick={() => push(`/u/${context.nombreTienda}`)}
                        className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-extrabold text-zinc-700"
                      >
                        Ver tienda
                      </button>
                    )}
                    {context.admin && (
                      <button
                        type="button"
                        onClick={() => push("/admin")}
                        className="rounded-lg bg-[#fff7f0] px-3 py-2 text-xs font-extrabold text-brand-coral ring-1 ring-brand-coral/20"
                      >
                        Admin
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = showSeccion === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setShowSeccion(tab.id)}
                        className={`grid min-h-[72px] place-items-center rounded-xl border px-2 py-2 text-center text-xs font-extrabold transition ${
                          active
                            ? "border-rose-500/40 bg-rose-50 text-brand-coral"
                            : "border-zinc-200 bg-white text-zinc-600"
                        }`}
                      >
                        <Icon className="text-xl" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-[calc(100vh-9rem)] rounded-[1.35rem] border border-zinc-200/80 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.07)] ring-1 ring-zinc-950/[0.02] sm:p-6 lg:p-8">
                {showSeccion == 0 && <Configuracion />}
                {showSeccion == 1 && (
                  <div className="grid gap-6">
                    <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
                          Catalogo
                        </span>
                        <h2 className="m-0 mt-2 font-display text-3xl font-extrabold leading-tight text-zinc-950">
                          Productos
                        </h2>
                        <p className="m-0 mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-600">
                          Organiza categorias, carga productos y controla stock para tu tienda publica.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-zinc-200/80 bg-white px-4 text-sm font-extrabold text-zinc-700 transition hover:bg-zinc-100"
                        onClick={() => setShowTutorial(true)}
                      >
                        Ver tutorial
                      </button>
                    </div>

                    <SeccionNueva />

                    {context.secciones.length > 0 ? (
                      <>
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-900">
                          Los productos con stock igual a 0 no se mostraran en el catalogo publico.
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200/80 bg-zinc-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                          <button
                            type="button"
                            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-zinc-950 px-5 text-sm font-extrabold text-white shadow-lg shadow-zinc-950/10 transition hover:bg-zinc-800"
                            onClick={mostrarVentana}
                          >
                            Nuevo producto
                          </button>
                          {context.productos.length > 0 && <BuscadorPanel />}
                        </div>

                        <div className="grid gap-4">
                          {showNuevoProducto && (
                            <ProductoNuevo setShowNuevoProducto={mostrarVentana} />
                          )}

                          {context.productos &&
                            context.productos.map((item) => (
                              <ProductoPanel
                                key={item.id}
                                title={item.title}
                                precio={item.precio}
                                desc={item.desc}
                                img={item.img}
                                stock={item.stock}
                                caracteristicas={item.caracteristicas}
                                id={item.id}
                                seccion={item.seccion}
                                descuento={item.descuento}
                                precioDescuento={item.precioDescuento}
                                destacado={item.destacado}
                              />
                            ))}
                        </div>
                        {showTutorial && (
                          <Tutorial
                            url="https://www.youtube.com/embed/TKU37UBW5Io?si=Zo-mTJd3qJf-oH1I"
                            setShow={setShowTutorial}
                          />
                        )}
                      </>
                    ) : (
                      <div className="rounded-xl border border-zinc-200/80 bg-zinc-100 p-6 text-center text-sm font-bold text-zinc-600">
                        Crea una categoria para poder agregar productos.
                      </div>
                    )}
                  </div>
                )}
                {showSeccion == 2 && <Descuentos />}
              </div>
            </section>
          </div>
        ) : (
          <Loader />
        )}
      </main>
    </>
  );
}

export default Index;












