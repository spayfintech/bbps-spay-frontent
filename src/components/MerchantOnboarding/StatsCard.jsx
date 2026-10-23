export default function StatsCard({
  title,
  value,
  icon,
  color = "blue",
  suffix = "",
}) {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
    },

    yellow: {
      bg: "bg-amber-50",
      icon: "text-amber-500",
    },

    green: {
      bg: "bg-emerald-50",
      icon: "text-emerald-500",
    },

    purple: {
      bg: "bg-violet-50",
      icon: "text-violet-500",
    },

    red: {
      bg: "bg-red-50",
      icon: "text-red-500",
    },
  };

  const theme = colors[color] || colors.blue;

  return (
    <div
      className="
        bg-white
        border
        border-slate-200
        rounded-2xl
        px-5
        py-5
        shadow-sm
        hover:shadow-md
        transition-all
        duration-200
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-slate-500 font-medium">{title}</p>

          <div className="flex items-end gap-2 mt-3">
            <h4 className="text-2xl font-bold text-slate-900 leading-none">
              {value}
            </h4>

            {suffix && (
              <span className="text-sm text-slate-500 mb-1">{suffix}</span>
            )}
          </div>
        </div>

        <div
          className={`
            w-12
            h-12
            rounded-xl
            flex
            items-center
            justify-center
            ${theme.bg}
            ${theme.icon}
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
