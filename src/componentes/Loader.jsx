import React from "react";
import style from "../styles/Loader.module.scss";

function Loader() {
  return (
    <div className={style.container}>
      <span>Cargando...</span>
    </div>
  );
}

export default Loader;
