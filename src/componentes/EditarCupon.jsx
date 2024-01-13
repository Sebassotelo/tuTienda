import React, { useContext, useState } from "react";
import style from "../styles/EditarCupon.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import { updateDoc, doc } from "firebase/firestore";
import { toast } from "sonner";

function EditarCupon({ item, setShow, show }) {
  const context = useContext(ContextGeneral);
  const { setCupones, llamadaDB } = useContext(ContextGeneral);
  const [activo, setActivo] = useState(item.activo);

  const activarDescuento = () => {
    setActivo(!activo);
  };

  const editarCupon = async (e) => {
    e.preventDefault();
    const cupon = e.target.inputCupon.value;
    const monto = e.target.inputMonto.value;

    const nuevoCupon = {
      cupon: cupon,
      monto: monto,
      id: item.id,
      activo: activo,
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

  return (
    <form action="" onSubmit={editarCupon} className={style.form}>
      <p>Nombre de Cupon:</p>
      <input type="text" id="inputCupon" defaultValue={item.cupon} />
      <p>Monto de Descuento %</p>
      <input type="text" id="inputMonto" defaultValue={item.monto} />
      {activo ? (
        <p className={style.icons__on} onClick={activarDescuento}>
          ON
        </p>
      ) : (
        <p className={style.icons__off} onClick={activarDescuento}>
          OFF
        </p>
      )}

      <div className={style.btn}>
        <button onClick={() => setShow(false)}>Cerrar</button>
        <button type="submit">Guardar</button>
      </div>
    </form>
  );
}

export default EditarCupon;
