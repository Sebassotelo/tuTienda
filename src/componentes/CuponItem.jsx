import React, { useState } from "react";
import EditarCupon from "./EditarCupon";
import { GrEdit } from "react-icons/gr";
import { MdOutlineDeleteOutline } from "react-icons/md";

import style from "../styles/CuponItem.module.scss";

function CuponItem({ item, eliminarCupon }) {
  const [showEditar, setShowEditar] = useState(false);
  return (
    <div className={style.container}>
      <div key={item.id} className={style.cupon__item}>
        <div className={style.desc}>
          <p>{item.cupon}</p>
          {item.montoPesosActivo ? (
            <p>${item.montoPesos}</p>
          ) : (
            <p>{item.monto}%</p>
          )}
          {item.activo ? (
            <p className={style.icons__on}>ON</p>
          ) : (
            <p className={style.icons__off}>OFF</p>
          )}
        </div>
        <p className={style.pesosActivo}>
          {item.montoPesosActivo ? "En pesos" : "Porcentual"}
        </p>
        <div className={style.icons}>
          <GrEdit
            className={style.icons__item}
            onClick={() => setShowEditar(!showEditar)}
          />
          <MdOutlineDeleteOutline
            className={style.icons__item}
            onClick={() => eliminarCupon(item.id)}
          />
        </div>
      </div>
      {showEditar && (
        <EditarCupon item={item} setShow={setShowEditar} show={showEditar} />
      )}
    </div>
  );
}

export default CuponItem;
