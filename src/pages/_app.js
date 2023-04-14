import "@/styles/globals.css";
import Layout from "@/componentes/Layout";
import Context from "@/servicios/context";

export default function App({ Component, pageProps }) {
  return (
    <Context>
      <Layout>
        {" "}
        <Component {...pageProps} />{" "}
      </Layout>
    </Context>
  );
}
