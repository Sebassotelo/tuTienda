import React, { useContext, useState } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { saveProductsForAccount, getMaxProducts, getProductBatchStateByAccount } from "@/servicios/productosBatch";
import SubirFoto from "./SubirFoto";

const inputClass =
  "min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/10";
const labelClass = "text-sm font-extrabold text-zinc-800";
const helperClass = "m-0 text-xs font-semibold leading-5 text-zinc-700";

function TogglePill({ active, onClick, label }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-slate-50 p-3">
      <span className="text-sm font-extrabold text-zinc-700">{label}</span>
      <button
        type="button"
        onClick={onClick}
        className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
          active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}
      >
        {active ? "ON" : "OFF"}
      </button>
    </div>
  );
}

function ProductoNuevo({ setShowNuevoProducto }) {
  const [image, setImage] = useState("");
  const [descuentoActivo, setDescuentoActivo] = useState(false);
  const [destacadoActivo, setDestacadoActivo] = useState(false);
  const [loadImg, setLoadImg] = useState(true);

  const context = useContext(ContextGeneral);
  const { setProductos, setProductosCopia } = useContext(ContextGeneral);

  const agregarProducto = async (e) => {
    e.preventDefault(e);

    let title = e.target.inputTitle.value;
    let desc = e.target.inputDesc.value;
    const precio = e.target.inputPrecio.value;
    const stock = e.target.inputStock.value;
    let seccion = e.target.inputSeccion.value;
    let caracteristicas = e.target.inputCaracteristicas.value;
    const precioDescuento = e.target.inputPrecioDescuento.value;

    if (
      title.includes("&") ||
      desc.includes("&") ||
      seccion.includes("&") ||
      caracteristicas.includes("&")
    ) {
      title = title.replace(/&/g, "y");
      desc = desc.replace(/&/g, "y");
      seccion = seccion.replace(/&/g, "y");
      caracteristicas = caracteristicas.replace(/&/g, "y");
    }

    const docRef = doc(context.firestore, `users/${context.user.email}`);
    const consulta = await getDoc(docRef);
    const infoDocu = consulta.data();

    const productosBatchState = await getProductBatchStateByAccount(
      context.firestore,
      context.user.email
    );
    const productosActuales = productosBatchState.exists
      ? productosBatchState.products
      : infoDocu.items || [];

    const newArray = [];

    newArray.push(
      {
        id: new Date().getTime(),
        title: title,
        stock: stock,
        precio: precio,
        desc: desc,
        seccion: seccion,
        img: image,
        caracteristicas: caracteristicas,
        descuento: descuentoActivo,
        precioDescuento: precioDescuento,
        destacado: destacadoActivo,
      },
      ...productosActuales
    );

    const maxProducts = getMaxProducts(context.premium);

    if (newArray.length <= maxProducts) {
      await saveProductsForAccount({
        firestore: context.firestore,
        email: context.user.email,
        usuario: context.nombreTienda,
        products: newArray,
        premium: context.premium,
      });
      setProductos(newArray);
      setProductosCopia(newArray);
      toast.success(`${title} Agregado con exito `);
    } else {
      toast.error(`Ha alcanzado el limite de productos de su plan`);
    }

    e.target.inputTitle.value = "";
    e.target.inputDesc.value = "";
    e.target.inputPrecio.value = "";
    e.target.inputStock.value = "";
    e.target.inputSeccion.value = "";
    e.target.inputCaracteristicas.value = "";
    setImage("");
    setShowNuevoProducto(false);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center overflow-y-auto bg-zinc-900/60 px-4 py-6 backdrop-blur-sm sm:py-10">
      <form
        action=""
        className="grid w-full max-w-3xl gap-5 rounded-2xl bg-white p-5 shadow-2xl shadow-zinc-950/25 sm:p-7"
        onSubmit={agregarProducto}
      >
        <div className="flex flex-col gap-3 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
              Nuevo producto
            </span>
            <h2 className="m-0 mt-2 font-display text-2xl font-extrabold text-zinc-950">
              Cargar producto
            </h2>
            <p className="m-0 mt-1 text-sm font-medium leading-6 text-zinc-700">
              Completa los datos visibles en el catalogo publico.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNuevoProducto(false)}
            className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 sm:col-span-2">
            <span className={labelClass}>Nombre del producto</span>
            <input className={inputClass} type="text" required id="inputTitle" />
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className={labelClass}>Descripcion</span>
            <input className={inputClass} type="text" id="inputDesc" />
          </label>

          <label className="grid gap-2">
            <span className={labelClass}>Precio</span>
            <input className={inputClass} type="number" required id="inputPrecio" />
          </label>

          <label className="grid gap-2">
            <span className={labelClass}>Precio oferta</span>
            <input className={inputClass} type="number" required id="inputPrecioDescuento" />
          </label>

          <label className="grid gap-2">
            <span className={labelClass}>Stock</span>
            <input className={inputClass} type="number" required id="inputStock" />
          </label>

          <label className="grid gap-2">
            <span className={labelClass}>Categoria</span>
            <select className={inputClass} id="inputSeccion">
              {context.secciones.map((item, i) => (
                <option key={i}>{item}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className={labelClass}>Caracteristicas</span>
            <input className={inputClass} type="text" id="inputCaracteristicas" />
            <p className={helperClass}>Separar con comas. Ej: Estampada,verde,XL.</p>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TogglePill
            label="Descuento"
            active={descuentoActivo}
            onClick={() => setDescuentoActivo(!descuentoActivo)}
          />
          <TogglePill
            label="Destacado"
            active={destacadoActivo}
            onClick={() => setDestacadoActivo(!destacadoActivo)}
          />
        </div>

        <div className="grid gap-3 rounded-xl border border-dashed border-zinc-300 bg-slate-50 p-4">
          <span className={labelClass}>Imagen del producto</span>
          <SubirFoto setImage={setImage} setLoad={setLoadImg} />
          {image && (
            <img
              src={image}
              alt="Vista previa"
              className="h-40 w-full rounded-xl object-cover ring-1 ring-zinc-200"
            />
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setShowNuevoProducto(false)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          {loadImg ? (
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white transition hover:bg-zinc-800"
            >
              Agregar producto
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white opacity-60"
            >
              Cargando imagen...
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProductoNuevo;







