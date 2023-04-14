import React, { useContext } from "react";
import style from "../../styles/ProductoItem.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import Link from "next/link";

function ProductoItem({ item }) {
  const context = useContext(ContextGeneral);
  const { setCarrito, actualizacionCarrito } = useContext(ContextGeneral);

  const agregarCarrito = () => {
    const nuevoArray = context.carrito;

    if (nuevoArray.find((e, i) => e.id === item.id)) {
      nuevoArray.find((e, i) => e.id === item.id).cantidad += 1;
      setCarrito(nuevoArray);
      actualizacionCarrito();
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
    }

    console.log(nuevoArray);
  };
  return (
    <div className={style.container}>
      <Link href={`/productos/${item.id}`}>
        <div className={style.img}>
          <img src={item.img} alt="" />
          {item.descuento && (
            <div className={style.descuentoIcon}>
              <p>%</p>
            </div>
          )}
        </div>
      </Link>
      <div className={style.text}>
        <h4>{item.title}</h4>
        {item.descuento ? (
          <>
            <p style={{ textDecoration: "line-through" }}>${item.precio}</p>{" "}
            <span>${item.precioDescuento}</span>
          </>
        ) : (
          <p>${item.precio}</p>
        )}

        <p className={style.agregar__carrito} onClick={agregarCarrito}>
          Agregar al Carrito
        </p>
      </div>
    </div>
  );
}

export default ProductoItem;
