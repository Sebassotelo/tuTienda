import ContextGeneral from "@/servicios/contextPrincipal";
import { updateDoc, doc } from "firebase/firestore";
import React, { useContext, useState } from "react";

import style from "../styles/Cupones.module.scss";

import EditarCupon from "./EditarCupon";
import CuponItem from "./CuponItem";

function Cupones() {
  const context = useContext(ContextGeneral);
  const { setCupones, setLoader } = useContext(ContextGeneral);
  const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);

  const [showCupon, setShowCupon] = useState(false);

  const crearCupon = async (e) => {
    e.preventDefault();

    setLoader(false);

    const cupon = e.target.inputCupon.value;
    const monto = e.target.inputMonto.value;

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
          id: new Date().getTime(),
          activo: true,
        },
        ...context.cupones
      );

      setCupones(nuevoArray);

      await updateDoc(docRef, { cupones: [...nuevoArray] });
    }

    e.target.inputCupon.value = "";
    e.target.inputMonto.value = "";
    setLoader(true);
  };

  const eliminarCupon = async (id) => {
    if (confirm(`Seguro que desea eliminar este cupon?`) === true) {
      const nuevoArray = context.cupones.filter((item) => item.id != id);
      setCupones(nuevoArray);

      await updateDoc(docRef, { cupones: [...nuevoArray] });
    }
  };

  return (
    <div className={style.container}>
      {showCupon ? (
        <form action="" onSubmit={crearCupon} className={style.form}>
          <p>Nombre de Cupon:</p>
          <input type="text" id="inputCupon" required />
          <p>Monto de Descuento</p>
          <input type="text" id="inputMonto" required />
          <div>
            <button type="submit" onClick={() => setShowCupon(false)}>
              Cerrar
            </button>
            <button type="submit">Crear Cupon</button>
          </div>
        </form>
      ) : (
        <p className={style.crear__cupon} onClick={() => setShowCupon(true)}>
          Crear cupon Nuevo
        </p>
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
