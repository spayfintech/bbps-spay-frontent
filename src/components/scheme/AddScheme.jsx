import React, { useState } from "react";
import AddSchemeForm from "./AddSchemeForm";
import VendorpaymentScheme from "./VendorpaymentScheme";

const AddScheme = ({ refresh, onClose }) => {
  const [selectedScheme, setSelectedScheme] = useState(null);

  const schemes = [
    {
      id: "bbps",
      name: "BBPS",
      description: "Manage BBPS commission schemes",
    },
    {
      id: "vendorpayment",
      name: "Vendor Payment",
      description: "Manage Vendor payment commissions",
    },
    {
      id: "payout",
      name: "Payout",
      description: "Manage payout commission schemes",
    },
  ];

  return (
    <>
      {/* Main Add Scheme Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add Scheme</h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a service to create a new commission scheme.
              </p>
            </div>

            <buttom
              onClick={onClose}
              className="text-3xl font-bold text-slate-400 transition hover:text-slate-700"
            >
              &times;
            </buttom>
          </div>

          {/* Scheme Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {schemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => setSelectedScheme(scheme.id)}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <span className="text-lg font-bold">
                    {scheme.name.charAt(0)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  {scheme.name}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {scheme.description}
                </p>

                <div className="mt-5 text-sm font-semibold text-blue-600 transition group-hover:text-blue-700">
                  Add {scheme.name} Scheme →
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BBPS Form Popup */}
      {selectedScheme === "bbps" && (
        <AddSchemeForm
          refresh={refresh}
          onClose={() => {
            setSelectedScheme(null);
            onClose();
          }}
          onBack={() => setSelectedScheme(null)}
        />
      )}

      {selectedScheme === "vendorpayment" && (
        <VendorpaymentScheme
          refresh={refresh}
          onClose={() => {
            setSelectedScheme(null);
            onClose();
          }}
          onBack={() => setSelectedScheme(null)}
        />
      )}
    </>
  );
};

export default AddScheme;
