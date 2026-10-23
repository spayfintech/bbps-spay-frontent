import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ChevronRight,
  Receipt,
  Smartphone,
  CreditCard,
  Landmark,
  Fingerprint,
  Send,
  Menu,
  Download,
  ShieldCheck,
  Rocket,
  Headphones,
  Trophy,
  Wallet,
  Plane,
  BadgeIndianRupee,
  QrCode,
} from "lucide-react";

const MainServices = () => {
  const navigate = useNavigate();

  const handleServiceClick = (service) => {
    if (service.enabled) {
      navigate(service.route);
      return;
    }

    toast.info(
      `${service.title} will be available soon. We're working to launch it shortly.`,
      {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
      },
    );
  };

  const services = [
    {
      title: "Bill Payments",
      description: "Pay all your utility and other bills instantly.",
      icon: Receipt,
      bg: "from-blue-100 to-blue-50",
      color: "text-blue-600",
      route: "/services",
      enabled: true,
    },
    {
      title: "Vendor Payment",
      description: "Send money to the Vendor.",
      icon: Send,
      bg: "from-emerald-100 to-cyan-50",
      color: "text-emerald-600",
      route: "/vendor-payment",
      enabled: true,
    },
    {
      title: "QR Services",
      description: "Generate and manage QR codes for merchant payments.",
      icon: QrCode,
      bg: "from-violet-100 to-purple-50",
      color: "text-violet-600",
      route: "/qr-services",
      enabled: true,
    },
    {
      title: "mPOS Services",
      description: "Accept card payments anywhere, anytime.",
      icon: CreditCard,
      bg: "from-blue-100 to-cyan-50",
      color: "text-blue-600",
      route: "/mpos",
      enabled: false,
    },
    {
      title: "Recharges",
      description: "Recharge mobile, DTH and other services.",
      icon: Smartphone,
      bg: "from-orange-100 to-yellow-50",
      color: "text-orange-500",
      route: "/recharge",
      enabled: false,
    },
    {
      title: "Aadhaar Pay",
      description: "Make secure payments using Aadhaar.",
      icon: Fingerprint,
      bg: "from-pink-100 to-rose-50",
      color: "text-pink-600",
      route: "/aadhar-pay",
      enabled: false,
    },
    {
      title: "Aadhaar ATM",
      description: "Cash withdrawal using Aadhaar & biometric.",
      icon: Landmark,
      bg: "from-cyan-100 to-teal-50",
      color: "text-cyan-600",
      route: "/aadhar-atm",
      enabled: false,
    },
    {
      title: "Wallet Services",
      description: "Add money and manage your wallet balance.",
      icon: Wallet,
      bg: "from-amber-100 to-yellow-50",
      color: "text-amber-700",
      route: "/wallet-services",
      enabled: false,
    },
    {
      title: "Insurance",
      description: "Purchase health, life and general insurance.",
      icon: ShieldCheck,
      bg: "from-green-100 to-emerald-50",
      color: "text-green-600",
      route: "/insurance",
      enabled: false,
    },
    {
      title: "Flight Booking",
      description: "Book domestic and international flights instantly.",
      icon: Plane,
      bg: "from-sky-100 to-cyan-50",
      color: "text-sky-600",
      route: "/flight-booking",
      enabled: false,
    },
    {
      title: "Cash Deposit (CMS)",
      description: "Deposit cash securely through CMS services.",
      icon: BadgeIndianRupee,
      bg: "from-indigo-100 to-blue-50",
      color: "text-indigo-600",
      route: "/cms",
      enabled: false,
    },
  ];

  const features = [
    {
      title: "Secure & Reliable",
      description: "100% secure transactions with bank level security.",
      icon: ShieldCheck,
      color: "text-blue-600",
    },
    {
      title: "Instant Processing",
      description: "Lightning fast processing for all services.",
      icon: Rocket,
      color: "text-blue-600",
    },
    {
      title: "24x7 Support",
      description: "Round the clock customer support.",
      icon: Headphones,
      color: "text-blue-600",
    },
    {
      title: "High Success Rate",
      description: "Best in class success ratio in the industry.",
      icon: Trophy,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Main Content */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          {/* Breadcrumb */}

          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-blue-600">Home</span>

            <span>/</span>

            <span>All services</span>
          </div>

          {/* Heading */}

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            All Services
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Our platform for all your payments and financial services.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-[#DCE8FF] bg-gradient-to-r from-[#F6FAFF] via-[#F9FBFF] to-[#EEF5FF] px-10 py-1">
        {/* Background Waves */}

        <div className="absolute inset-0">
          <div className="absolute -right-16 top-0 h-72 w-72 rounded-full border-[40px] border-blue-100/40"></div>
          <div className="absolute right-10 bottom-0 h-56 w-56 rounded-full border-[30px] border-blue-200/30"></div>
        </div>

        {/* Dots */}

        <div className="absolute left-6 top-6 grid grid-cols-6 gap-2 opacity-25">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-300" />
          ))}
        </div>

        <div className="relative flex items-center justify-between">
          {/* Left */}

          <div className="max-w-md">
            <h2 className="text-[21px] font-bold leading-tight text-[#14245A]">
              All Your Services,
            </h2>

            <h2 className="text-[18px] font-bold leading-tight text-[#2563EB]">
              One Platform.
            </h2>

            <p className="mt-3 text-[15px] font-medium text-slate-500">
              Simple, Secure & Instant.
            </p>
          </div>

          {/* Right */}

          <div className="hidden lg:flex w-[42%] items-center justify-center">
            {/* Phone image yaha aayegi */}

            <div className="flex h-40 w-24 rotate-[10deg] items-center justify-center rounded-[28px] border-4 border-[#1E3A8A] bg-white shadow-2xl">
              <span className="text-5xl font-black text-blue-600">S</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-1 py-2">
        {/* Services Placeholder */}
        <div className="mt-3">
          <h1 className="mb-5 text-[16px] font-bold tracking-tight text-slate-900">
            Explore Our Services
          </h1>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service, index) =>
              renderServiceCard(service, index, handleServiceClick),
            )}
          </div>
        </div>
      </div>

      {/* Bottom Placeholder */}
      <div className="mt-12 overflow-hidden rounded-[20px] border border-[#E5ECFA] bg-gradient-to-r from-[#F9FBFF] via-white to-[#F8FBFF] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className={`
                    flex
                    items-center
                    gap-4
                    px-4
                    py-4
                    transition-all
                    duration-300
                    hover:bg-blue-50/30

                    ${
                      index !== features.length - 1
                        ? "border-b border-[#EDF2FB] md:border-b-0 md:border-r"
                        : ""
                    }
                `}
              >
                {/* Icon */}

                <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                  <Icon className={`${item.color} h-6 w-6`} strokeWidth={2} />
                </div>

                {/* Text */}

                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold text-[#18316D]">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-[12px] leading-5 text-[#667085]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const renderServiceCard = (service, index, handleServiceClick) => {
  const Icon = service.icon;

  return (
    <div
      key={index}
      onClick={() => handleServiceClick(service)}
      className="
        group
        flex
        items-center
        justify-between
        rounded-2xl
        border
        border-[#E8EEF8]
        bg-white
        px-4
        py-4
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-blue-200
        hover:shadow-[0_10px_30px_rgba(37,99,235,0.08)]
        cursor-pointer
      "
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Icon */}

        <div
          className={`
            flex
            h-[62px]
            w-[62px]
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-gradient-to-br
            ${service.bg}
          `}
        >
          <Icon className={`${service.color} h-7 w-7`} strokeWidth={2.2} />
        </div>

        {/* Text */}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-[#162554]">
            {service.title}
          </h3>

          <p className="mt-1 text-[12px] leading-5 text-slate-500 line-clamp-2 break-words">
            {service.description}
          </p>
        </div>
      </div>

      {/* Arrow */}

      <ChevronRight
        size={18}
        className="
          ml-2
          shrink-0
          text-blue-500
          transition-all
          duration-300
          group-hover:translate-x-1
        "
      />
    </div>
  );
};
export default MainServices;
