import React from "react";
import styles from "./ItemAbout.module.scss";

function ItemAbout({ icon, title, desc }) {
  return (
    <div className={styles.card}>
      {" "}
      <h4>
        {icon} {title}
      </h4>
      <p>{desc}</p>
    </div>
  );
}

export default ItemAbout;
