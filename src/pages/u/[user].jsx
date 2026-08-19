import React, { useContext, useEffect, useMemo, useState } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import ProductosTienda from "@/componentes/productos/ProductosTienda";
import Head from "next/head";
import { BiMenu } from "react-icons/bi";
import Loader from "@/componentes/Loader";
import { useRouter } from "next/router";
import { query, collection, where, getDocs } from "firebase/firestore";
import Perfil from "@/componentes/perfil/Perfil";
import { canPublishStore, getProductBatchStateByUsuario } from "@/servicios/productosBatch";

const filterBaseClass =
  "flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-0 py-2.5 text-sm font-semibold transition";

function User() {
  const context = useContext(ContextGeneral);
  const {
    setProductosPublicos,
    setProductosPublicosCopia,
    setBusqueda,
    setLoader,
    setSecciones,
    setContadorOfert,
    setCupones,
    setNombreTienda,
    setConfiguracion,
    setPremium,
  } = useContext(ContextGeneral);

  const router = useRouter();
  const [showCategoria, setShowCategoria] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const categoryCounts = useMemo(() => {
    return context.secciones.map((section) => ({
      name: section,
      count: context.productosPublicosCopia.filter((item) => item.seccion === section).length,
    }));
  }, [context.secciones, context.productosPublicosCopia]);

  const hasOffers = context.productosPublicosCopia.some((item) => item.descuento);

  const resetFilters = () => {
    setProductosPublicos(context.productosPublicosCopia);
    setBusqueda("");
    setActiveFilter("all");
  };

  const filtrarSeccion = (id) => {
    const nuevoArray = context.productosPublicosCopia.filter((item) => item.seccion === id);
    setProductosPublicos(nuevoArray);
    setBusqueda("");
    setActiveFilter(id);
  };

  const filtrarSeccionOfertas = () => {
    const nuevoArray = context.productosPublicosCopia.filter((item) => item.descuento);
    setProductosPublicos(nuevoArray);
    setBusqueda("");
    setActiveFilter("offers");
  };

  const llamada = async () => {
    const user = router.query.user;
    const usersRef = collection(context.firestore, "users");
    const q = query(usersRef, where("usuario", "==", user));
    const snapshot = await getDocs(q);
    let tiendaData = null;

    snapshot.forEach((doc) => {
      tiendaData = doc.data();
    });

    if (tiendaData) {
      setCupones(tiendaData.cupones || []);
      setConfiguracion(tiendaData.configuracion || {});
      setNombreTienda(tiendaData.usuario || "");
      setPremium(tiendaData.premium || {});

      const productosBatchState = await getProductBatchStateByUsuario(context.firestore, user);
      const productosPublicos = productosBatchState.exists
        ? productosBatchState.products
        : tiendaData.items || [];
      const productosConStock = productosPublicos.filter((item) => Number(item.stock) > 0);

      setProductosPublicos(productosConStock);
      setProductosPublicosCopia(productosConStock);
      setSecciones(tiendaData.secciones || []);
      setContadorOfert(productosConStock.filter((item) => item.descuento).length);
      setActiveFilter("all");
    }

    setLoader(true);
  };

  useEffect(() => {
    if (router.query.user) {
      setLoader(false);
      llamada();
    }
  }, [router.query.user]);

  const FilterButton = ({ id, label, count, onClick }) => {
    const active = activeFilter === id;

    return (
      <button
        type="button"
        onClick={onClick}
        className={`${filterBaseClass} ${
          active
            ? "text-zinc-950"
            : "text-zinc-600 hover:text-zinc-950"
        }`}
      >
        <span className={`min-w-0 truncate ${active ? "text-brand-coral" : ""}`}>{label}</span>
        <span
          className={`text-xs font-semibold ${active ? "text-brand-coral" : "text-zinc-400"}`}
        >
          {count}
        </span>
      </button>
    );
  };

  if (!context.loader) return <Loader />;

  return (
    <>
      <Head>
        <title>{context.nombreTienda} | Tienda Virtual</title>
      </Head>

      {canPublishStore(context.premium) ? (
        <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#fff7f0_0%,#f8fafc_34%,#ffffff_100%)] pb-10 text-zinc-950">
          <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-6 px-3 py-5 sm:px-6 lg:px-8">
            <Perfil configuracion={context.configuracion} />

            <section className="grid min-w-0 gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
              <aside className="hidden rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.055)] lg:block">
                <div className="mb-4 border-b border-zinc-100 pb-3">
                  <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-coral">
                    Catalogo
                  </p>
                  <h2 className="m-0 mt-1 font-display text-xl font-bold text-zinc-950">
                    Categorias
                  </h2>
                </div>

                <div className="grid gap-2">
                  <FilterButton
                    id="all"
                    label="Todo"
                    count={context.productosPublicosCopia.length}
                    onClick={resetFilters}
                  />
                  {hasOffers && (
                    <FilterButton
                      id="offers"
                      label="Ofertas"
                      count={context.contadorOfert}
                      onClick={filtrarSeccionOfertas}
                    />
                  )}
                  {categoryCounts
                    .filter((category) => category.count > 0)
                    .map((category) => (
                      <FilterButton
                        key={category.name}
                        id={category.name}
                        label={category.name}
                        count={category.count}
                        onClick={() => filtrarSeccion(category.name)}
                      />
                    ))}
                </div>
              </aside>

              <div className="grid min-w-0 gap-4">
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.055)] lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowCategoria((current) => !current)}
                    className="flex min-h-[46px] w-full cursor-pointer items-center justify-between rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white"
                  >
                    <span className="inline-flex items-center gap-2">
                      <BiMenu className="text-xl" /> Categorias
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
                      {context.productosPublicos.length}
                    </span>
                  </button>

                  {showCategoria && (
                    <div className="mt-3 grid gap-2">
                      <FilterButton
                        id="all"
                        label="Todo"
                        count={context.productosPublicosCopia.length}
                        onClick={() => {
                          resetFilters();
                          setShowCategoria(false);
                        }}
                      />
                      {hasOffers && (
                        <FilterButton
                          id="offers"
                          label="Ofertas"
                          count={context.contadorOfert}
                          onClick={() => {
                            filtrarSeccionOfertas();
                            setShowCategoria(false);
                          }}
                        />
                      )}
                      {categoryCounts
                        .filter((category) => category.count > 0)
                        .map((category) => (
                          <FilterButton
                            key={category.name}
                            id={category.name}
                            label={category.name}
                            count={category.count}
                            onClick={() => {
                              filtrarSeccion(category.name);
                              setShowCategoria(false);
                            }}
                          />
                        ))}
                    </div>
                  )}
                </div>

                <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.055)] sm:min-h-[420px] sm:p-5">
                  {context.productosPublicos.length !== 0 ? (
                    <ProductosTienda />
                  ) : (
                    <div className="grid min-h-[260px] place-items-center rounded-xl bg-slate-50 px-4 text-center">
                      <p className="m-0 max-w-sm text-sm font-semibold text-zinc-500">
                        No se encontraron productos para este filtro.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </section>
          </div>
        </main>
      ) : (
        <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 text-center">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <p className="m-0 font-display text-2xl font-bold text-zinc-950">
              Esta tienda no se encuentra disponible.
            </p>
          </div>
        </main>
      )}
    </>
  );
}

export default User;






