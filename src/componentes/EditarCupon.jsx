import React, { useContext, useState } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import { updateDoc, doc } from "firebase/firestore";
import { toast } from "sonner";

const inputClass =
  "min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/10";

function EditarCupon({ item, setShow }) {
  const context = useContext(ContextGeneral);
  const { llamadaDB } = useContext(ContextGeneral);
  const [activo, setActivo] = useState(item.activo);
  const [porcentajePesos, setPorcentajePesos] = useState(item.montoPesosActivo);

  const activarDescuento = () => {
    setActivo(!activo);
  };

  const editarCupon = async (e) => {
    e.preventDefault();
    const cupon = e.target.inputCupon.value;
    const monto = e.target.inputMonto.value;
    const montoPesos = e.target.inputMontoPesos.value;

    const nuevoCupon = {
      cupon: cupon,
      monto: monto,
      id: item.id,
      activo: activo,
      montoPesos: montoPesos,
      montoPesosActivo: porcentajePesos,
    };

    const cuponesCopia = [...context.cupones];
    const index = context.cupones.findIndex((e) => e.id == item.id);

    cuponesCopia[index] = nuevoCupon;

    const docRef = doc(context.firestore, `users/${context.user.email}`);
    await updateDoc(docRef, { cupones: [...cuponesCopia] });
    llamadaDB();
    toast.success("Cambio Guardado Correctamente");

    setShow(false);
  };

  const handleSwitch = () => {
    setPorcentajePesos(!porcentajePesos);
  };

  return (
    <form
      action=""
      onSubmit={editarCupon}
      className="grid gap-4 rounded-2xl border border-zinc-200/80 bg-slate-50 p-5"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-zinc-800">Nombre de cupon</span>
          <input className={inputClass} type="text" id="inputCupon" defaultValue={item.cupon} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-zinc-800">Descuento %</span>
          <input className={inputClass} type="text" id="inputMonto" defaultValue={item.monto} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-zinc-800">Descuento $</span>
          <input className={inputClass} type="text" id="inputMontoPesos" defaultValue={item.montoPesos} />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50"
            type="button"
            onClick={handleSwitch}
          >
            Cambiar a {porcentajePesos ? "%" : "$"}
          </button>
          <button
            type="button"
            onClick={activarDescuento}
            className={`inline-flex min-h-[40px] items-center justify-center rounded-lg px-4 text-sm font-extrabold transition ${
              activo ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {activo ? "ON" : "OFF"}
          </button>
        </div>
        <span className="text-sm font-bold text-zinc-700">
          Activo: {porcentajePesos ? "Descuento en $" : "Descuento en %"}
        </span>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => setShow(false)}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50"
        >
          Cerrar
        </button>
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white transition hover:bg-zinc-800"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

export default EditarCupon;





