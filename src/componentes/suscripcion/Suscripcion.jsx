import React, { useContext } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import { push } from "next/router";
import Link from "next/link";
import {
  canPublishStore,
  getPlanDisplayName,
  getPlanLimitLabel,
  getSubscriptionDaysLeft,
  isSubscriptionExpired,
} from "@/servicios/productosBatchCore";

function formatSubscriptionDate(value) {
  if (!value) return "Sin configurar";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin configurar";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatSubscriptionDateTime(value) {
  if (!value) return "Sin configurar";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin configurar";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getSubscriptionHistory(premium = {}) {
  return Array.isArray(premium?.historialPagos)
    ? [...premium.historialPagos].sort((a, b) => {
        const dateA = new Date(a.fechaPago || a.registradoEn || 0).getTime();
        const dateB = new Date(b.fechaPago || b.registradoEn || 0).getTime();
        return dateB - dateA;
      })
    : [];
}

function getPaidMonths(history = [], premium = {}) {
  const paidMonths = history
    .filter((item) => item.tipo === "pago")
    .reduce((total, item) => total + Number(item.mesesPagados || 0), 0);

  if (paidMonths > 0) return paidMonths;
  if (premium?.duracion === "1 anio") return 12;
  if (premium?.duracion === "1 mes") return 1;
  return 0;
}

function Suscripcion() {
  const context = useContext(ContextGeneral);

  const premium = context.premium || {};
  const activo = canPublishStore(premium);
  const expired = isSubscriptionExpired(premium);
  const planNivel = Number(premium?.nivel || 0);
  const planName = getPlanDisplayName(premium);
  const planLimit = getPlanLimitLabel(premium);
  const hasPaidPlan = planNivel > 0;
  const daysLeft = getSubscriptionDaysLeft(premium);
  const history = getSubscriptionHistory(premium);
  const paidMonths = getPaidMonths(history, premium);
  const fallbackHistory =
    history.length === 0 && hasPaidPlan
      ? [
          {
            id: "current-subscription",
            tipo: "pago",
            plan: planName,
            duracion: premium.duracion || "Sin periodo",
            mesesPagados: paidMonths,
            fechaPago: premium.fechaPago,
            fechaVencimiento: premium.fechaVencimiento,
            registradoEn: premium.actualizadoEn,
            registradoPor: premium.actualizadoPor,
          },
        ]
      : history;
  const statusLabel = !hasPaidPlan
    ? "Free"
    : expired
    ? "Vencida"
    : activo
    ? "Vigente"
    : "Desactivada";
  const paymentCount = history.filter((item) => item.tipo === "pago").length || (hasPaidPlan ? 1 : 0);

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.055)] ring-1 ring-zinc-950/[0.02] sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
            Estado de suscripcion
          </span>
          <button
            type="button"
            onClick={() => activo && push(`/u/${context.nombreTienda}`)}
            className={`mt-2 flex flex-wrap items-center gap-2 border-0 bg-transparent p-0 text-left font-display text-xl font-extrabold ${
              activo ? "cursor-pointer text-zinc-950" : "cursor-default text-zinc-700"
            }`}
          >
            Tienda publica
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                activo ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {activo ? "Activa" : "Desactivada"}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                expired
                  ? "bg-red-50 text-red-700"
                  : hasPaidPlan
                  ? "bg-[#fff7f0] text-brand-coral"
                  : "bg-slate-100 text-zinc-700"
              }`}
            >
              {planName} - {statusLabel}
            </span>
          </button>

          <p className="m-0 mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-700">
            {hasPaidPlan
              ? `Tu plan ${planName} permite ${planLimit.toLowerCase()}. Tus clientes pueden ver tu tienda en www.mystore.com.ar/u/${context.nombreTienda} mientras la suscripcion este vigente.`
              : "El plan Free conserva tus datos, pero no publica la tienda. Elegi Premium o Pro para activar el catalogo publico."}
          </p>
        </div>

        {hasPaidPlan ? (
          <a
            href="https://www.mercadopago.com.ar/subscriptions#from-section=menu"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-extrabold text-zinc-700 no-underline transition hover:bg-slate-50"
          >
            Configurar suscripcion
          </a>
        ) : (
          <Link
            href="/#precio"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white no-underline transition hover:bg-zinc-800"
          >
            Ver planes
          </Link>
        )}
      </div>

      <div className="mt-5 grid gap-3 border-t border-zinc-100 pt-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">
            Plan actual
          </span>
          <strong className="mt-2 block font-display text-xl font-extrabold text-zinc-950">
            {planName}
          </strong>
          <p className="m-0 mt-1 text-sm font-semibold text-zinc-500">{planLimit}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">
            Ultimo pago
          </span>
          <strong className="mt-2 block font-display text-xl font-extrabold text-zinc-950">
            {formatSubscriptionDate(premium.fechaPago)}
          </strong>
          <p className="m-0 mt-1 text-sm font-semibold text-zinc-500">
            {premium.duracion ? `Periodo: ${premium.duracion}` : "Sin periodo"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">
            Pagos registrados
          </span>
          <strong className="mt-2 block font-display text-xl font-extrabold text-zinc-950">
            {paymentCount}
          </strong>
          <p className="m-0 mt-1 text-sm font-semibold text-zinc-500">
            {paidMonths > 0 ? `${paidMonths} meses pagos` : "Sin pagos cargados"}
          </p>
        </div>

        <div className={`rounded-2xl p-4 ${expired ? "bg-red-50" : "bg-emerald-50"}`}>
          <span className={`text-[11px] font-extrabold uppercase tracking-[0.08em] ${expired ? "text-red-700" : "text-emerald-700"}`}>
            Vencimiento
          </span>
          <strong className="mt-2 block font-display text-xl font-extrabold text-zinc-950">
            {formatSubscriptionDate(premium.fechaVencimiento)}
          </strong>
          <p className={`m-0 mt-1 text-sm font-semibold ${expired ? "text-red-700" : "text-emerald-700"}`}>
            {daysLeft === null
              ? "Sin vencimiento configurado"
              : daysLeft < 0
              ? `Vencio hace ${Math.abs(daysLeft)} dias`
              : `Vence en ${daysLeft} dias`}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-100 bg-white p-4">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">
            Actualizacion del plan
          </span>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="m-0 text-xs font-extrabold uppercase tracking-[0.08em] text-zinc-400">
                Actualizado
              </p>
              <p className="m-0 mt-1 text-sm font-bold text-zinc-900">
                {formatSubscriptionDateTime(premium.actualizadoEn)}
              </p>
            </div>
            <div>
              <p className="m-0 text-xs font-extrabold uppercase tracking-[0.08em] text-zinc-400">
                Registrado por
              </p>
              <p className="m-0 mt-1 truncate text-sm font-bold text-zinc-900">
                {premium.actualizadoPor || "Sin dato"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-4">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">
            Periodo vigente
          </span>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="m-0 text-xs font-extrabold uppercase tracking-[0.08em] text-zinc-400">
                Desde
              </p>
              <p className="m-0 mt-1 text-sm font-bold text-zinc-900">
                {formatSubscriptionDate(premium.fechaPago)}
              </p>
            </div>
            <div>
              <p className="m-0 text-xs font-extrabold uppercase tracking-[0.08em] text-zinc-400">
                Hasta
              </p>
              <p className="m-0 mt-1 text-sm font-bold text-zinc-900">
                {formatSubscriptionDate(premium.fechaVencimiento)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-100 bg-white">
        <div className="flex flex-col gap-1 border-b border-zinc-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
              Historial de pagos
            </span>
            <h3 className="m-0 mt-1 font-display text-lg font-extrabold text-zinc-950">
              Movimientos de tu suscripcion
            </h3>
          </div>
          <p className="m-0 text-xs font-bold text-zinc-500">
            {fallbackHistory.length} registro{fallbackHistory.length === 1 ? "" : "s"}
          </p>
        </div>

        {fallbackHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">
                  <th className="px-4 py-3">Fecha de pago</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Periodo</th>
                  <th className="px-4 py-3">Meses</th>
                  <th className="px-4 py-3">Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {fallbackHistory.slice(0, 8).map((item) => (
                  <tr
                    key={item.id || `${item.fechaPago}-${item.fechaVencimiento}`}
                    className="border-b border-zinc-100 last:border-b-0"
                  >
                    <td className="px-4 py-3 font-bold text-zinc-900">
                      {formatSubscriptionDate(item.fechaPago || item.registradoEn)}
                    </td>
                    <td className="px-4 py-3 font-bold text-zinc-700">
                      {item.plan || planName}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-600">
                      {item.duracion || "Sin periodo"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-600">
                      {Number(item.mesesPagados || 0)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-600">
                      {formatSubscriptionDate(item.fechaVencimiento)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-50 px-4 py-6 text-sm font-semibold text-zinc-500">
            Todavia no hay pagos registrados para esta cuenta.
          </div>
        )}
      </div>
    </section>
  );
}

export default Suscripcion;
