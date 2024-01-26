import ContextGeneral from "@/servicios/contextPrincipal";
import { updateDoc, doc } from "firebase/firestore";
import React, { useContext, useState } from "react";

import style from "../styles/Cupones.module.scss";

import EditarCupon from "./EditarCupon";
import CuponItem from "./CuponItem";
import { toast } from "sonner";

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

    console.log(arr);

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
      toast.success(`Cupon ${cupon} de %${monto} creado Correctamente`);
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
    <div className={style.container}>
      {showCupon ? (
        <form action="" onSubmit={crearCupon} className={style.form}>
          <p>Nombre de Cupon:</p>
          <input type="text" id="inputCupon" required />

          <p>Monto de Descuento %</p>
          <input type="text" id="inputMonto" defaultValue={""} />

          <p>Monto de Descuento en $</p>
          <input type="text" id="inputMontoPesos" defaultValue={""} />
          {!porcentajePesos ? (
            <button type="button" onClick={handleSwitch}>
              Cambiar a %
            </button>
          ) : (
            <button type="button" onClick={handleSwitch}>
              Cambiar a $
            </button>
          )}
          <p>Activo: {porcentajePesos ? "Porcentual" : "En $"}</p>
          <div>
            <button type="button" onClick={() => setShowCupon(false)}>
              Cerrar
            </button>
            <button type="submit">Crear Cupon</button>
          </div>
        </form>
      ) : (
        <button
          className={style.crear__cupon}
          onClick={() => setShowCupon(true)}
        >
          Crear cupon
        </button>
      )}

      <div className={style.cupon}>
        {context.cupones &&
          context.cupones.map((item) => {
            return (
              <CuponItem
                key={item.id}
                item={item}
                eliminarCupon={eliminarCupon}
              />
            );
          })}
      </div>
    </div>
  );
}

export default Cupones;
