import React from "react";
import styles from "./Popup.module.scss";

function Popup({ setShow, item, agregarCarrito }) {
  return (
    <div className={styles.container}>
      <div className={styles.container__item}>
        <div className={styles.img}>
          <img src={item.img} alt="" />
        </div>

        <div className={styles.descripcion}>
          <h4>{item.title}</h4>
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
          <p>{item.desc}</p>
          <button onClick={agregarCarrito}>Agregar al Carrito</button>
        </div>
        <button className={styles.cerrar} onClick={setShow}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default Popup;
