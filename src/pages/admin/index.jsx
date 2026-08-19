import Head from "next/head";
import { push } from "next/router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  MdAdminPanelSettings,
  MdBlock,
  MdCheckCircle,
  MdClose,
  MdInventory2,
  MdEmail,
  MdOutlineRefresh,
  MdOutlineSettings,
  MdSearch,
  MdStorefront,
  MdWorkspacePremium,
} from "react-icons/md";
import { toast } from "sonner";
import ContextGeneral from "@/servicios/contextPrincipal";

const adminTabs = [
  {
    id: "accounts",
    label: "Cuentas",
    description: "Usuarios, permisos y actividad",
    icon: MdAdminPanelSettings,
  },
  {
    id: "billing",
    label: "Suscripciones",
    description: "Planes, pagos y renovaciones",
    icon: MdWorkspacePremium,
    disabled: false,
  },
  {
    id: "system",
    label: "Sistema",
    description: "Config global y auditoria",
    icon: MdOutlineSettings,
    disabled: true,
  },
];

function formatDate(value) {
  if (!value) return "Sin registro";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateOnly(value) {
  if (!value) return "Sin configurar";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin configurar";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toDateInputValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

async function readAdminApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  const preview = text.replace(/\s+/g, " ").slice(0, 160);
  const message = `La API admin devolvio ${response.status} ${response.statusText || ""} en formato no JSON.`;
  const error = new Error(preview ? `${message} Respuesta: ${preview}` : message);
  error.statusCode = response.status;
  throw error;
}

function getSubscriptionStatus(premium = {}) {
  const nivel = Number(premium?.nivel || 0);
  const vencida = premium?.vencida === true;

  if (nivel <= 0) return { label: "Free", tone: "slate" };
  if (vencida) return { label: "Vencida", tone: "red" };
  if (premium?.activo === false) return { label: "Pausada", tone: "amber" };
  return { label: "Vigente", tone: "green" };
}

function getSubscriptionRowClass(premium = {}) {
  const base = "align-middle transition";
  const dateValue = premium?.fechaVencimiento;

  if (!dateValue) {
    return premium?.vencida === true
      ? `${base} bg-red-50/90 hover:bg-red-50`
      : `${base} bg-white hover:bg-slate-50/80`;
  }

  const dueDate = new Date(dateValue);
  if (Number.isNaN(dueDate.getTime())) {
    return `${base} bg-white hover:bg-slate-50/80`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dueDate.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) {
    return `${base} bg-red-50/90 hover:bg-red-50`;
  }

  if (diffDays <= 1) {
    return `${base} bg-amber-50/90 hover:bg-amber-50`;
  }

  return `${base} bg-white hover:bg-slate-50/80`;
}

function getPlanLabel(premium = {}) {
  const nivel = Number(premium?.nivel || 0);

  if (nivel >= 2) return "Pro";
  if (nivel === 1) return "Premium";
  return "Free";
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

function getPaidHistoryTotals(premium = {}) {
  const history = getSubscriptionHistory(premium).filter((item) => item.tipo === "pago");

  return {
    pagos: history.length,
    meses: history.reduce((total, item) => total + Number(item.mesesPagados || 0), 0),
  };
}

function getFallbackPaidMonths(premium = {}) {
  if (premium?.duracion === "1 anio") return 12;
  if (premium?.duracion === "1 mes") return 1;
  return 0;
}
function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-zinc-600 ring-zinc-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    coral: "bg-[#fff7f0] text-brand-coral ring-brand-coral/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function AdminPage() {
  const context = useContext(ContextGeneral);
  const { verificarLogin } = useContext(ContextGeneral);
  const [activeTab, setActiveTab] = useState("accounts");
  const [accounts, setAccounts] = useState([]);
  const [totals, setTotals] = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [requesterEmail, setRequesterEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingEmail, setSavingEmail] = useState("");
  const [migratingProducts, setMigratingProducts] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [adminFilter, setAdminFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [registrationFrom, setRegistrationFrom] = useState("");
  const [registrationTo, setRegistrationTo] = useState("");
  const [sortBy, setSortBy] = useState("created-desc");
  const [selectedSubscriptionEmails, setSelectedSubscriptionEmails] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState("1");
  const [subscriptionDuration, setSubscriptionDuration] = useState("month");
  const [subscriptionCustomDate, setSubscriptionCustomDate] = useState("");
  const [subscriptionSaving, setSubscriptionSaving] = useState(false);
  const [subscriptionView, setSubscriptionView] = useState("all");
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [subscriptionPlanFilter, setSubscriptionPlanFilter] = useState("all");
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState("all");
  const [subscriptionRecontactFilter, setSubscriptionRecontactFilter] = useState("all");
  const [subscriptionExpirationFrom, setSubscriptionExpirationFrom] = useState("");
  const [subscriptionExpirationTo, setSubscriptionExpirationTo] = useState("");
  const [subscriptionSortBy, setSubscriptionSortBy] = useState("expires-asc");
  const [recontactWebhookUrl, setRecontactWebhookUrl] = useState("");
  const [recontactSending, setRecontactSending] = useState(false);
  const [recontactProgress, setRecontactProgress] = useState({
    open: false,
    total: 0,
    current: 0,
    sent: 0,
    failed: 0,
    currentEmail: "",
    status: "idle",
    message: "",
  });
  const [expirationByEmail, setExpirationByEmail] = useState({});
  const [selectedSubscriptionEmail, setSelectedSubscriptionEmail] = useState("");

  const selectedSubscriptionAccount = useMemo(
    () => accounts.find((account) => account.email === selectedSubscriptionEmail) || null,
    [accounts, selectedSubscriptionEmail]
  );
  useEffect(() => {
    verificarLogin();
  }, []);
  useEffect(() => {
    const savedWebhookUrl = window.localStorage.getItem("mystore-recontact-webhook-url");
    if (savedWebhookUrl) {
      setRecontactWebhookUrl(savedWebhookUrl);
    }
  }, []);

  useEffect(() => {
    if (recontactWebhookUrl.trim()) {
      window.localStorage.setItem("mystore-recontact-webhook-url", recontactWebhookUrl.trim());
    }
  }, [recontactWebhookUrl]);

  const getToken = async () => {
    if (!context.user) return null;
    return context.user.getIdToken();
  };

  const fetchAccounts = async () => {
    const token = await getToken();

    if (!token) {
      setCanManage(false);
      setRequesterEmail("");
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await readAdminApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "No se pudo cargar administracion.");
      }

      setAccounts(data.accounts || []);
      setTotals(data.totals || null);
      setCanManage(data.canManage === true);
      setRequesterEmail(data.requesterEmail || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (context.user && context.admin) {
      fetchAccounts();
    } else if (context.user && context.loader && !context.admin) {
      setAccounts([]);
      setTotals(null);
      setCanManage(false);
      setError("No tenes permisos de administrador.");
      setLoading(false);
    } else if (context.estadoUsuario === 0) {
      setLoading(false);
    }
  }, [context.user, context.admin, context.loader, context.estadoUsuario]);

  const recalculateTotals = (nextAccounts) => {
    setTotals((current) => ({
      ...(current || {}),
      authUsers: current?.authUsers ?? nextAccounts.length,
      firestoreUsers: current?.firestoreUsers ?? nextAccounts.length,
      premium: nextAccounts.filter((account) => account.premium?.nivel === 1).length,
      pro: nextAccounts.filter((account) => account.premium?.nivel >= 2).length,
      activeSubscriptions: nextAccounts.filter((account) => account.premium?.publicable).length,
      expiredSubscriptions: nextAccounts.filter((account) => account.premium?.vencida).length,
      admins: nextAccounts.filter((account) => account.admin).length,
      disabled: nextAccounts.filter((account) => account.disabled).length,
    }));
  };

  const mergeAccounts = (updatedAccounts = []) => {
    const cleanUpdatedAccounts = updatedAccounts.filter((account) => account?.email);
    if (cleanUpdatedAccounts.length === 0) return;

    setAccounts((current) => {
      const updatesByEmail = new Map(
        cleanUpdatedAccounts.map((account) => [account.email, account])
      );
      const nextAccounts = current.map((account) =>
        updatesByEmail.get(account.email) || account
      );

      recalculateTotals(nextAccounts);
      return nextAccounts;
    });
  };

  const mergeProductMigration = (migratedAccounts = []) => {
    if (!Array.isArray(migratedAccounts) || migratedAccounts.length === 0) return;

    setAccounts((current) => {
      const migrationsByEmail = new Map(
        migratedAccounts.map((item) => [item.email, item])
      );
      const nextAccounts = current.map((account) => {
        const migration = migrationsByEmail.get(account.email);
        if (!migration) return account;

        return {
          ...account,
          metricas: {
            ...(account.metricas || {}),
            productos: migration.productos,
            productosNew: migration.productos,
          },
        };
      });

      recalculateTotals(nextAccounts);
      return nextAccounts;
    });
  };
  const updateAccount = async (email, patch) => {
    const token = await getToken();
    if (!token) return;

    setSavingEmail(email);
    setError("");

    try {
      const response = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, ...patch }),
      });
      const data = await readAdminApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar la cuenta.");
      }

      mergeAccounts([data.account]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingEmail("");
    }
  };


  const updateSubscriptions = async (
    emailsToUpdate,
    nivel = Number(subscriptionPlan || 1),
    overrides = {}
  ) => {
    const { successMessage, confirmMessage, keepSelection = false, ...premiumOverrides } = overrides;
    const token = await getToken();
    const cleanEmails = [...new Set(emailsToUpdate.filter(Boolean))];
    const effectiveNivel = Number(nivel || 0);
    const effectiveDuration = premiumOverrides.duration || subscriptionDuration;
    const effectiveCustomDate = premiumOverrides.fechaVencimiento ?? subscriptionCustomDate;
    const action = premiumOverrides.action || "assign";

    if (!token || cleanEmails.length === 0) return false;

    if (
      effectiveDuration === "custom" &&
      effectiveNivel > 0 &&
      !effectiveCustomDate &&
      action !== "renew_month"
    ) {
      setError("Elegi una fecha de vencimiento para aplicar una fecha especifica.");
      return false;
    }

    if (confirmMessage && !window.confirm(confirmMessage)) {
      return false;
    }

    setSubscriptionSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emails: cleanEmails,
          premium: {
            nivel: effectiveNivel,
            activo: true,
            duration: effectiveDuration,
            fechaVencimiento: effectiveCustomDate,
            ...premiumOverrides,
          },
        }),
      });
      const data = await readAdminApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar suscripciones.");
      }

      mergeAccounts(data.accounts || [data.account]);
      if (!keepSelection) {
        setSelectedSubscriptionEmails([]);
      }
      setExpirationByEmail({});
      if (successMessage) {
        toast.success(successMessage);
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSubscriptionSaving(false);
    }
  };

  const toggleSubscriptionSelection = (email) => {
    setSelectedSubscriptionEmails((current) =>
      current.includes(email)
        ? current.filter((item) => item !== email)
        : [...current, email]
    );
  };

  const selectAllSubscriptions = (emails) => {
    setSelectedSubscriptionEmails(emails);
  };

  const clearSubscriptionSelection = () => {
    setSelectedSubscriptionEmails([]);
  };
  const recordRecontact = async (accountPayload, trialActivatedAt) => {
    const token = await getToken();

    if (!token) {
      throw new Error("No se pudo validar la sesion admin para guardar el recontacto.");
    }

    const response = await fetch("/api/admin/accounts", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: accountPayload.email,
        recontacto: {
          emailEnviadoEn: new Date().toISOString(),
          pruebaActivadaEn: trialActivatedAt,
          trialPlan: "Premium",
          trialDuration: "1 mes",
        },
      }),
    });
    const data = await readAdminApiResponse(response);

    if (!response.ok) {
      throw new Error(data.error || `No se pudo guardar el recontacto de ${accountPayload.email}.`);
    }

    mergeAccounts(data.accounts || [data.account]);
  };
  const recontactSelectedSubscriptions = async () => {
    const webhookUrl = recontactWebhookUrl.trim();
    const cleanEmails = [...new Set(selectedSubscriptionEmails.filter(Boolean))];

    if (cleanEmails.length === 0) {
      setError("Selecciona al menos una cuenta para recontactar.");
      return;
    }

    if (!webhookUrl || !/^https?:\/\//i.test(webhookUrl)) {
      setError("Pega la URL completa del webhook de n8n antes de enviar.");
      return;
    }

    const accountsToContact = cleanEmails
      .map((email) => accounts.find((account) => account.email === email))
      .filter(Boolean)
      .map((account) => ({
        email: account.email,
        businessName:
          account.configuracion?.nombre ||
          account.configuracion?.nombreTienda ||
          account.usuario ||
          account.displayName ||
          "tu tienda",
        company: account.usuario || account.displayName || "tu tienda",
        displayName: account.displayName || "",
        usuario: account.usuario || "",
        whatsapp: account.configuracion?.whatsapp || "",
        instagram: account.configuracion?.instagram || "",
      }));

    if (accountsToContact.length === 0) {
      setError("No encontre datos validos para las cuentas seleccionadas.");
      return;
    }

    if (
      !window.confirm(
        `Vas a activar 1 mes Premium de prueba y enviar el mail de recontacto a ${accountsToContact.length} cuenta(s).`
      )
    ) {
      return;
    }

    setRecontactSending(true);
    setError("");
    setRecontactProgress({
      open: true,
      total: accountsToContact.length,
      current: 0,
      sent: 0,
      failed: 0,
      currentEmail: "",
      status: "activating",
      message: "Activando 1 mes Premium de prueba antes de enviar los mails.",
    });

    try {
      const activated = await updateSubscriptions(cleanEmails, 1, {
        duration: "month",
        fechaVencimiento: "",
        keepSelection: true,
        successMessage: `Se activo 1 mes Premium de prueba a ${accountsToContact.length} cuenta(s).`,
      });

      if (!activated) {
        setRecontactProgress((current) => ({
          ...current,
          status: "error",
          message: "No se pudo activar el mes de prueba. No se enviaron mails.",
        }));
        return;
      }

      const failedAccounts = [];
      const failedRecords = [];
      const trialActivatedAt = new Date().toISOString();
      let sentCount = 0;

      for (let index = 0; index < accountsToContact.length; index += 1) {
        const accountPayload = accountsToContact[index];
        setRecontactProgress((current) => ({
          ...current,
          current: index + 1,
          currentEmail: accountPayload.email,
          status: "sending",
          message: `Enviando peticion ${index + 1} de ${accountsToContact.length} a n8n.`,
        }));

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...accountPayload,
            trialPlan: "Premium",
            trialDuration: "1 mes",
          }),
        });

        if (response.ok) {
          sentCount += 1;
          try {
            await recordRecontact(accountPayload, trialActivatedAt);
          } catch (recordError) {
            failedRecords.push(accountPayload);
          }
        } else {
          failedAccounts.push(accountPayload);
        }

        setRecontactProgress((current) => ({
          ...current,
          sent: sentCount,
          failed: failedAccounts.length + failedRecords.length,
          status: response.ok && !failedRecords.some((account) => account.email === accountPayload.email) ? "sent" : "error",
          message: response.ok
            ? failedRecords.some((account) => account.email === accountPayload.email)
              ? `El mail salio para ${accountPayload.email}, pero no se pudo guardar el registro.`
              : `n8n confirmo el envio y se guardo el registro para ${accountPayload.email}.`
            : `n8n no confirmo el envio para ${accountPayload.email}.`,
        }));

        if (index < accountsToContact.length - 1) {
          setRecontactProgress((current) => ({
            ...current,
            status: "waiting",
            message: "Esperando 3 segundos antes de la siguiente peticion.",
          }));
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      if (sentCount > 0) {
        toast.success(`Mail de recontacto enviado a ${sentCount} cuenta(s).`);
      }

      if (failedAccounts.length > 0 || failedRecords.length > 0) {
        const pendingAccounts = [...failedAccounts, ...failedRecords];
        setSelectedSubscriptionEmails(pendingAccounts.map((account) => account.email));
        throw new Error(
          `Quedaron ${pendingAccounts.length} cuenta(s) seleccionadas: ${failedAccounts.length} fallo(s) de n8n y ${failedRecords.length} fallo(s) al guardar registro.`
        );
      }

      setSelectedSubscriptionEmails([]);
      setRecontactProgress((current) => ({
        ...current,
        status: "done",
        currentEmail: "",
        message: `Proceso terminado. Se enviaron ${sentCount} mail(s) correctamente.`,
      }));
    } catch (err) {
      setError(err.message || "No se pudo enviar el recontacto por n8n.");
      setRecontactProgress((current) => ({
        ...current,
        status: "error",
        message: err.message || "No se pudo enviar el recontacto por n8n.",
      }));
    } finally {
      setRecontactSending(false);
    }
  };
  const duplicateLegacyProducts = async ({ scope, email }) => {
    const token = await getToken();
    if (!token) return;

    const migrationKey = scope === "all" ? "all" : email;
    setMigratingProducts(migrationKey);
    setError("");

    try {
      const response = await fetch("/api/admin/productos-migration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scope, email }),
      });
      const data = await readAdminApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "No se pudo duplicar productos legacy.");
      }

      mergeProductMigration(data.migrated || []);
      toast.success("Productos duplicados correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setMigratingProducts("");
    }
  };
  const filteredAccounts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const fromTime = registrationFrom
      ? new Date(`${registrationFrom}T00:00:00`).getTime()
      : null;
    const toTime = registrationTo
      ? new Date(`${registrationTo}T23:59:59`).getTime()
      : null;
    const now = Date.now();
    const daysMs = 24 * 60 * 60 * 1000;

    const getTime = (value) => {
      if (!value) return 0;
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    const result = accounts.filter((account) => {
      const values = [
        account.email,
        account.displayName,
        account.usuario,
        account.configuracion?.instagram,
        account.configuracion?.whatsapp,
      ];
      const matchesSearch =
        !term ||
        values.some((value) =>
          String(value || "").toLowerCase().includes(term)
        );
      const planNivel = Number(account.premium?.nivel || 0);
      const isPremium = planNivel === 1;
      const isPro = planNivel >= 2;
      const isPaid = planNivel > 0;
      const hasStore = Boolean(account.usuario);
      const createdTime = getTime(account.creationTime);
      const lastLoginTime = getTime(account.lastSignInTime);
      const matchesRegistrationFrom = !fromTime || (createdTime && createdTime >= fromTime);
      const matchesRegistrationTo = !toTime || (createdTime && createdTime <= toTime);
      const matchesActivity =
        activityFilter === "all" ||
        (activityFilter === "login-7" && lastLoginTime >= now - 7 * daysMs) ||
        (activityFilter === "login-30" && lastLoginTime >= now - 30 * daysMs) ||
        (activityFilter === "inactive-30" && (!lastLoginTime || lastLoginTime < now - 30 * daysMs)) ||
        (activityFilter === "never" && !lastLoginTime);

      return (
        matchesSearch &&
        matchesRegistrationFrom &&
        matchesRegistrationTo &&
        matchesActivity &&
        (planFilter === "all" ||
          (planFilter === "premium" && isPremium) ||
          (planFilter === "pro" && isPro) ||
          (planFilter === "free" && !isPaid)) &&
        (adminFilter === "all" ||
          (adminFilter === "admin" && account.admin) ||
          (adminFilter === "no-admin" && !account.admin)) &&
        (statusFilter === "all" ||
          (statusFilter === "active" && !account.disabled) ||
          (statusFilter === "disabled" && account.disabled)) &&
        (storeFilter === "all" ||
          (storeFilter === "with-store" && hasStore) ||
          (storeFilter === "without-store" && !hasStore))
      );
    });

    return [...result].sort((a, b) => {
      const createdA = getTime(a.creationTime);
      const createdB = getTime(b.creationTime);
      const loginA = getTime(a.lastSignInTime);
      const loginB = getTime(b.lastSignInTime);
      const productsA = Number(a.metricas?.productos || 0);
      const productsB = Number(b.metricas?.productos || 0);
      const planA = Number(a.premium?.nivel || 0);
      const planB = Number(b.premium?.nivel || 0);
      const expiresA = getTime(a.premium?.fechaVencimiento) || Number.MAX_SAFE_INTEGER;
      const expiresB = getTime(b.premium?.fechaVencimiento) || Number.MAX_SAFE_INTEGER;

      if (sortBy === "created-asc") return createdA - createdB;
      if (sortBy === "last-login-desc") return loginB - loginA;
      if (sortBy === "last-login-asc") return loginA - loginB;
      if (sortBy === "products-desc") return productsB - productsA;
      if (sortBy === "products-asc") return productsA - productsB;
      if (sortBy === "plan-desc") return planB - planA;
      if (sortBy === "expires-asc") return expiresA - expiresB;
      if (sortBy === "store-asc") {
        return String(a.usuario || "").localeCompare(String(b.usuario || ""));
      }
      if (sortBy === "email-desc") {
        return String(b.email || "").localeCompare(String(a.email || ""));
      }
      if (sortBy === "email-asc") {
        return String(a.email || "").localeCompare(String(b.email || ""));
      }

      return createdB - createdA;
    });
  }, [
    accounts,
    activityFilter,
    adminFilter,
    planFilter,
    registrationFrom,
    registrationTo,
    search,
    sortBy,
    statusFilter,
    storeFilter,
  ]);
  const filteredSubscriptionAccounts = useMemo(() => {
    const term = subscriptionSearch.trim().toLowerCase();
    const fromTime = subscriptionExpirationFrom
      ? new Date(`${subscriptionExpirationFrom}T00:00:00`).getTime()
      : null;
    const toTime = subscriptionExpirationTo
      ? new Date(`${subscriptionExpirationTo}T23:59:59`).getTime()
      : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const getTime = (value) => {
      if (!value) return 0;
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    const result = accounts.filter((account) => {
      const premium = account.premium || {};
      const planNivel = Number(premium.nivel || 0);
      const expirationTime = getTime(premium.fechaVencimiento);
      const isPaid = planNivel > 0;
      const isPremium = planNivel === 1;
      const isPro = planNivel >= 2;
      const isExpired = isPaid && (premium.vencida === true || (expirationTime > 0 && expirationTime < todayTime));
      const isActive = isPaid && premium.activo !== false && !isExpired;
      const hasExpiration = expirationTime > 0;
      const wasRecontacted = Boolean(account.recontacto?.ultimoEmailEnviado);
      const values = [account.email, account.displayName];
      const matchesSearch =
        !term ||
        values.some((value) => String(value || "").toLowerCase().includes(term));
      const matchesExpirationFrom = !fromTime || (hasExpiration && expirationTime >= fromTime);
      const matchesExpirationTo = !toTime || (hasExpiration && expirationTime <= toTime);

      return (
        matchesSearch &&
        matchesExpirationFrom &&
        matchesExpirationTo &&
        (subscriptionPlanFilter === "all" ||
          (subscriptionPlanFilter === "premium" && isPremium) ||
          (subscriptionPlanFilter === "pro" && isPro) ||
          (subscriptionPlanFilter === "paid" && isPaid) ||
          (subscriptionPlanFilter === "free" && !isPaid)) &&
        (subscriptionStatusFilter === "all" ||
          (subscriptionStatusFilter === "vigente" && isActive) ||
          (subscriptionStatusFilter === "vencida" && isExpired) ||
          (subscriptionStatusFilter === "sin-vencimiento" && isPaid && !hasExpiration) ||
          (subscriptionStatusFilter === "free" && !isPaid))
      );
    });

    return [...result].sort((a, b) => {
      const planA = Number(a.premium?.nivel || 0);
      const planB = Number(b.premium?.nivel || 0);
      const expiresA = getTime(a.premium?.fechaVencimiento) || Number.MAX_SAFE_INTEGER;
      const expiresB = getTime(b.premium?.fechaVencimiento) || Number.MAX_SAFE_INTEGER;
      const paymentA = getTime(a.premium?.fechaPago);
      const paymentB = getTime(b.premium?.fechaPago);
      const historyA = getPaidHistoryTotals(a.premium).meses || getFallbackPaidMonths(a.premium);
      const historyB = getPaidHistoryTotals(b.premium).meses || getFallbackPaidMonths(b.premium);

      if (subscriptionSortBy === "expires-desc") return expiresB - expiresA;
      if (subscriptionSortBy === "payment-desc") return paymentB - paymentA;
      if (subscriptionSortBy === "payment-asc") return paymentA - paymentB;
      if (subscriptionSortBy === "plan-desc") return planB - planA;
      if (subscriptionSortBy === "plan-asc") return planA - planB;
      if (subscriptionSortBy === "months-desc") return historyB - historyA;
      if (subscriptionSortBy === "account-asc") {
        return String(a.displayName || a.email || "").localeCompare(String(b.displayName || b.email || ""));
      }
      if (subscriptionSortBy === "account-desc") {
        return String(b.displayName || b.email || "").localeCompare(String(a.displayName || a.email || ""));
      }

      return expiresA - expiresB;
    });
  }, [
    accounts,
    subscriptionExpirationFrom,
    subscriptionExpirationTo,
    subscriptionPlanFilter,
    subscriptionSearch,
    subscriptionSortBy,
    subscriptionStatusFilter,
  ]);

  const hasActiveSubscriptionFilters =
    subscriptionSearch.trim() ||
    subscriptionPlanFilter !== "all" ||
    subscriptionStatusFilter !== "all" ||
    subscriptionRecontactFilter !== "all" ||
    subscriptionExpirationFrom ||
    subscriptionExpirationTo ||
    subscriptionSortBy !== "expires-asc";

  const clearSubscriptionFilters = () => {
    setSubscriptionSearch("");
    setSubscriptionPlanFilter("all");
    setSubscriptionStatusFilter("all");
    setSubscriptionRecontactFilter("all");
    setSubscriptionExpirationFrom("");
    setSubscriptionExpirationTo("");
    setSubscriptionSortBy("expires-asc");
  };
  const hasActiveFilters =
    search.trim() ||
    planFilter !== "all" ||
    adminFilter !== "all" ||
    statusFilter !== "all" ||
    storeFilter !== "all" ||
    activityFilter !== "all" ||
    registrationFrom ||
    registrationTo ||
    sortBy !== "created-desc";

  const clearFilters = () => {
    setSearch("");
    setPlanFilter("all");
    setAdminFilter("all");
    setStatusFilter("all");
    setStoreFilter("all");
    setActivityFilter("all");
    setRegistrationFrom("");
    setRegistrationTo("");
    setSortBy("created-desc");
  };

  const summaryCards = [
    { label: "Auth", value: totals?.authUsers || 0, icon: MdAdminPanelSettings },
    { label: "Firestore", value: totals?.firestoreUsers || 0, icon: MdStorefront },
    { label: "Premium", value: totals?.premium || 0, icon: MdWorkspacePremium },
    { label: "Admins", value: totals?.admins || 0, icon: MdCheckCircle },
  ];


  const renderSubscriptions = () => {
    const activeSubscriptionCount = filteredSubscriptionAccounts.filter(
      (account) => Number(account.premium?.nivel || 0) > 0 && account.premium?.activo !== false
    ).length;
    const subscriptionAccounts =
      subscriptionView === "expiring"
        ? filteredSubscriptionAccounts.filter(
            (account) => Number(account.premium?.nivel || 0) > 0 && account.premium?.activo !== false
          )
        : filteredSubscriptionAccounts;
    const visibleEmails = subscriptionAccounts.map((account) => account.email).filter(Boolean);
    const selectedCount = selectedSubscriptionEmails.length;
    const allVisibleSelected = visibleEmails.length > 0 && visibleEmails.every((email) => selectedSubscriptionEmails.includes(email));

    return (
      <div className="grid gap-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.055)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
                Suscripciones
              </span>
              <h2 className="m-0 mt-1 font-display text-2xl font-extrabold text-zinc-950">
                Activacion premium y pro
              </h2>
              <p className="m-0 mt-1 text-sm font-medium text-zinc-600">
                Selecciona cuentas, ajusta vencimientos y renova planes activos desde una vista clara.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchAccounts}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white shadow-lg shadow-zinc-950/15 transition hover:bg-zinc-800"
            >
              <MdOutlineRefresh className="text-lg" />
              Actualizar
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSubscriptionView("all")}
              className={`min-h-[38px] rounded-xl px-4 text-sm font-extrabold transition ${
                subscriptionView === "all"
                  ? "bg-zinc-950 text-white shadow-lg shadow-zinc-950/10"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-slate-50"
              }`}
            >
              Todas ({filteredSubscriptionAccounts.length})
            </button>
            <button
              type="button"
              onClick={() => setSubscriptionView("expiring")}
              className={`min-h-[38px] rounded-xl px-4 text-sm font-extrabold transition ${
                subscriptionView === "expiring"
                  ? "bg-zinc-950 text-white shadow-lg shadow-zinc-950/10"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-slate-50"
              }`}
            >
              A vencer ({activeSubscriptionCount})
            </button>
          </div>

          <div className="mt-4 grid gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(220px,1.4fr)_repeat(6,minmax(140px,1fr))_auto]">
            <label className="flex min-h-[40px] items-center gap-2 rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-500 shadow-inner shadow-zinc-950/[0.04]">
              <MdSearch className="text-lg" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm font-bold text-zinc-950 outline-none placeholder:text-zinc-400"
                value={subscriptionSearch}
                onChange={(event) => setSubscriptionSearch(event.target.value)}
                placeholder="Buscar cuenta o email"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">Plan</span>
              <select
                value={subscriptionPlanFilter}
                onChange={(event) => setSubscriptionPlanFilter(event.target.value)}
                className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
              >
                <option value="all">Todos</option>
                <option value="paid">Pagas</option>
                <option value="premium">Premium</option>
                <option value="pro">Pro</option>
                <option value="free">Free</option>
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">Estado</span>
              <select
                value={subscriptionStatusFilter}
                onChange={(event) => setSubscriptionStatusFilter(event.target.value)}
                className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
              >
                <option value="all">Todos</option>
                <option value="vigente">Vigentes</option>
                <option value="vencida">Vencidas</option>
                <option value="sin-vencimiento">Sin vencimiento</option>
                <option value="free">Free</option>
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">Recontacto</span>
              <select
                value={subscriptionRecontactFilter}
                onChange={(event) => setSubscriptionRecontactFilter(event.target.value)}
                className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
              >
                <option value="all">Todos</option>
                <option value="contacted">Contactados</option>
                <option value="not-contacted">Sin contactar</option>
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">Vence desde</span>
              <input
                type="date"
                value={subscriptionExpirationFrom}
                onChange={(event) => setSubscriptionExpirationFrom(event.target.value)}
                className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">Vence hasta</span>
              <input
                type="date"
                value={subscriptionExpirationTo}
                onChange={(event) => setSubscriptionExpirationTo(event.target.value)}
                className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">Orden</span>
              <select
                value={subscriptionSortBy}
                onChange={(event) => setSubscriptionSortBy(event.target.value)}
                className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
              >
                <option value="expires-asc">Vencen primero</option>
                <option value="expires-desc">Vencen ultimo</option>
                <option value="payment-desc">Ultimo pago reciente</option>
                <option value="payment-asc">Ultimo pago antiguo</option>
                <option value="plan-desc">Plan mas alto</option>
                <option value="plan-asc">Plan mas bajo</option>
                <option value="months-desc">Mas meses pagos</option>
                <option value="account-asc">Cuenta A-Z</option>
                <option value="account-desc">Cuenta Z-A</option>
              </select>
            </label>

            <button
              type="button"
              onClick={clearSubscriptionFilters}
              disabled={!hasActiveSubscriptionFilters}
              className="min-h-[40px] self-end rounded-xl border border-zinc-300 bg-white px-4 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Limpiar
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-zinc-500">
            {subscriptionAccounts.length} visibles de {filteredSubscriptionAccounts.length} cuentas filtradas
          </div>

          <div className="mt-5 grid gap-3 rounded-2xl border border-zinc-200 bg-slate-50 p-4 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-end">
            <label className="grid gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">Plan</span>
              <select
                value={subscriptionPlan}
                onChange={(event) => setSubscriptionPlan(event.target.value)}
                className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
              >
                <option value="1">Premium</option>
                <option value="2">Pro</option>
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">Periodo</span>
              <select
                value={subscriptionDuration}
                onChange={(event) => setSubscriptionDuration(event.target.value)}
                className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
              >
                <option value="month">1 mes</option>
                <option value="year">1 anio</option>
                <option value="custom">Hasta fecha</option>
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">Fecha especifica</span>
              <input
                type="date"
                value={subscriptionCustomDate}
                onChange={(event) => setSubscriptionCustomDate(event.target.value)}
                disabled={subscriptionDuration !== "custom"}
                className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
              />
            </label>

            <button
              type="button"
              disabled={!canManage || selectedCount === 0 || subscriptionSaving}
              onClick={() =>
                updateSubscriptions(selectedSubscriptionEmails, Number(subscriptionPlan || 1), {
                  confirmMessage: `Vas a aplicar ${subscriptionDuration === "year" ? "1 anio" : subscriptionDuration === "custom" ? "una fecha especifica" : "1 mes"} del plan ${subscriptionPlan === "2" ? "Pro" : "Premium"} a ${selectedCount} cuenta(s).`, 
                  successMessage: `Se aplico la suscripcion a ${selectedCount} cuenta(s).`, 
                })
              }
              className="min-h-[44px] rounded-xl bg-zinc-950 px-5 text-sm font-extrabold text-white shadow-lg shadow-zinc-950/15 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {subscriptionSaving ? "Aplicando..." : `Aplicar a ${selectedCount}`}
            </button>

            <button
              type="button"
              disabled={!canManage || selectedCount === 0 || subscriptionSaving}
              onClick={() =>
                updateSubscriptions(selectedSubscriptionEmails, 0, {
                  confirmMessage: `Vas a pasar ${selectedCount} cuenta(s) a Free.`, 
                  successMessage: `Se pasaron ${selectedCount} cuenta(s) a Free.`, 
                })
              }
              className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-5 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Pasar a free
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => allVisibleSelected ? clearSubscriptionSelection() : selectAllSubscriptions(visibleEmails)}
              className="min-h-[38px] rounded-xl border border-zinc-300 bg-white px-4 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50"
            >
              {allVisibleSelected ? "Deseleccionar visibles" : "Seleccionar visibles"}
            </button>
            <button
              type="button"
              onClick={clearSubscriptionSelection}
              disabled={selectedCount === 0}
              className="min-h-[38px] rounded-xl border border-zinc-300 bg-white px-4 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Limpiar seleccion
            </button>
            <span className="text-sm font-bold text-zinc-500">
              {selectedCount} cuentas seleccionadas
            </span>
          </div>

          <div className="mt-3 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm shadow-zinc-950/[0.03] lg:grid-cols-[minmax(280px,1fr)_auto] lg:items-center">
            <label className="flex min-h-[40px] items-center gap-2 rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-500 shadow-inner shadow-zinc-950/[0.04]">
              <MdEmail className="text-lg" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm font-bold text-zinc-950 outline-none placeholder:text-zinc-400"
                value={recontactWebhookUrl}
                onChange={(event) => setRecontactWebhookUrl(event.target.value)}
                placeholder="URL webhook n8n para recontacto"
              />
            </label>
            <button
              type="button"
              disabled={!canManage || selectedCount === 0 || subscriptionSaving || recontactSending}
              onClick={recontactSelectedSubscriptions}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-extrabold text-white shadow-lg shadow-zinc-950/15 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <MdEmail className="text-lg" />
              {recontactSending ? "Enviando..." : `Activar prueba y recontactar (${selectedCount})`}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.055)]">
          {loading ? (
            <div className="p-8 text-center text-sm font-bold text-zinc-500">Cargando suscripciones...</div>
          ) : subscriptionAccounts.length === 0 ? (
            <div className="p-8 text-center text-sm font-bold text-zinc-500">
              {subscriptionView === "expiring" ? "No hay suscripciones activas para mostrar." : "No hay cuentas para mostrar."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1240px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">
                  <tr className="border-b border-zinc-200/80">
                    <th className="w-10 px-4 py-3">Sel.</th>
                    <th className="px-4 py-3">Cuenta</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Ultimo pago</th>
                    <th className="px-4 py-3">Vencimiento</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Historial</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {subscriptionAccounts.map((account) => {
                    const status = getSubscriptionStatus(account.premium);
                    const selected = selectedSubscriptionEmails.includes(account.email);
                    const accountPlan = Number(account.premium?.nivel || 0);
                    const currentPlan = accountPlan || Number(subscriptionPlan || 1);
                    const expirationValue =
                      expirationByEmail[account.email] ?? toDateInputValue(account.premium?.fechaVencimiento);
                    const historyTotals = getPaidHistoryTotals(account.premium);
                    const paidMonths = historyTotals.meses || getFallbackPaidMonths(account.premium);
                    const recontacto = account.recontacto || {};
                    const wasRecontacted = Boolean(recontacto.ultimoEmailEnviado);
                    const rowSaving = subscriptionSaving || savingEmail === account.email;

                    return (
                      <tr
                        key={account.email}
                        onClick={() => setSelectedSubscriptionEmail(account.email)}
                        className={`${getSubscriptionRowClass(account.premium)} h-[64px] cursor-pointer align-middle transition hover:bg-slate-50/80`}
                      >
                        <td className="px-4 py-2" onClick={(event) => event.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSubscriptionSelection(account.email)}
                            className="h-4 w-4 cursor-pointer rounded border-zinc-300 text-brand-coral focus:ring-brand-coral"
                            aria-label={`Seleccionar ${account.email}`}
                          />
                        </td>

                        <td className="max-w-[300px] px-4 py-2">
                          <div className="flex min-w-0 items-center gap-3">
                            {account.photoURL ? (
                              <img
                                src={account.photoURL}
                                alt={account.displayName}
                                className="h-8 w-8 rounded-lg object-cover ring-1 ring-zinc-200"
                              />
                            ) : (
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-brand-coral ring-1 ring-zinc-200">
                                {account.email?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="m-0 truncate text-sm font-extrabold text-zinc-950">
                                {account.displayName || "Sin nombre"}
                              </p>
                              <p className="m-0 truncate text-xs font-bold text-zinc-500">
                                {account.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <Badge tone={accountPlan >= 2 ? "coral" : accountPlan === 1 ? "amber" : "slate"}>
                            {getPlanLabel(account.premium)}
                          </Badge>
                        </td>

                        <td className="px-4 py-2 text-xs font-bold text-zinc-600">
                          {formatDateOnly(account.premium?.fechaPago)}
                        </td>

                        <td className="px-4 py-2 text-xs font-bold text-zinc-600">
                          {formatDateOnly(account.premium?.fechaVencimiento)}
                        </td>

                        <td className="px-4 py-2">
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </td>

                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedSubscriptionEmail(account.email);
                            }}
                            className="whitespace-nowrap text-xs font-extrabold text-zinc-700 transition hover:text-brand-coral"
                          >
                            {historyTotals.pagos || 0} pagos - {paidMonths} meses
                          </button>
                        </td>

                        <td className="px-4 py-2">
                          <div className="grid gap-1">
                            <Badge tone={wasRecontacted ? "green" : "slate"}>
                              {wasRecontacted ? "Contactado" : "Sin contacto"}
                            </Badge>
                            {wasRecontacted && (
                              <div className="text-[11px] font-bold leading-4 text-zinc-500">
                                <p className="m-0 whitespace-nowrap">Mail: {formatDateOnly(recontacto.ultimoEmailEnviado)}</p>
                                <p className="m-0 whitespace-nowrap">Prueba: {formatDateOnly(recontacto.pruebaActivadaEn)}</p>
                                <p className="m-0 whitespace-nowrap">Envios: {recontacto.cantidadEmails || 1}</p>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-2 text-right" onClick={(event) => event.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="date"
                              value={expirationValue}
                              onChange={(event) =>
                                setExpirationByEmail((current) => ({
                                  ...current,
                                  [account.email]: event.target.value,
                                }))
                              }
                              className="min-h-[34px] w-[138px] rounded-lg border border-zinc-300 bg-slate-100 px-3 text-xs font-bold text-zinc-900 outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
                            />
                            <button
                              type="button"
                              disabled={!canManage || rowSaving || !expirationValue}
                              onClick={() =>
                                updateSubscriptions([account.email], currentPlan, {
                                  action: "set_expiration",
                                  duration: "custom",
                                  fechaVencimiento: expirationValue,
                                  confirmMessage: "Vas a modificar solo la fecha de vencimiento de esta cuenta.",
                                  successMessage: "Se actualizo el vencimiento de la cuenta.",
                                })
                              }
                              className="min-h-[34px] whitespace-nowrap rounded-lg border border-zinc-300 bg-white px-3 text-xs font-extrabold text-zinc-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedSubscriptionEmail(account.email)}
                              className="min-h-[34px] whitespace-nowrap rounded-lg border border-zinc-300 bg-white px-3 text-xs font-extrabold text-zinc-800 transition hover:bg-slate-50"
                            >
                              Historial
                            </button>
                            <select
                              defaultValue=""
                              disabled={!canManage || rowSaving}
                              onChange={(event) => {
                                const action = event.currentTarget.value;
                                event.currentTarget.value = "";
                                if (!action) return;

                                if (action === "renew") {
                                  updateSubscriptions([account.email], accountPlan, {
                                    action: "renew_month",
                                    confirmMessage: "Vas a renovar la suscripcion actual por 1 mes mas.",
                                    successMessage: "Se renovo el vencimiento por 1 mes.",
                                  });
                                  return;
                                }

                                if (action === "free") {
                                  updateSubscriptions([account.email], 0, {
                                    confirmMessage: "Vas a pasar esta cuenta a Free.",
                                    successMessage: "La cuenta paso a Free.",
                                  });
                                  return;
                                }

                                const [planKey, duration] = action.split(":");
                                const planNivel = planKey === "pro" ? 2 : 1;
                                const planLabel = planKey === "pro" ? "Pro" : "Premium";
                                const durationLabel = duration === "year" ? "1 anio" : duration === "custom" ? `hasta ${expirationValue}` : "1 mes";

                                if (duration === "custom" && !expirationValue) {
                                  setError("Elegi una fecha de vencimiento antes de aplicar una suscripcion hasta fecha.");
                                  return;
                                }

                                updateSubscriptions([account.email], planNivel, {
                                  duration,
                                  fechaVencimiento: duration === "custom" ? expirationValue : "",
                                  confirmMessage: `Vas a aplicar ${durationLabel} del plan ${planLabel} a esta cuenta.`,
                                  successMessage: `Se aplico ${durationLabel} del plan ${planLabel}.`,
                                });
                              }}
                              className="min-h-[34px] w-[184px] cursor-pointer rounded-lg border border-zinc-300 bg-zinc-950 px-3 text-xs font-extrabold text-white outline-none transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45"
                            >
                              <option value="">Accion</option>
                              <option value="premium:month">Premium - 1 mes</option>
                              <option value="premium:year">Premium - 1 anio</option>
                              <option value="premium:custom">Premium - hasta fecha</option>
                              <option value="pro:month">Pro - 1 mes</option>
                              <option value="pro:year">Pro - 1 anio</option>
                              <option value="pro:custom">Pro - hasta fecha</option>
                              <option value="renew" disabled={accountPlan <= 0}>Renovar actual +1 mes</option>
                              <option value="free">Pasar a Free</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedSubscriptionAccount && (() => {
          const premium = selectedSubscriptionAccount.premium || {};
          const history = getSubscriptionHistory(premium);
          const paidTotals = getPaidHistoryTotals(premium);
          const fallbackMonths = getFallbackPaidMonths(premium);
          const visibleHistory = history.length > 0
            ? history
            : Number(premium.nivel || 0) > 0
            ? [{
                id: "current-subscription",
                tipo: "actual",
                plan: getPlanLabel(premium),
                duracion: premium.duracion || "Sin dato",
                mesesPagados: fallbackMonths,
                fechaPago: premium.fechaPago,
                fechaVencimiento: premium.fechaVencimiento,
                registradoPor: premium.actualizadoPor,
              }]
            : [];

          return (
            <div
              className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/45 px-4 py-6 backdrop-blur-sm"
              onClick={() => setSelectedSubscriptionEmail("")}
            >
              <div
                className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/25"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
                  <div className="min-w-0">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
                      Historial de cuenta
                    </span>
                    <h3 className="m-0 mt-1 truncate font-display text-2xl font-extrabold text-zinc-950">
                      {selectedSubscriptionAccount.displayName || "Sin nombre"}
                    </h3>
                    <p className="m-0 mt-1 truncate text-sm font-bold text-zinc-500">
                      {selectedSubscriptionAccount.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSubscriptionEmail("")}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-slate-50"
                    aria-label="Cerrar historial"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>

                <div className="max-h-[calc(88vh-92px)] overflow-y-auto p-5">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-zinc-200 bg-slate-50 p-3">
                      <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Plan actual</p>
                      <p className="m-0 mt-1 text-lg font-extrabold text-zinc-950">{getPlanLabel(premium)}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-slate-50 p-3">
                      <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Pagos</p>
                      <p className="m-0 mt-1 text-lg font-extrabold text-zinc-950">{paidTotals.pagos}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-slate-50 p-3">
                      <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Meses pagos</p>
                      <p className="m-0 mt-1 text-lg font-extrabold text-zinc-950">{paidTotals.meses || fallbackMonths}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-slate-50 p-3">
                      <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Vence</p>
                      <p className="m-0 mt-1 text-sm font-extrabold text-zinc-950">{formatDateOnly(premium.fechaVencimiento)}</p>
                    </div>
                  </div>

                  {history.length === 0 && Number(premium.nivel || 0) > 0 && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                      Esta cuenta no tenia historial guardado. Desde ahora, cada activacion de plan va a quedar registrada.
                    </div>
                  )}

                  <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
                    <div className="grid min-w-[620px] grid-cols-[1.1fr_0.8fr_0.7fr_1fr_1fr] bg-slate-50 px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">
                      <span>Fecha</span>
                      <span>Plan</span>
                      <span>Meses</span>
                      <span>Vencimiento</span>
                      <span>Registrado por</span>
                    </div>

                    {visibleHistory.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm font-bold text-zinc-500">
                        No hay pagos registrados para esta cuenta.
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-100 overflow-x-auto">
                        {visibleHistory.map((item) => (
                          <div
                            key={item.id || `${item.fechaPago}-${item.fechaVencimiento}`}
                            className="grid min-w-[620px] grid-cols-[1.1fr_0.8fr_0.7fr_1fr_1fr] px-4 py-3 text-xs font-bold text-zinc-700"
                          >
                            <span>{formatDateOnly(item.fechaPago || item.registradoEn)}</span>
                            <span>{item.plan || getPlanLabel({ nivel: item.nivel })}</span>
                            <span>{Number(item.mesesPagados || 0)}</span>
                            <span>{formatDateOnly(item.fechaVencimiento)}</span>
                            <span className="truncate text-zinc-500">{item.registradoPor || "Sin dato"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  const renderAccounts = () => (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.055)] sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
              Directorio
            </span>
            <h2 className="m-0 mt-1 font-display text-2xl font-extrabold text-zinc-950">
              Cuentas
            </h2>
            <p className="m-0 mt-1 text-sm font-medium text-zinc-600">
              {filteredAccounts.length} visibles de {accounts.length} cuentas cargadas
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(260px,420px)_auto_auto]">
            <label className="flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-300 bg-slate-100 px-4 text-sm font-bold text-zinc-500 shadow-inner shadow-zinc-950/[0.04]">
              <MdSearch className="text-xl" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm font-bold text-zinc-950 outline-none placeholder:text-zinc-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar email, tienda, Instagram o WhatsApp"
              />
            </label>
            <button
              type="button"
              disabled={!canManage || migratingProducts === "all"}
              onClick={() => duplicateLegacyProducts({ scope: "all" })}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-extrabold text-zinc-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {migratingProducts === "all" ? "Duplicando..." : "Duplicar todos"}
            </button>
            <button
              type="button"
              onClick={fetchAccounts}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white shadow-lg shadow-zinc-950/15 transition hover:bg-zinc-800"
            >
              <MdOutlineRefresh className="text-lg" />
              Actualizar
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(8,minmax(140px,1fr))_auto]">
          <label className="grid gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">
              Plan
            </span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
            >
              <option value="all">Todos</option>
              <option value="premium">Premium</option>
              <option value="pro">Pro</option>
              <option value="free">Free</option>
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">
              Admin
            </span>
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
            >
              <option value="all">Todos</option>
              <option value="admin">Admins</option>
              <option value="no-admin">No admins</option>
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">
              Estado
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
            >
              <option value="all">Todos</option>
              <option value="active">Activas</option>
              <option value="disabled">Bloqueadas</option>
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">
              Tienda
            </span>
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
            >
              <option value="all">Todas</option>
              <option value="with-store">Con link</option>
              <option value="without-store">Sin link</option>
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">
              Actividad
            </span>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
            >
              <option value="all">Todas</option>
              <option value="login-7">Login ult. 7 dias</option>
              <option value="login-30">Login ult. 30 dias</option>
              <option value="inactive-30">Sin login +30 dias</option>
              <option value="never">Sin login</option>
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">
              Alta desde
            </span>
            <input
              type="date"
              value={registrationFrom}
              onChange={(e) => setRegistrationFrom(e.target.value)}
              className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">
              Alta hasta
            </span>
            <input
              type="date"
              value={registrationTo}
              onChange={(e) => setRegistrationTo(e.target.value)}
              className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">
              Orden
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-h-[40px] rounded-xl border border-zinc-300 bg-slate-100 px-3 text-sm font-bold text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
            >
              <option value="created-desc">Alta mas reciente</option>
              <option value="created-asc">Alta mas antigua</option>
              <option value="last-login-desc">Ultimo login reciente</option>
              <option value="last-login-asc">Ultimo login antiguo</option>
              <option value="products-desc">Mas productos</option>
              <option value="products-asc">Menos productos</option>
              <option value="plan-desc">Plan mas alto</option>
              <option value="expires-asc">Vencen primero</option>
              <option value="store-asc">Tienda A-Z</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
            </select>
          </label>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="min-h-[40px] self-end rounded-xl border border-zinc-300 bg-white px-4 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Limpiar
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {!loading && context.user && !context.admin && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            Acceso restringido: esta vista solo esta disponible para cuentas administradoras.
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.055)]">
        {loading ? (
          <div className="p-8 text-center text-sm font-bold text-zinc-500">
            Cargando cuentas...
          </div>
        ) : !context.user ? (
          <div className="p-8 text-center text-sm font-bold text-zinc-500">
Inicia sesion con una cuenta administradora para entrar.
          </div>
        ) : !context.admin ? (
          <div className="p-8 text-center text-sm font-bold text-zinc-500">
            No tenes permisos para ver estas cuentas.
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-8 text-center text-sm font-bold text-zinc-500">
            No hay cuentas para mostrar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-[0.06em] text-zinc-500">
                <tr className="border-b border-zinc-200/80">
                  <th className="px-4 py-3">Cuenta</th>
                  <th className="px-4 py-3">Tienda</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Auth</th>
                  <th className="px-4 py-3">Catalogo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredAccounts.map((account) => {
                  const isSaving = savingEmail === account.email;
                  const planNivel = Number(account.premium?.nivel || 0);
                  const isPremium = planNivel === 1;
                  const isPro = planNivel >= 2;
                  const isPaid = planNivel > 0;
                  const whatsapp = account.configuracion?.whatsapp;
                  const instagram = account.configuracion?.instagram;
                  const canUseAdminButton = canManage;

                  return (
                    <tr
                      key={account.email}
                      className="bg-white align-middle transition hover:bg-slate-50/80"
                    >
                      <td className="max-w-[300px] px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {account.photoURL ? (
                            <img
                              src={account.photoURL}
                              alt={account.displayName}
                              className="h-9 w-9 rounded-xl object-cover ring-1 ring-zinc-200"
                            />
                          ) : (
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-extrabold text-brand-coral ring-1 ring-zinc-200">
                              {account.email?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="m-0 truncate text-sm font-extrabold text-zinc-950">
                              {account.displayName || "Sin nombre"}
                            </p>
                            <p className="m-0 mt-0.5 truncate text-xs font-bold text-zinc-500">
                              {account.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="m-0 max-w-[170px] truncate text-sm font-extrabold text-zinc-950">
                          {account.usuario || "Sin link"}
                        </p>
                        <p className="m-0 mt-0.5 text-xs font-bold text-zinc-500">
                          Registro: {account.fechaDeRegistro || "Sin dato"}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="m-0 max-w-[170px] truncate text-xs font-bold text-zinc-700">
                          IG: {instagram || "Sin dato"}
                        </p>
                        <p className="m-0 mt-1 max-w-[170px] truncate text-xs font-bold text-zinc-500">
                          WA: {whatsapp || "Sin dato"}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="m-0 whitespace-nowrap text-xs font-bold text-zinc-700">
                          Alta: {formatDate(account.creationTime)}
                        </p>
                        <p className="m-0 mt-1 whitespace-nowrap text-xs font-bold text-zinc-500">
                          Login: {formatDate(account.lastSignInTime)}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge tone="slate">
                            <MdInventory2 /> Legacy {account.metricas.productosLegacy || 0}
                          </Badge>
                          <Badge tone={(account.metricas.productosNew || 0) === (account.metricas.productosLegacy || 0) ? "green" : "amber"}>
                            New {account.metricas.productosNew || 0}
                          </Badge>
                          <Badge tone="slate">{account.metricas.categorias} cat</Badge>
                          <Badge tone="slate">{account.metricas.cupones} cup</Badge>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge tone={isPro ? "coral" : isPremium ? "amber" : "slate"}>
                            {isPro ? "Pro" : isPremium ? "Premium" : "Free"}
                          </Badge>
                          <Badge tone={account.admin ? "coral" : "slate"}>
                            {account.admin ? "Admin" : "No admin"}
                          </Badge>
                          <Badge tone={account.disabled ? "red" : "green"}>
                            {account.disabled ? (
                              <>
                                <MdBlock /> Bloqueada
                              </>
                            ) : (
                              <>
                                <MdCheckCircle /> Activa
                              </>
                            )}
                          </Badge>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={!canManage || migratingProducts === account.email}
                            onClick={() =>
                              duplicateLegacyProducts({
                                scope: "account",
                                email: account.email,
                              })
                            }
                            className="min-h-[34px] whitespace-nowrap rounded-lg border border-zinc-300 bg-white px-3 text-xs font-extrabold text-zinc-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            {migratingProducts === account.email ? "Duplicando" : "Duplicar"}
                          </button>
                          <button
                            type="button"
                            disabled={isSaving || !canManage || isPremium}
                            onClick={() =>
                              updateAccount(account.email, {
                                premium: {
                                  nivel: 1,
                                  activo: true,
                                },
                              })
                            }
                            className={`min-h-[34px] whitespace-nowrap rounded-lg px-3 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-45 ${
                              isPremium
                                ? "border border-amber-200 bg-amber-50 text-amber-800"
                                : "bg-zinc-900 text-white hover:bg-zinc-800"
                            }`}
                          >
                            Premium
                          </button>
                          <button
                            type="button"
                            disabled={isSaving || !canManage || isPro}
                            onClick={() =>
                              updateAccount(account.email, {
                                premium: {
                                  nivel: 2,
                                  activo: true,
                                },
                              })
                            }
                            className={`min-h-[34px] whitespace-nowrap rounded-lg px-3 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-45 ${
                              isPro
                                ? "border border-red-200 bg-red-50 text-red-700"
                                : "border border-zinc-300 bg-white text-zinc-800 hover:bg-slate-50"
                            }`}
                          >
                            Pro
                          </button>
                          {isPaid && (
                            <button
                              type="button"
                              disabled={isSaving || !canManage}
                              onClick={() =>
                                updateAccount(account.email, {
                                  premium: {
                                    nivel: 0,
                                    activo: true,
                                  },
                                })
                              }
                              className="min-h-[34px] whitespace-nowrap rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-extrabold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-45"
                            >
                              Quitar plan
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isSaving || !canUseAdminButton}
                            onClick={() =>
                              updateAccount(account.email, {
                                admin: !account.admin,
                              })
                            }
                            className="min-h-[34px] whitespace-nowrap rounded-lg border border-zinc-300 bg-white px-3 text-xs font-extrabold text-zinc-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            {account.admin ? "Quitar admin" : "Hacer admin"}
                          </button>
                          <button
                            type="button"
                            disabled={isSaving || !account.uid || !canManage}
                            onClick={() =>
                              updateAccount(account.email, {
                                disabled: !account.disabled,
                              })
                            }
                            className="min-h-[34px] whitespace-nowrap rounded-lg border border-zinc-300 bg-white px-3 text-xs font-extrabold text-zinc-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            {account.disabled ? "Activar" : "Bloquear"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Admin | MyStore</title>
      </Head>

      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f2_0%,#ffffff_44%,#f8fafc_100%)] pb-10 pt-20 text-zinc-950 lg:pt-20 [&_*]:box-border">
        <div className="w-full lg:min-h-[calc(100vh-5rem)]">
          <aside className="fixed left-0 top-20 z-40 hidden h-[calc(100vh-5rem)] w-[304px] overflow-y-auto border-r border-zinc-200/80 bg-white/95 p-5 shadow-[14px_0_45px_rgba(15,23,42,0.07)] backdrop-blur lg:block">
            <div className="rounded-2xl border border-zinc-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#fff7f0_100%)] p-5 text-zinc-950 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
                Admin MyStore
              </span>
              <h1 className="m-0 mt-2 font-display text-2xl font-extrabold leading-tight">
                Gestion global
              </h1>
              <button
                type="button"
                onClick={() => push("/panel-de-control")}
                className="mt-5 inline-flex w-full items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm font-bold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                <MdStorefront className="text-lg text-brand-coral" />
                Volver al panel
              </button>
            </div>

            <nav className="mt-6 grid gap-2">
              {adminTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={tab.disabled}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
                      active
                        ? "border-brand-coral/25 bg-[#fff7f0] text-zinc-950 shadow-sm"
                        : "border-transparent bg-white text-zinc-600 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950"
                    }`}
                  >
                    <Icon
                      className={`mt-0.5 text-xl ${
                        active ? "text-brand-coral" : "text-zinc-400"
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold">
                        {tab.label}
                      </span>
                      <span className="mt-1 block text-xs font-semibold leading-5 text-zinc-500">
                        {tab.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="min-w-0 px-4 sm:px-6 lg:ml-[304px] lg:px-8 lg:py-8 xl:px-10">
            <div className="mb-5 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-5 lg:hidden">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
                Admin MyStore
              </span>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="m-0 font-display text-2xl font-extrabold leading-tight text-zinc-950">
                    {adminTabs.find((tab) => tab.id === activeTab)?.label}
                  </h1>
                  <p className="m-0 mt-1 text-sm font-semibold text-zinc-600">
                    Gestion global
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => push("/panel-de-control")}
                  className="shrink-0 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-extrabold text-zinc-700"
                >
                  Panel
                </button>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      disabled={tab.disabled}
                      onClick={() => !tab.disabled && setActiveTab(tab.id)}
                      className={`grid min-h-[72px] place-items-center rounded-xl border px-2 py-2 text-center text-xs font-extrabold transition disabled:opacity-50 ${
                        active
                          ? "border-rose-500/40 bg-rose-50 text-brand-coral"
                          : "border-zinc-200 bg-white text-zinc-600"
                      }`}
                    >
                      <Icon className="text-xl" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_14px_38px_rgba(15,23,42,0.045)]"
                  >
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.06em] text-zinc-500">
                      <Icon className="text-lg text-brand-coral" />
                      {card.label}
                    </div>
                    <strong className="mt-2 block font-display text-2xl font-extrabold leading-none text-zinc-950">
                      {card.value}
                    </strong>
                  </div>
                );
              })}
            </div>

            {activeTab === "accounts" ? (
              renderAccounts()
            ) : activeTab === "billing" ? (
              renderSubscriptions()
            ) : (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm font-bold text-zinc-500 shadow-[0_18px_50px_rgba(15,23,42,0.055)]">
                Esta seccion queda preparada para agregar mas herramientas del admin.
              </div>
            )}
          </section>
        </div>
        {recontactProgress.open && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/45 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-950/25">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-coral">
                    Recontacto n8n
                  </span>
                  <h3 className="m-0 mt-1 font-display text-2xl font-extrabold text-zinc-950">
                    Envio de mails en proceso
                  </h3>
                  <p className="m-0 mt-1 text-sm font-bold text-zinc-500">
                    Una peticion por cuenta, con 3 segundos de distancia entre cada envio.
                  </p>
                </div>
                {!recontactSending && (
                  <button
                    type="button"
                    onClick={() =>
                      setRecontactProgress({
                        open: false,
                        total: 0,
                        current: 0,
                        sent: 0,
                        failed: 0,
                        currentEmail: "",
                        status: "idle",
                        message: "",
                      })
                    }
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-slate-50"
                    aria-label="Cerrar progreso de recontacto"
                  >
                    <MdClose className="text-xl" />
                  </button>
                )}
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4 text-sm font-extrabold text-zinc-700">
                  <span>
                    {recontactProgress.current} / {recontactProgress.total} procesadas
                  </span>
                  <span>
                    {recontactProgress.total > 0
                      ? Math.round((recontactProgress.current / recontactProgress.total) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-zinc-950 transition-all duration-500"
                    style={{
                      width: `${
                        recontactProgress.total > 0
                          ? Math.round((recontactProgress.current / recontactProgress.total) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-zinc-200 bg-white p-3">
                    <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Enviados</p>
                    <strong className="mt-1 block text-xl font-extrabold text-emerald-700">{recontactProgress.sent}</strong>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-3">
                    <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Fallidos</p>
                    <strong className="mt-1 block text-xl font-extrabold text-red-700">{recontactProgress.failed}</strong>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-3">
                    <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">Estado</p>
                    <strong className="mt-1 block text-sm font-extrabold text-zinc-950">
                      {recontactProgress.status === "activating"
                        ? "Activando"
                        : recontactProgress.status === "waiting"
                        ? "Esperando"
                        : recontactProgress.status === "done"
                        ? "Finalizado"
                        : recontactProgress.status === "error"
                        ? "Con errores"
                        : "Enviando"}
                    </strong>
                  </div>
                </div>

                {recontactProgress.currentEmail && (
                  <p className="m-0 mt-4 truncate text-sm font-bold text-zinc-600">
                    Cuenta actual: <span className="text-zinc-950">{recontactProgress.currentEmail}</span>
                  </p>
                )}
                <p className="m-0 mt-2 text-sm font-bold text-zinc-600">
                  {recontactProgress.message}
                </p>
              </div>

              {!recontactSending && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setRecontactProgress({
                        open: false,
                        total: 0,
                        current: 0,
                        sent: 0,
                        failed: 0,
                        currentEmail: "",
                        status: "idle",
                        message: "",
                      })
                    }
                    className="min-h-[40px] rounded-xl bg-zinc-950 px-5 text-sm font-extrabold text-white shadow-lg shadow-zinc-950/15 transition hover:bg-zinc-800"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}      </main>
    </>
  );
}

export default AdminPage;






















































