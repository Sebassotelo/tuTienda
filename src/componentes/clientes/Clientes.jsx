import React from "react";
import style from "./clientes.module.scss";
function Clientes({ url, logo, nombre }) {
  return (
    <div className={style.container}>
      <a href={url} target="_blank">
        <img src={logo} alt="" />
      </a>
    </div>
  );
}

export default Clientes;
