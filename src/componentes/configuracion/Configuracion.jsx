import React, { useContext, useState } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import SubirFoto from "../SubirFoto";
import { toast } from "sonner";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Tutorial from "../tutorial/Tutorial";
import { updateProductsUsuarioForAccount } from "@/servicios/productosBatch";
import Suscripcion from "../suscripcion/Suscripcion";

const inputClass =
  "min-h-[46px] w-full rounded-xl border border-zinc-300 bg-slate-100 px-4 text-sm font-bold text-zinc-950 shadow-inner shadow-zinc-950/[0.04] outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 hover:bg-white focus:border-brand-coral focus:bg-white focus:ring-4 focus:ring-brand-coral/10";
const labelClass = "text-sm font-extrabold text-zinc-900";
const helperClass = "m-0 text-xs font-bold leading-5 text-zinc-500";
const primaryButton =
  "inline-flex min-h-[46px] w-full items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-extrabold text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit";
const secondaryButton =
  "inline-flex min-h-[46px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-extrabold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-400 hover:bg-slate-50";

function Configuracion() {
  const context = useContext(ContextGeneral);
  const { llamadaDB, setConfiguracion } = useContext(ContextGeneral);

  const [load, setLoad] = useState(true);
  const [image, setImage] = useState(() =>
    context.configuracion.logo ? context.configuracion.logo : ""
  );

  const [showTutorial, setShowTutorial] = useState(false);

  const setearUsuario = async (e) => {
    e.preventDefault(e);

    if (
      confirm(
        `Quiere asignar ${e.target.inputUsuario.value} como nombre de la tienda?`
      ) === true
    ) {
      const usuario = e.target.inputUsuario.value.toLowerCase();
      if (usuario.includes(" ")) {
        return toast.error(
          "El nombre de la tienda no puede contener espacios vacios"
        );
      }
      let productosArrayOriginal;
      const docRefQuery = collection(context.firestore, `users`);
      const q = query(docRefQuery, where("usuario", "==", usuario));
      const fetchUsuarios = await getDocs(q);
      fetchUsuarios.forEach((doc) => (productosArrayOriginal = doc.data()));

      if (!productosArrayOriginal) {
        const docRef = doc(context.firestore, `users/${context.user.email}`);

        await updateDoc(docRef, { usuario: usuario });
        await updateProductsUsuarioForAccount(
          context.firestore,
          context.user.email,
          usuario
        );
        e.target.inputUsuario.value = "";
        llamadaDB();
        toast.success(`Nombre de tienda asignada correctamente`);
      } else {
        toast.success(`El nombre de la tienda no se encuentra disponible`);
      }
    }
  };

  const aplicarConfiguracion = async (e) => {
    e.preventDefault(e);

    const instagram = e.target.inputInstagram.value;
    const whatsapp = e.target.inputWhatsapp.value;
    const slogan = e.target.inputSlogan.value;
    const maps = e.target.inputMaps.value;

    const docRef = doc(context.firestore, `users/${context.user.email}`);

    const newObject = {
      instagram: instagram,
      whatsapp: whatsapp,
      maps: maps,
      logo: image,
      slogan: slogan,
    };

    setConfiguracion(newObject);
    updateDoc(docRef, { configuracion: newObject });

    toast.success(`Perfil Configurado Correctamente`);

    e.target.inputInstagram.value = "";
    e.target.inputWhatsapp.value = "";
    e.target.inputMaps.value = "";
    e.target.inputSlogan.value = "";
    setImage("");
    llamadaDB();
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-7">
      <div className="rounded-2xl border border-zinc-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_14px_42px_rgba(15,23,42,0.045)] sm:p-6 lg:p-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
            Perfil publico
          </span>
          <h2 className="m-0 mt-2 font-display text-3xl font-extrabold leading-tight text-zinc-950">
            Configuracion general
          </h2>
          <p className="m-0 mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-600">
            Define el link de tu tienda, canales de contacto y datos visibles para tus clientes.
          </p>
        </div>
        <button
          type="button"
          className={secondaryButton}
          onClick={() => setShowTutorial(true)}
        >
          Ver tutorial
        </button>
      </div>

      <form
        action=""
        onSubmit={setearUsuario}
        className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_14px_42px_rgba(15,23,42,0.045)] ring-1 ring-zinc-950/[0.02] sm:p-6"
      >
        <div className="grid gap-2">
          <span className={labelClass}>Nombre de la tienda</span>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <input
              className={inputClass}
              type="text"
              id="inputUsuario"
              defaultValue={context.nombreTienda}
              placeholder="mi-tienda"
            />
            <button className={primaryButton} type="submit">
              Guardar link
            </button>
          </div>
          <p className={helperClass}>Este nombre se colocara en el link publico de tu tienda.</p>
        </div>
      </form>

      {context.nombreTienda != "" && (
        <form
          className="grid gap-6 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] ring-1 ring-zinc-950/[0.02] sm:p-7"
          onSubmit={aplicarConfiguracion}
        >
          <div>
            <h3 className="m-0 font-display text-xl font-extrabold text-zinc-950">
              Datos de contacto
            </h3>
            <p className="m-0 mt-1 text-sm font-medium leading-6 text-zinc-600">
              Estos datos aparecen en la tienda publica y ayudan a recibir pedidos claros.
            </p>
          </div>

          {image && (
            <div className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-slate-50 p-4">
              <img
                src={image}
                alt="Logo de tienda"
                className="h-16 w-16 rounded-xl object-cover ring-1 ring-zinc-200"
              />
              <p className="m-0 text-sm font-bold text-zinc-600">Logo listo para guardar.</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className={labelClass}>Instagram</span>
              <input
                className={inputClass}
                type="text"
                id="inputInstagram"
                defaultValue={context.configuracion && context.configuracion.instagram}
                placeholder="usuario"
              />
              <p className={helperClass}>Solo ingresa el nombre de usuario.</p>
            </label>

            <label className="grid gap-2">
              <span className={labelClass}>Numero de WhatsApp</span>
              <input
                className={inputClass}
                type="number"
                id="inputWhatsapp"
                defaultValue={context.configuracion && context.configuracion.whatsapp}
                placeholder="3794250000"
              />
              <p className={helperClass}>Sin 0 ni 15. A este numero se enviaran los pedidos.</p>
            </label>
          </div>

          <label className="grid gap-2">
            <span className={labelClass}>Slogan</span>
            <input
              className={inputClass}
              type="text"
              id="inputSlogan"
              defaultValue={context.configuracion && context.configuracion.slogan}
              placeholder="Una frase corta para tu tienda"
            />
          </label>

          <label className="grid gap-2">
            <span className={labelClass}>Link de Google Maps</span>
            <input
              className={inputClass}
              type="text"
              id="inputMaps"
              defaultValue={context.configuracion && context.configuracion.maps}
              placeholder="https://maps.google.com/..."
            />
            <p className={helperClass}>Pega el link completo de Google Maps.</p>
          </label>

          <div className="grid gap-2">
            <span className={labelClass}>Logo de la tienda</span>
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-slate-50 p-5 text-sm font-bold text-zinc-600 transition hover:border-zinc-400 hover:bg-white">
              <SubirFoto setImage={setImage} setLoad={setLoad} />
            </div>
          </div>

          {load ? (
            <button className={primaryButton} type="submit">
              Guardar configuracion
            </button>
          ) : (
            <button className={primaryButton} type="button" disabled>
              Cargando imagen...
            </button>
          )}
        </form>
      )}

      <Suscripcion />

      {showTutorial && (
        <Tutorial
          setShow={setShowTutorial}
          url="https://www.youtube.com/embed/ex2jtR_GPnY?si=V5UkFWW5xSe-0YK6"
        />
      )}
    </div>
  );
}

export default Configuracion;








