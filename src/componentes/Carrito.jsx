import React, { useContext, useEffect, useState } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import {
  MdClose,
  MdKeyboardArrowDown,
  MdOutlineDeleteOutline,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { BsCartPlus, BsWhatsapp } from "react-icons/bs";
import { Toaster, toast } from "sonner";
import Link from "next/link";

const formatPrice = (value) => `$${Number(value || 0).toLocaleString("es-AR")}`;

function Carrito({ showCarrito, show }) {
  const context = useContext(ContextGeneral);
  const { setCarrito, actualizacionCarrito } = useContext(ContextGeneral);
  const [precioFinal, setPrecioFinal] = useState(0);
  const [cantidadFinal, setCantidadFinal] = useState(0);
  const [pedido, setPedido] = useState();
  const [cuponActivo, setCuponActivo] = useState({});
  const [showCupon, setShowCupon] = useState(false);
  const [estadoPedido, setEstadoPedido] = useState(0);

  const eliminarProducto = (id) => {
    const nuevoArray = context.carrito.filter((item) => item.id != id);
    setCarrito(nuevoArray);
    actualizacionCarrito();
  };

  const confirmarPedido = () => {
    const productosSinStock = context.carrito.filter(
      (obj) => !context.productosPublicosCopia.some((o) => o.id === obj.id)
    );

    if (cantidadFinal <= 0) return;

    if (productosSinStock.length > 0) {
      toast.error(
        `Sin stock en: '${productosSinStock.map((item) => item.title)}'`
      );
      return;
    }

    const pedidoCopy = context.carrito
      .map(
        (e) =>
          `${e.cantidad}X%20${e.seccion}%20/%20${e.title}%20-----%20$$${
            e.precio * e.cantidad
          }%20%0A`
      )
      .join("");

    let cuponDesc = "";

    if (cuponActivo && cuponActivo.activo) {
      if (cuponActivo.montoPesosActivo) {
        cuponDesc = `%0ACupon%20${cuponActivo.cupon}%20activo.%20Descuento%20de%20$${cuponActivo.montoPesos}.`;
      } else {
        cuponDesc = `%0ACupon%20${cuponActivo.cupon}%20activo.%20Descuento%20de%20${cuponActivo.monto}%20porciento.`;
      }
    }

    setPedido(
      `Hola!%20Este%20es%20mi%20pedido:%0A%0A${pedidoCopy}%0ATotal:%20$${precioFinal}${cuponDesc}`
    );
    setEstadoPedido(2);
    toast.success("Envianos el pedido por WhatsApp");
  };

  const sumarCantidad = (id) => {
    const nuevoArray = context.carrito;

    if (nuevoArray.find((e) => e.id === id)) {
      if (nuevoArray.find((e) => e.id === id).cantidad >= 0) {
        if (
          nuevoArray.find((e) => e.id === id).cantidad <
          nuevoArray.find((e) => e.id === id).stock
        ) {
          nuevoArray.find((e) => e.id === id).cantidad += 1;
          setCarrito(nuevoArray);
          actualizacionCarrito();
        } else {
          toast.error("No hay stock suficiente para agregar esa cantidad al carrito");
        }
      }
    }
  };

  const restarCantidad = (id) => {
    const nuevoArray = context.carrito;

    if (nuevoArray.find((e) => e.id === id)) {
      if (nuevoArray.find((e) => e.id === id).cantidad > 1) {
        nuevoArray.find((e) => e.id === id).cantidad -= 1;
        setCarrito(nuevoArray);
        actualizacionCarrito();
      }
    }
  };

  const aplicarCupon = (e) => {
    e.preventDefault();

    const cup = e.target.inputCupon.value;
    const descuento = context.cupones.filter(
      (item) => item.cupon.toLowerCase() == cup.toLowerCase()
    );

    if (descuento[0] && descuento[0].activo) {
      setCuponActivo(descuento[0]);
      actualizacionCarrito();
      toast.success("Cupon aplicado");
    } else {
      toast.error("El cupon ingresado ha expirado o es incorrecto");
      setCuponActivo({});
    }

    e.target.inputCupon.value = "";
  };

  useEffect(() => {
    const totales = context.carrito.reduce(
      (acc, item) => ({
        precio: acc.precio + item.precio * item.cantidad,
        cantidad: acc.cantidad + item.cantidad,
      }),
      { precio: 0, cantidad: 0 }
    );

    let totalConDescuento = totales.precio;

    if (cuponActivo && cuponActivo.activo) {
      if (cuponActivo.montoPesosActivo) {
        totalConDescuento = totales.precio - Number(cuponActivo.montoPesos || 0);
      } else {
        totalConDescuento =
          totales.precio - totales.precio * (Number(cuponActivo.monto || 0) / 100);
      }
    }

    setPrecioFinal(Math.max(0, totalConDescuento));
    setCantidadFinal(totales.cantidad);
    setEstadoPedido(0);
  }, [context.actuCarrito, context.carrito, cuponActivo]);

  return (
    <>
      <div className="hidden sm:block">
        <Toaster />
      </div>
      <div className="sm:hidden">
        <Toaster position="top-center" />
      </div>

      <div
        className={`fixed inset-0 z-[650] bg-zinc-950/25 backdrop-blur-[2px] transition-opacity duration-300 ${
          show ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => showCarrito(false)}
      />

      <aside
        className="fixed inset-y-0 right-0 z-[700] flex h-dvh w-full max-w-[430px] flex-col overflow-hidden border-l border-zinc-200 bg-white text-zinc-950 shadow-[-24px_0_70px_rgba(15,23,42,0.20)] transition-transform duration-300 sm:w-[430px]"
        style={{ transform: show ? "translateX(0)" : "translateX(110%)" }}
        aria-hidden={!show}
      >
        <div className="h-1.5 w-full bg-[linear-gradient(90deg,#ff4545_0%,#ff8a00_45%,#1f1f23_100%)]" />

        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-5">
          <div>
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.12em] text-brand-coral">
              Pedido
            </p>
            <h4 className="m-0 mt-1 font-display text-3xl font-extrabold leading-none">
              Mi carrito
            </h4>
            <p className="m-0 mt-2 text-sm font-semibold text-zinc-500">
              {cantidadFinal} {cantidadFinal === 1 ? "producto" : "productos"} seleccionados
            </p>
          </div>

          <button
            type="button"
            onClick={() => showCarrito(false)}
            className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-zinc-200 bg-slate-50 text-2xl text-zinc-800 transition hover:bg-zinc-100"
            aria-label="Cerrar carrito"
          >
            <MdClose />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {context.carrito && context.carrito.length > 0 ? (
              <div className="grid gap-3">
                {context.carrito.map((item) => {
                  return (
                    <div
                      className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm"
                      key={item.id}
                    >
                      <Link
                        href={`/productos/${item.id}`}
                        className="block h-[72px] w-[72px] cursor-pointer overflow-hidden rounded-xl bg-slate-100"
                      >
                        <img
                          className="h-full w-full object-cover"
                          src={item.img}
                          alt={item.title || "Producto"}
                        />
                      </Link>

                      <div className="grid min-w-0 gap-2">
                        <Link
                          href={`/productos/${item.id}`}
                          className="line-clamp-2 cursor-pointer text-sm font-extrabold leading-tight text-zinc-950 no-underline hover:text-brand-coral"
                        >
                          {item.title}
                        </Link>

                        <div className="inline-flex w-fit items-center rounded-xl bg-slate-100 p-1">
                          <button
                            type="button"
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border-0 bg-white text-lg font-black text-zinc-900 shadow-sm transition hover:bg-zinc-950 hover:text-white"
                            onClick={() => restarCantidad(item.id)}
                            aria-label="Restar producto"
                          >
                            -
                          </button>
                          <span className="grid h-8 min-w-9 place-items-center px-2 text-sm font-black text-zinc-950">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border-0 bg-white text-lg font-black text-zinc-900 shadow-sm transition hover:bg-zinc-950 hover:text-white"
                            onClick={() => sumarCantidad(item.id)}
                            aria-label="Sumar producto"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="grid justify-items-end gap-3">
                        <p className="m-0 whitespace-nowrap font-display text-base font-extrabold text-zinc-950">
                          {formatPrice(item.cantidad * item.precio)}
                        </p>
                        <button
                          type="button"
                          onClick={() => eliminarProducto(item.id)}
                          className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-red-100 bg-red-50 text-xl text-red-500 transition hover:bg-red-500 hover:text-white"
                          aria-label="Eliminar producto"
                        >
                          <MdOutlineDeleteOutline />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid min-h-[320px] place-items-center rounded-2xl bg-slate-50 px-6 text-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl text-zinc-900 shadow-sm">
                    <BsCartPlus />
                  </div>
                  <p className="m-0 mt-4 font-display text-2xl font-extrabold">
                    Tu carrito esta vacio
                  </p>
                  <p className="m-0 mt-2 text-sm font-semibold text-zinc-500">
                    Agrega productos para preparar tu pedido por WhatsApp.
                  </p>
                </div>
              </div>
            )}
          </div>

          <footer className="border-t border-zinc-100 bg-white px-5 py-4 shadow-[0_-18px_50px_rgba(15,23,42,0.06)]">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-0 py-2 text-left"
              onClick={() => setShowCupon(!showCupon)}
            >
              <span>
                <span className="block text-sm font-extrabold text-zinc-950">
                  Tenes un cupon?
                </span>
                <span className="block text-xs font-semibold text-zinc-500">
                  Aplicalo antes de enviar el pedido.
                </span>
              </span>
              {showCupon ? (
                <MdOutlineKeyboardArrowUp className="text-2xl text-zinc-500" />
              ) : (
                <MdKeyboardArrowDown className="text-2xl text-zinc-500" />
              )}
            </button>

            {showCupon && (
              <div className="pb-3">
                {cuponActivo && cuponActivo.activo ? (
                  <p className="m-0 rounded-xl bg-emerald-50 px-3 py-3 text-sm font-extrabold text-emerald-700">
                    {cuponActivo.montoPesosActivo
                      ? `Cupon aplicado de ${formatPrice(cuponActivo.montoPesos)}`
                      : `Cupon aplicado de ${cuponActivo.monto}%`}
                  </p>
                ) : (
                  <form
                    action=""
                    onSubmit={aplicarCupon}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"
                  >
                    <input
                      className="min-h-[44px] min-w-0 rounded-xl border border-zinc-200 bg-slate-100 px-3 text-sm font-bold outline-none transition focus:border-brand-coral focus:bg-white focus:ring-4 focus:ring-red-100"
                      type="text"
                      id="inputCupon"
                      placeholder="Ingresar cupon"
                      required
                    />
                    <button
                      className="min-h-[44px] cursor-pointer rounded-xl border-0 bg-zinc-950 px-4 text-sm font-extrabold text-white shadow-lg shadow-zinc-950/15 transition hover:bg-zinc-800"
                      type="submit"
                    >
                      Aplicar
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="mb-4 flex items-end justify-between gap-4 border-t border-zinc-100 pt-4">
              <div>
                <p className="m-0 text-xs font-extrabold uppercase tracking-[0.1em] text-zinc-400">
                  Total
                </p>
                <p className="m-0 mt-1 text-sm font-semibold text-zinc-500">
                  Sin costo de envio incluido
                </p>
              </div>
              <p className="m-0 whitespace-nowrap font-display text-3xl font-extrabold text-zinc-950">
                {formatPrice(precioFinal)}
              </p>
            </div>

            {estadoPedido == 0 && (
              <button
                type="button"
                onClick={() => setEstadoPedido(1)}
                disabled={cantidadFinal === 0}
                className="flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-2xl border-0 bg-zinc-950 px-5 text-sm font-extrabold text-white shadow-xl shadow-zinc-950/20 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
              >
                Realizar pedido
              </button>
            )}

            {estadoPedido == 1 && (
              <button
                type="button"
                onClick={confirmarPedido}
                className="flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-2xl border-0 bg-brand-coral px-5 text-sm font-extrabold text-white shadow-xl shadow-red-500/20 transition hover:bg-red-500"
              >
                Confirmar pedido
              </button>
            )}

            {estadoPedido == 2 && (
              <a
                className="flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 text-sm font-extrabold text-white no-underline shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-600"
                href={`https://api.whatsapp.com/send?phone=549${context.configuracion.whatsapp}&text=${pedido}`}
                target="_blank"
                rel="noreferrer"
              >
                <BsWhatsapp className="text-lg" />
                Ir a WhatsApp
              </a>
            )}
          </footer>
        </div>
      </aside>
    </>
  );
}

export default Carrito;
