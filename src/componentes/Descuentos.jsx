import React, { useState, useContext, useEffect } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import { saveProductsForAccount } from "@/servicios/productosBatch";
import ProductoPanel from "./ProductoPanel";
import Cupones from "./Cupones";
import Tutorial from "./tutorial/Tutorial";

const selectClass =
  "min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/10";
const primaryButton =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white transition hover:bg-zinc-800";
const secondaryButton =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50";

function Descuentos() {
  const context = useContext(ContextGeneral);
  const { setLoader, llamadaDB } = useContext(ContextGeneral);

  const [contadorProductos, setContadorProductos] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const descuentoSeccion = async (e) => {
    e.preventDefault();
    const seccion = e.target.inputSeccion.value;
    if (
      confirm(`Seguro que desea activar el descuento a la seccion ${seccion}?`) ===
      true
    ) {
      setLoader(false);

      let nuevoArray = context.productosCopia.map((item) => ({ ...item }));

      for (let i = 0; i < nuevoArray.length; i++) {
        if (nuevoArray[i].seccion == seccion) {
          nuevoArray[i].descuento = true;
        }
      }

      await saveProductsForAccount({
        firestore: context.firestore,
        email: context.user.email,
        usuario: context.nombreTienda,
        products: nuevoArray,
        premium: context.premium,
      });

      await llamadaDB();
      setContadorProductos(nuevoArray.filter((item) => item.descuento).length);
    }
  };

  const quitarDescuentoSeccion = async (e) => {
    e.preventDefault();

    const seccion = e.target.inputSeccion.value;
    if (
      confirm(
        `Seguro que desea desactivar el descuento a la seccion ${seccion}?`
      ) === true
    ) {
      setLoader(false);

      let nuevoArray = context.productosCopia.map((item) => ({ ...item }));
      for (let i = 0; i < nuevoArray.length; i++) {
        if (nuevoArray[i].seccion == seccion) {
          nuevoArray[i].descuento = false;
        }
      }

      await saveProductsForAccount({
        firestore: context.firestore,
        email: context.user.email,
        usuario: context.nombreTienda,
        products: nuevoArray,
        premium: context.premium,
      });
      await llamadaDB();
      setContadorProductos(nuevoArray.filter((item) => item.descuento).length);
    }
  };

  const descuentoTotal = async () => {
    if (
      confirm(`Seguro que desea activar el descuento de todos los productos?`) ===
      true
    ) {
      setLoader(false);

      let nuevoArray = context.productosCopia.map((item) => ({ ...item }));

      for (let i = 0; i < nuevoArray.length; i++) {
        nuevoArray[i].descuento = true;
      }

      await saveProductsForAccount({
        firestore: context.firestore,
        email: context.user.email,
        usuario: context.nombreTienda,
        products: nuevoArray,
        premium: context.premium,
      });
      await llamadaDB();
      setContadorProductos(nuevoArray.filter((item) => item.descuento).length);
    }
  };

  const quitarDescuentoTotal = async () => {
    if (
      confirm(
        `Seguro que desea desactivar el descuento de todos los productos?`
      ) === true
    ) {
      setLoader(false);

      let nuevoArray = context.productosCopia.map((item) => ({ ...item }));

      for (let i = 0; i < nuevoArray.length; i++) {
        nuevoArray[i].descuento = false;
      }

      await saveProductsForAccount({
        firestore: context.firestore,
        email: context.user.email,
        usuario: context.nombreTienda,
        products: nuevoArray,
        premium: context.premium,
      });
      await llamadaDB();
      setContadorProductos(nuevoArray.filter((item) => item.descuento).length);
    }
  };

  const contadorProductosDescuento = () => {
    const nuevoArray = context.productosCopia.filter((item) => item.descuento);
    setContadorProductos(nuevoArray.length);
  };

  useEffect(() => {
    contadorProductosDescuento();
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
            Promociones
          </span>
          <h2 className="m-0 mt-2 font-display text-3xl font-extrabold leading-tight text-zinc-950">
            Descuentos y cupones
          </h2>
          <p className="m-0 mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-700">
            Configura promociones por categoria, descuentos generales y cupones para impulsar ventas.
          </p>
        </div>
        <button type="button" className={secondaryButton} onClick={() => setShowTutorial(true)}>
          Ver tutorial
        </button>
      </div>

      {context.secciones.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
            <form action="" onSubmit={descuentoSeccion} className="grid gap-3">
              <h3 className="m-0 font-display text-xl font-extrabold text-zinc-950">
                Activar descuento por categoria
              </h3>
              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-zinc-800">Categoria</span>
                <select className={selectClass} id="inputSeccion">
                  {context.secciones.map((item, i) => (
                    <option key={i}>{item}</option>
                  ))}
                </select>
              </label>
              <button className={primaryButton} type="submit">
                Aplicar descuento
              </button>
            </form>
            <button
              type="button"
              onClick={descuentoTotal}
              className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-emerald-300 bg-white px-5 text-sm font-extrabold text-emerald-700 transition hover:bg-emerald-50"
            >
              Activar en todos los productos
            </button>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
            <form action="" onSubmit={quitarDescuentoSeccion} className="grid gap-3">
              <h3 className="m-0 font-display text-xl font-extrabold text-zinc-950">
                Quitar descuento por categoria
              </h3>
              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-zinc-800">Categoria</span>
                <select className={selectClass} id="inputSeccion">
                  {context.secciones.map((item, i) => (
                    <option key={i}>{item}</option>
                  ))}
                </select>
              </label>
              <button className={primaryButton} type="submit">
                Quitar descuento
              </button>
            </form>
            <button
              type="button"
              onClick={quitarDescuentoTotal}
              className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-red-300 bg-white px-5 text-sm font-extrabold text-red-700 transition hover:bg-red-50"
            >
              Desactivar en todos los productos
            </button>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.055)] ring-1 ring-zinc-950/[0.02] sm:p-6">
        <div className="mb-5">
          <h3 className="m-0 font-display text-xl font-extrabold text-zinc-950">
            Cupones
          </h3>
          <p className="m-0 mt-2 text-sm font-medium leading-6 text-zinc-700">
            Genera descuentos porcentuales o de monto fijo para compartir con tus clientes.
          </p>
        </div>
        <Cupones />
      </section>

      <section className="grid gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
              Productos activos
            </span>
            <h3 className="m-0 mt-2 font-display text-xl font-extrabold text-zinc-950">
              Productos en descuento
            </h3>
          </div>
          <p className="m-0 rounded-full bg-[#fff7f0] px-4 py-2 text-sm font-extrabold text-brand-coral">
            {contadorProductos} productos
          </p>
        </div>

        <div className="grid gap-4">
          {context.productosCopia
            .filter((item) => item.descuento)
            .map((item) => (
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
                destacado={item.destacado}
                precioDescuento={item.precioDescuento}
              />
            ))}
        </div>
      </section>

      {showTutorial && (
        <Tutorial
          url="https://www.youtube.com/embed/XTjFmHw9xiU?si=o5OCwa985aqs8hBW"
          setShow={setShowTutorial}
        />
      )}
    </div>
  );
}

export default Descuentos;









