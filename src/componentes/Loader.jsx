import React, { useContext } from "react";
import style from "../styles/Loader.module.scss";
import { motion } from "framer-motion";
import ContextGeneral from "@/servicios/contextPrincipal";

function Loader() {
  const context = useContext(ContextGeneral);
  return (
    <div className={style.container}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%" }}
      >
        <div className={style.img}>
          <img src={context.urlLogo} alt="" />
        </div>
      </motion.div>
    </div>
  );
}

export default Loader;
