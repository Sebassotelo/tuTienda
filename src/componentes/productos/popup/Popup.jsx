import React, { useContext, useEffect, useState, useRef } from "react";
import styles from "./Popup.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";

import { AiOutlineShoppingCart } from "react-icons/ai";

function Popup({ setShow, item, agregarCarrito }) {
  const context = useContext(ContextGeneral);
  const { setBusqueda, setProductosPublicos } = useContext(ContextGeneral);

  const filtrarSeccion = () => {
    const nuevoArray = context.productosPublicosCopia.filter(
      (it) => it.seccion == item.seccion
    );
    setProductosPublicos(nuevoArray);
  };

  const divRef = useRef(null);

  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setShow();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.container__item} ref={divRef}>
        <div className={styles.img}>
          <img src={item.img} loading="lazy" alt="" />
        </div>

        <div className={styles.descripcion}>
          <div className={styles.text}>
            <p
              className={styles.p}
              onClick={() => {
                setProductosPublicos(context.productosPublicosCopia);
                setShow();
                setBusqueda("");
              }}
            >
              Inicio/
            </p>
            <p
              className={styles.p}
              onClick={() => {
                filtrarSeccion();
                setBusqueda("");
                setShow();
              }}
            >
              {item.seccion}
            </p>
            <p> / {item.title}</p>
          </div>

          <h4>{item.title}</h4>

          <p>{item.desc}</p>
          {item.descuento ? (
            <div className={styles.precioDescuento}>
              <h3 style={{ textDecoration: "line-through", color: "grey" }}>
                ${item.precio}
              </h3>{" "}
              <h3>${item.precioDescuento}</h3>
            </div>
          ) : (
            <h3>${item.precio}</h3>
          )}

          <p>Stock: {item.stock}</p>
          <button
            onClick={() => {
              agregarCarrito();
              setShow();
            }}
          >
            <AiOutlineShoppingCart className={styles.icon} />
            Agregar al Carrito
          </button>
          <button type="button" className={styles.cerrar} onClick={setShow}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;
