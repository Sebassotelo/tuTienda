import React from "react";
import style from "./clientes.module.scss";
import Link from "next/link";
function Clientes({ url, logo, nombre }) {
  return (
    <div className={style.container}>
      <Link href={`/u/${url}`}>
        <img src={logo} alt="" />
      </Link>
    </div>
  );
}

export default Clientes;
