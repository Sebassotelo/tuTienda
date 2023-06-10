import React from "react";
import style from "../styles/Loader.module.scss";
import { motion } from "framer-motion";

function Loader() {
  return (
    <div className={style.container}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%" }}
      >
        <div className={style.img}>
          <img src="https://i.imgur.com/DJfPyy2.png" alt="" />
          <span>Cargando...</span>
        </div>
      </motion.div>
    </div>
  );
}

export default Loader;
