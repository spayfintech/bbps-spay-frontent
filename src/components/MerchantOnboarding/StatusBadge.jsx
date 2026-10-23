import { Clock3, CheckCircle2, XCircle, FileClock } from "lucide-react";

export default function StatusBadge({ status }) {
  const statusValue = Number(status);

  const statusConfig = {
    0: {
      label: "Draft",
      bg: "bg-slate-100",
      text: "text-slate-700",
      icon: <FileClock size={12} />,
    },

    1: {
      label: "Pending",
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: <Clock3 size={12} />,
    },

    2: {
      label: "Approved",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      icon: <CheckCircle2 size={12} />,
    },

    3: {
      label: "Rejected",
      bg: "bg-red-100",
      text: "text-red-700",
      icon: <XCircle size={12} />,
    },
  };

  const current = statusConfig[statusValue] || statusConfig[0];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${current.bg} ${current.text}`}
    >
      {current.icon}
      {current.label}
    </span>
  );
}
