import ContextGeneral from "@/servicios/contextPrincipal";
import { updateDoc, doc } from "firebase/firestore";
import React, { useContext, useState } from "react";
import CuponItem from "./CuponItem";
import { toast } from "sonner";

const inputClass =
  "min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/10";

function Cupones() {
  const context = useContext(ContextGeneral);
  const { setCupones, setLoader, llamadaDB } = useContext(ContextGeneral);
  const docRef = doc(context.firestore, `users/${context.user.email}`);

  const [showCupon, setShowCupon] = useState(false);
  const [porcentajePesos, setPorcentajePesos] = useState(true);

  const crearCupon = async (e) => {
    e.preventDefault();

    setLoader(false);

    const cupon = e.target.inputCupon.value;
    const monto = e.target.inputMonto.value;
    const montoPesos = e.target.inputMontoPesos.value;

    let arr = [];
    arr = context.cupones.find(
      (item) => item.cupon.toLowerCase() == cupon.toLowerCase()
    );

    if (arr) {
      alert("Ya existe un cupon con este nombre");
    } else {
      const nuevoArray = [];
      nuevoArray.push(
        {
          cupon: cupon,
          monto: monto,
          montoPesos: montoPesos,
          montoPesosActivo: porcentajePesos,
          id: new Date().getTime(),
          activo: true,
        },
        ...context.cupones
      );

      setCupones(nuevoArray);

      await updateDoc(docRef, { cupones: [...nuevoArray] });
      llamadaDB();
      toast.success(`Cupon ${cupon} creado correctamente`);
    }

    e.target.inputCupon.value = "";
    e.target.inputMonto.value = "";
    setLoader(true);
  };

  const eliminarCupon = async (id) => {
    if (confirm(`Seguro que desea eliminar este cupon?`) === true) {
      const nuevoArray = context.cupones.filter((item) => item.id != id);

      await updateDoc(docRef, { cupones: [...nuevoArray] });
      llamadaDB();

      toast.success(`Cupon Eliminado`);
    }
  };

  const handleSwitch = () => {
    setPorcentajePesos(!porcentajePesos);
  };

  return (
    <div className="grid gap-5">
      {showCupon ? (
        <form
          action=""
          onSubmit={crearCupon}
          className="grid gap-4 rounded-2xl border border-zinc-200/80 bg-slate-50 p-5"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-zinc-800">Nombre de cupon</span>
              <input className={inputClass} type="text" id="inputCupon" required />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-zinc-800">Descuento %</span>
              <input className={inputClass} type="text" id="inputMonto" defaultValue="" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-zinc-800">Descuento $</span>
              <input className={inputClass} type="text" id="inputMontoPesos" defaultValue="" />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleSwitch}
              className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50"
            >
              Cambiar a {porcentajePesos ? "$" : "%"}
            </button>
            <span className="rounded-full bg-white px-3 py-2 text-sm font-extrabold text-zinc-700 ring-1 ring-zinc-200">
              Activo: {porcentajePesos ? "Porcentual" : "En $"}
            </span>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowCupon(false)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white transition hover:bg-zinc-800"
            >
              Crear cupon
            </button>
          </div>
        </form>
      ) : (
        <button
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white transition hover:bg-zinc-800 sm:w-fit"
          onClick={() => setShowCupon(true)}
          type="button"
        >
          Crear cupon
        </button>
      )}

      <div className="grid gap-3">
        {context.cupones &&
          context.cupones.map((item) => (
            <CuponItem key={item.id} item={item} eliminarCupon={eliminarCupon} />
          ))}
      </div>
    </div>
  );
}

export default Cupones;





