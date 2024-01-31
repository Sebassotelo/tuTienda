import React from "react";
import style from "./Tutorial.module.scss";

function Tutorial({ setShow, url }) {
  return (
    <div className={style.main}>
      <div className={style.container}>
        <iframe
          width="560"
          height="315"
          src={url}
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
        <button onClick={() => setShow(false)}>Cerrar</button>
      </div>
    </div>
  );
}

export default Tutorial;
