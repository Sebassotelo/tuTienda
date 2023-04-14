import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "../styles/Home.module.scss";
import Layout from "@/componentes/Layout";
import { useContext, useEffect } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const context = useContext(ContextGeneral);
  const { verificarLogin } = useContext(ContextGeneral);

  useEffect(() => {
    verificarLogin();
  }, []);

  return (
    <>
      <main className={styles.main}>
        <p>{context.prueba}</p>
      </main>
    </>
  );
}
