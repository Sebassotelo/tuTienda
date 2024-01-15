import React, { useEffect, useState } from "react";
import ContextPrincipal from "./contextPrincipal";
import firebaseApp from "./firebase";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

function Context(props) {
  const [productos, setProductos] = useState([]);
  const [productosCopia, setProductosCopia] = useState([]);
  const [productosPublicos, setProductosPublicos] = useState([]);
  const [productosPublicosCopia, setProductosPublicosCopia] = useState([]);
  const [contadorOfert, setContadorOfert] = useState(0);
  const [cupones, setCupones] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [secciones, setSecciones] = useState([]);
  const [estadoUsuario, setEstadoUsuario] = useState(0);
  const [premium, setPremium] = useState({});

  // 0 = No logueado
  // 1 = Logueado
  const [user, setUser] = useState(null);
  let user1 = "";

  const [configuracion, setConfiguracion] = useState({});
  const [nombreTienda, setNombreTienda] = useState("");

  const [carrito, setCarrito] = useState([]);
  const [actuCarrito, setActuCarrito] = useState(false);
  const [loader, setLoader] = useState(false);
  const urlLogo = "https://i.imgur.com/ZQ7yfOm.png";

  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  const inspectorSesion = (usuarioFirebase) => {
    //en caso de que haya seison iniciada
    if (usuarioFirebase) {
      user1 = usuarioFirebase;
      setUser(usuarioFirebase);
      setEstadoUsuario(1);
      buscarOCrearUsuario();
    } else {
      //en caso de que haya seison iniciada
      setUser(null);
      setEstadoUsuario(0);
    }
  };
  const verificarLogin = () => {
    onAuthStateChanged(auth, inspectorSesion);
  };

  const buscarOCrearUsuario = async () => {
    const docRef = doc(firestore, `users/${user1.email}`);
    const consulta = await getDoc(docRef);
    if (consulta.exists()) {
      llamadaDB();
    } else {
      const fecha = new Date();
      const fechaDeRegistro = `${fecha.getDate()}/${
        fecha.getMonth() + 1
      }/${fecha.getFullYear()}`;
      await setDoc(docRef, {
        cupones: [],
        idCuenta: new Date().getTime().toString(),
        items: [],
        secciones: [],
        usuario: [],
        configuracion: {},
        fechaDeRegistro: fechaDeRegistro,
        premium: { nivel: 1, activo: true },
      });
      llamadaDB();
    }
  };

  const llamadaDB = async () => {
    setLoader(false);
    console.log("CORREO", user1.email);
    const docRef = doc(
      firestore,
      `users/${user1.email ? user1.email : user.email}`
    );
    const consulta = await getDoc(docRef);
    const infoDocu = consulta.data();
    console.log("LLAMDA DB", infoDocu);
    setProductos(infoDocu.items);
    setProductosCopia(infoDocu.items);
    setCupones(infoDocu.cupones);
    setConfiguracion(infoDocu.configuracion);
    setNombreTienda(infoDocu.usuario);

    const array = infoDocu.items.filter((item) => item.stock > 0);

    setProductosPublicos(array);
    setProductosPublicosCopia(array);
    setSecciones(infoDocu.secciones);

    const nuevoArray = array.filter((e) => e.descuento);
    setContadorOfert(nuevoArray.length);

    // setProductos(infoDocu.noticias);
    setLoader(true);
  };

  const actualizacionCarrito = () => {
    setActuCarrito(!actuCarrito);
  };

  return (
    <ContextPrincipal.Provider
      value={{
        productos: productos,
        productosCopia: productosCopia,
        productosPublicos: productosPublicos,
        productosPublicosCopia: productosPublicosCopia,
        contadorOfert: contadorOfert,
        cupones: cupones,
        estadoUsuario: estadoUsuario,
        loader: loader,
        auth: auth,
        firestore: firestore,
        user: user,
        user1: user1,
        secciones: secciones,
        carrito: carrito,
        actuCarrito: actuCarrito,
        busqueda: busqueda,
        urlLogo: urlLogo,
        configuracion: configuracion,
        nombreTienda: nombreTienda,
        premium: premium,
        setSecciones,
        setProductos,
        setProductosCopia,
        llamadaDB,
        inspectorSesion,
        setLoader,
        setCarrito,
        actualizacionCarrito,
        setProductosPublicos,
        setProductosPublicosCopia,
        verificarLogin,
        setCupones,
        setBusqueda,
        buscarOCrearUsuario,
        setConfiguracion,
        setNombreTienda,
        setContadorOfert,
        setNombreTienda,
        setPremium,
      }}
    >
      {props.children}
    </ContextPrincipal.Provider>
  );
}

export default Context;
