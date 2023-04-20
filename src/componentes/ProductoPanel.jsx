import React, { useContext, useState } from "react";
import style from "../styles/ProductoPanel.module.scss";
import EditarProducto from "./EditarProducto";
import ContextGeneral from "@/servicios/contextPrincipal";
import { GrEdit } from "react-icons/gr";
import { MdOutlineDeleteOutline } from "react-icons/md";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

function ProductoPanel({
  title,
  precio,
  desc,
  img,
  stock,
  caracteristicas,
  id,
  seccion,
  descuento,
  precioDescuento,
  destacado,
}) {
  const [editarProducto, setEditarProducto] = useState(false);
  const context = useContext(ContextGeneral);
  const { setProductos } = useContext(ContextGeneral);

  const eliminarProducto = async (e) => {
    if (confirm("Seguro que desea eliminar este producto?") === true) {
      e.preventDefault(e);

      const nuevoItems = context.productosCopia.filter((item) => item.id != id);

      const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);
      await updateDoc(docRef, { items: [...nuevoItems] });
      setProductos(nuevoItems);
    }
  };

  const mostrarEditar = () => {
    setEditarProducto(!editarProducto);
    if (editarProducto === true) {
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }
  };

  return (
    <>
      <div className={style.container}>
        <div className={style.img}>
          <img src={img} alt="" />
        </div>
        <div className={style.desc}>
          <div className={style.text}>
            <h3>{title}</h3>
            <p>Stock: {stock}</p>
            <p>Seccion: {seccion} </p>
            <p>
              Precio:
              {descuento ? (
                <span>${precioDescuento}</span>
              ) : (
                <span>${precio}</span>
              )}
            </p>

            <div className={style.check__container}>
              <div className={style.checkbox}>
                <p>Descuento:</p>
                {descuento ? (
                  <p
                    className={style.descuentoActivo}
                    style={{ backgroundColor: "green" }}
                  >
                    ON
                  </p>
                ) : (
                  <p
                    className={style.descuentoActivo}
                    style={{ backgroundColor: "red" }}
                  >
                    OFF
                  </p>
                )}
              </div>
              <div className={style.checkbox}>
                <p>Destacado:</p>
                {destacado ? (
                  <p
                    className={style.descuentoActivo}
                    style={{ backgroundColor: "green" }}
                  >
                    ON
                  </p>
                ) : (
                  <p
                    className={style.descuentoActivo}
                    style={{ backgroundColor: "red" }}
                  >
                    OFF
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className={style.btn}>
            <GrEdit onClick={mostrarEditar} className={style.btn__icon} />
            <MdOutlineDeleteOutline
              onClick={eliminarProducto}
              className={style.btn__icon}
            />
          </div>
        </div>
      </div>

      {editarProducto && (
        <EditarProducto
          title2={title}
          desc2={desc}
          precio2={precio}
          img2={img}
          stock2={stock}
          seccion2={seccion}
          caracteristicas2={caracteristicas}
          id2={id}
          descuento2={descuento}
          precioDescuento2={precioDescuento}
          setEditarProducto={mostrarEditar}
          destacado2={destacado}
        />
      )}
    </>
  );
}

export default ProductoPanel;
