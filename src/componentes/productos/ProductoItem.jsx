import React, { useContext, useState } from "react";
import style from "../../styles/ProductoItem.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import Link from "next/link";

import { BsCartPlus } from "react-icons/bs";
import { TbDiscount2 } from "react-icons/tb";

import { Toaster, toast } from "sonner";
import Popup from "./popup/Popup";

function ProductoItem({ item }) {
  const context = useContext(ContextGeneral);
  const { setCarrito, actualizacionCarrito } = useContext(ContextGeneral);

  const [showPopUp, setShowPopUp] = useState(false);

  const agregarCarrito = () => {
    const nuevoArray = context.carrito;

    if (nuevoArray.find((e, i) => e.id === item.id)) {
      if (
        nuevoArray.find((e) => e.id === item.id).cantidad <
        nuevoArray.find((e) => e.id === item.id).stock
      ) {
        nuevoArray.find((e, i) => e.id === item.id).cantidad += 1;
        setCarrito(nuevoArray);
        actualizacionCarrito();
      } else {
        toast.error(
          `No hay stock suficiente para agregar esa cantidad al carrito`
        );
      }
    } else {
      let prec;
      if (item.descuento) {
        prec = item.precioDescuento;
      } else {
        prec = item.precio;
      }
      const itemCarrito = {
        title: item.title,
        precio: prec,
        id: item.id,
        img: item.img,
        stock: item.stock,
        cantidad: 1,
      };
      setCarrito((prev) => [...prev, itemCarrito]);

      actualizacionCarrito();
      toast.success(`${item.title} Agregado al carrito`);
    }
  };

  const handlePopUp = () => {
    setShowPopUp(!showPopUp);
  };

  return (
    <>
      <div className={style.container}>
        <div className={style.img} onClick={handlePopUp}>
          <img className={style.imgg} src={item.img} alt="" />
          {item.descuento && (
            <div className={style.descuentoIcon}>
              <TbDiscount2 />
            </div>
          )}
        </div>

        <div className={style.text}>
          <div className={style.text__title}>
            <h4>{item.title}</h4>
          </div>

          {item.descuento ? (
            <div className={style.text__precio}>
              <p style={{ textDecoration: "line-through", color: "grey" }}>
                ${item.precio}
              </p>{" "}
              <p>${item.precioDescuento}</p>
            </div>
          ) : (
            <p>${item.precio}</p>
          )}

          <div className={style.agregar__carrito} onClick={agregarCarrito}>
            <BsCartPlus />
          </div>
        </div>
      </div>

      {showPopUp && (
        <Popup
          setShow={handlePopUp}
          item={item}
          agregarCarrito={agregarCarrito}
        />
      )}
    </>
  );
}

export default ProductoItem;
