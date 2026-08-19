import React, { useContext } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  MdAdd,
  MdInventory2,
  MdOutlineDeleteOutline,
  MdOutlineFolder,
} from "react-icons/md";
import { toast } from "sonner";

function SeccionNueva() {
  const context = useContext(ContextGeneral);
  const { setProductos, setSecciones } = useContext(ContextGeneral);
  const productosBase = context.productosCopia || context.productos || [];
  const totalProductos = productosBase.length;
  const totalCategorias = context.secciones.length;

  const nuevaSeccion = async (e) => {
    e.preventDefault(e);

    let seccion = e.target.inputSeccion.value;

    const docRef = doc(context.firestore, `users/${context.user.email}`);
    const consulta = await getDoc(docRef);
    const infoDocu = consulta.data();

    const newArray = [];

    while (seccion.charAt(seccion.length - 1) === " ") {
      seccion = seccion.slice(0, -1);
    }
    newArray.push(seccion, ...infoDocu.secciones);

    await updateDoc(docRef, { secciones: [...newArray] });
    setSecciones(newArray);
    toast.success(`Se agrego correctamente la categoria ${seccion}`);
    e.target.inputSeccion.value = "";
  };

  const eliminarSeccion = async (id) => {
    if (confirm(`Seguro que desea eliminar la categoria ${id} ?`) === true) {
      const nuevoArray = context.secciones.filter((item) => item != id);

      const docRef = doc(context.firestore, `users/${context.user.email}`);
      await updateDoc(docRef, { secciones: [...nuevoArray] });
      setSecciones(nuevoArray);
      toast.success(`Se elimino correctamente la categoria ${id}`);
    }
  };

  const filtrarSeccion = (id) => {
    const nuevoArray = context.productosCopia.filter(
      (item) => item.seccion == id
    );
    setProductos(nuevoArray);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.055)] ring-1 ring-zinc-950/[0.02]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.62fr)]">
        <div className="p-5 sm:p-6">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
            Categorias
          </span>
          <h3 className="m-0 mt-2 font-display text-xl font-extrabold text-zinc-950">
            Organiza tu catalogo
          </h3>
          <p className="m-0 mt-2 text-sm font-medium leading-6 text-zinc-700">
            Agrega categorias representativas y concisas para que tus clientes encuentren mas rapido lo que necesitan.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-200/80 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.06em] text-zinc-500">
                <MdOutlineFolder className="text-base text-brand-coral" />
                Creadas
              </div>
              <strong className="mt-2 block font-display text-3xl font-extrabold leading-none text-zinc-950">
                {totalCategorias}
              </strong>
            </div>
            <div className="rounded-2xl border border-zinc-200/80 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.06em] text-zinc-500">
                <MdInventory2 className="text-base text-brand-coral" />
                Productos
              </div>
              <strong className="mt-2 block font-display text-3xl font-extrabold leading-none text-zinc-950">
                {totalProductos}
              </strong>
            </div>
          </div>
        </div>

        <form
          action=""
          onSubmit={nuevaSeccion}
          className="grid content-start gap-3 border-t border-zinc-100 bg-slate-50/70 p-5 sm:p-6 lg:border-l lg:border-t-0"
        >
          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-zinc-800">
              Nombre de la categoria nueva
            </span>
            <input
              className="min-h-[46px] w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm font-bold text-zinc-950 shadow-inner shadow-zinc-950/[0.04] outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
              type="text"
              id="inputSeccion"
              placeholder="Ej: Remeras, Combos, Accesorios"
            />
          </label>
          <button
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800"
            type="submit"
          >
            <MdAdd className="text-lg" />
            Agregar categoria
          </button>
        </form>
      </div>

      <div className="border-t border-zinc-100 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h4 className="m-0 text-base font-extrabold text-zinc-950">
              Categorias configuradas
            </h4>
            <p className="m-0 mt-1 text-sm font-medium text-zinc-600">
              Toca una categoria para ver sus productos en la lista.
            </p>
          </div>
          {totalCategorias > 0 && (
            <span className="w-fit rounded-full border border-zinc-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-zinc-600">
              {totalCategorias} activas
            </span>
          )}
        </div>

        {context.secciones.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {context.secciones.map((item, i) => {
              const productosCategoria = productosBase.filter(
                (producto) => producto.seccion == item
              ).length;

              return (
                <div
                  className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-slate-50 p-3 transition hover:-translate-y-0.5 hover:border-brand-coral/30 hover:bg-white hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                  key={i}
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 border-0 bg-transparent p-0 text-left"
                    onClick={() => filtrarSeccion(item)}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand-coral shadow-sm ring-1 ring-zinc-200/80">
                      <MdOutlineFolder className="text-xl" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-extrabold text-zinc-900 transition group-hover:text-brand-coral">
                        {item}
                      </span>
                      <span className="mt-0.5 block text-xs font-bold text-zinc-500">
                        {productosCategoria} productos
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-400 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => eliminarSeccion(item)}
                    title={`Eliminar ${item}`}
                  >
                    <MdOutlineDeleteOutline />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-slate-50 p-5 text-sm font-bold text-zinc-500">
            Todavia no hay categorias. Crea la primera para empezar a cargar productos.
          </div>
        )}
      </div>
    </section>
  );
}

export default SeccionNueva;
