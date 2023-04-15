import React from "react";
import style from "../styles/Loader.module.scss";

function Loader() {
  return (
    <div className={style.container}>
      <div className={style.img}>
        <img src="https://i.imgur.com/qYhFpiY.png" alt="" />
        <span>Cargando...</span>
      </div>
    </div>
  );
}

export default Loader;
