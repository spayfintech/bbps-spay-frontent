import React, { useState, useEffect, useRef } from "react";
import { ServicesModalWrapper } from "./ServicesModalWrapper";
import { useModal } from "../contexts/ServicesModalContext";
import placeholderImg from "../images/Spaylogo.png";

export const ServiceSelectionModal = () => {
  const { isModalOpen, getModalData, openModal, closeModal } = useModal();
  const [selectedBiller, setSelectedBiller] = useState("");
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOpen = isModalOpen("serviceSelecter");
  const { service } = getModalData("serviceSelecter") || {};

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setServiceList(["Tata Play", "Airtel DTH", "Videocon d2h", "DishTV"]);
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const resetForm = () => {
    setSelectedBiller("");
    setLoading(true);
  };

  const handleNext = (close) => {
    if (!selectedBiller) return alert("Select a biller!");
    close(); // triggers fly-out
    setTimeout(() => openModal("details", { selectedBiller }), 260);
  };

  return (
    <ServicesModalWrapper
      isOpen={isOpen}
      onClose={() => closeModal("serviceSelecter")}
      resetOnClose={resetForm}
      renderHeader={
        <>
          <img src={placeholderImg} alt="Logo" className="h-7" />
          <span className="font-semibold text-xl ml-2">
            Select {service?.label || "Biller"}
          </span>
        </>
      }
      renderMiddle={
        <select
          value={selectedBiller}
          onChange={(e) => setSelectedBiller(e.target.value)}
          disabled={loading}
          className="w-full p-3 border border-gray-200 rounded mb-4"
        >
          <option value="">{loading ? "Loading..." : "Select Biller"}</option>
          {serviceList.map((biller) => (
            <option key={biller} value={biller}>
              {biller}
            </option>
          ))}
        </select>
      }
      renderFooter={(close) => (
        <>
          <button
            onClick={() => handleNext(close)}
            disabled={loading || !selectedBiller}
            className={`px-4 py-2 rounded text-white ${
              !selectedBiller
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Next
          </button>
          <button
            onClick={close}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </>
      )}
    />
  );
};

// ==================== Details Modal ====================
export const DetailsModalComponent = () => {
  const { isModalOpen, getModalData, openModal, closeModal } = useModal();
  const { selectedBiller } = getModalData("details") || {};
  const isOpen = isModalOpen("details");

  const [account, setAccount] = useState("");
  const [mobile, setMobile] = useState("");

  const resetForm = () => {
    setAccount("");
    setMobile("");
  };

  const handleSubmit = (close) => {
    if (!account || !mobile) return alert("Fill all fields");
    const data = { selectedBiller, account, mobile };
    close(); // fly-out animation
    setTimeout(() => openModal("txnConfirm", { data }), 260);
  };

  return (
    <ServicesModalWrapper
      isOpen={isOpen}
      onClose={() => closeModal("details")}
      resetOnClose={resetForm}
      renderHeader={
        <>
          <img src={placeholderImg} alt="Logo" className="h-7" />
          <span className="font-semibold ml-2">
            Details for {selectedBiller}
          </span>
        </>
      }
      renderMiddle={
        <>
          <div className="pb-3">
            You selected biller: <strong>{selectedBiller}</strong>
          </div>
          <label>Account Number</label>
          <input
            placeholder="Account Number"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <label>Mobile Number</label>
          <input
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
        </>
      }
      renderFooter={(close) => (
        <>
          <button
            onClick={() => handleSubmit(close)}
            disabled={!account || !mobile}
            className={`px-4 py-2 rounded text-white ${
              !account || !mobile
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Submit
          </button>
          <button
            onClick={close}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </>
      )}
    />
  );
};

// ==================== Transaction Confirm Modal ====================
export const TxnConfirmModal = () => {
  const { isModalOpen, getModalData, closeModal, openModal } = useModal();
  const { data } = getModalData("txnConfirm") || {};
  const isOpen = isModalOpen("txnConfirm");

  const tableData = [
    { key: "Biller ID:", value: "DUMMY0000DIG08" },
    { key: "Customer Email:", value: "khanamaanak1@gmail.com" },
    { key: "Customer Name:", value: "N/A" },
    { key: "Bill Date:", value: "N/A" },
    { key: "Bill Amount:", value: "₹N/A" },
    { key: "Total Amount:", value: "₹N/A" },
    { key: "Customer Mobile:", value: "9284210056" },
    { key: "Customer Pan:", value: "AAAPZ1234C" },
    { key: "Bill Number:", value: "N/A" },
    { key: "Bill Period:", value: "N/A" },
    { key: "Due Date:", value: "N/A" },
  ];

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const processedData = (() => {
    let list = [...tableData];

    if (list.length % 2 !== 0) list.push({ key: "", value: "" });

    if (isDesktop) {
      const mid = list.length / 2;
      const merged = [];
      for (let i = 0; i < mid; i++) merged.push([list[i], list[i + mid]]);
      return merged;
    }

    return list.map((item) => [item]);
  })();

  const handlePay = () => {
    closeModal("txnConfirm"); // close current modal
    setTimeout(() => {
      openModal("txnForm", { txnData: data }); // open new form modal
    }, 250); // allow fly-out animation
  };

  const resetForm = () => {};

  return (
    <ServicesModalWrapper
      isOpen={isOpen}
      onClose={() => closeModal("txnConfirm")}
      resetOnClose={resetForm}
      renderHeader={
        <>
          <img src={placeholderImg} alt="Logo" className="h-7" />
          <span className="font-semibold ml-2">
            Are you sure you want to proceed?
          </span>
        </>
      }
      renderMiddle={
        <>
          <div className="pb-3">
            <div className="p-3 shadow-md border-2 border-gray-50 shadow-gray-400">
              <div className="pb-3 font-semibold">Your Bill Details:</div>
              <table className="w-full text-[15px] border border-gray-200 border-collapse">
                <tbody>
                  {processedData.map((pair, index) => (
                    <tr key={index} className="border border-gray-200">
                      {pair.map((item, i) => (
                        <React.Fragment key={i}>
                          <td className="border border-gray-200 p-1 w-1/4">
                            {item.key}
                          </td>
                          <td className="border border-gray-200 p-1 w-1/4">
                            {item.value}
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 p-3 shadow-md border-2 border-gray-50 shadow-gray-400">
              <div className="pb-3 font-semibold text-orange-400">
                Enter Payment Details
              </div>
              <div className="flex mb-4">
                <div className="flex flex-col space-y-1 w-full p-1">
                  <label>Remitter Name</label>
                  <input
                    type="text"
                    placeholder="Enter Your Name"
                    className="border border-gray-300 rounded-md px-3 py-2 h-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex flex-col space-y-1 w-full p-1">
                  <label>Payment Mode</label>
                  <select className="border border-gray-300 rounded-md px-3 py-2 h-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option>Cash</option>
                    <option>Debit Card</option>
                    <option>Credit Card</option>
                    <option>Net Banking</option>
                    <option>UPI</option>
                  </select>
                </div>
              </div>

              <div className="flex mb-4">
                <div className="flex flex-col space-y-1 w-full p-1">
                  <label>Quick Pay</label>
                  <select className="border border-gray-300 rounded-md px-3 py-2 h-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1 w-full p-1">
                  <label>Split Pay</label>
                  <select className="border border-gray-300 rounded-md px-3 py-2 h-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </>
      }
      renderFooter={(close) => (
        <>
          <button
            onClick={handlePay}
            className="px-4 py-2 rounded text-white bg-green-700"
          >
            Pay
          </button>
          <button
            onClick={close}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </>
      )}
    />
  );
};

export const TxnFormModal = () => {
  const { isModalOpen, getModalData, closeModal } = useModal();
  const { txnData } = getModalData("txnForm") || {};
  const isOpen = isModalOpen("txnForm");

  // Sample random data for demonstration
  const tableData = txnData
    ? Object.entries(txnData).map(([key, value]) => ({ key, value }))
    : [
        { key: "Transaction ID", value: "TXN123456" },
        { key: "Amount", value: "₹5000" },
        { key: "Date", value: "12-Nov-2025" },
        { key: "Status", value: "Successful" },
      ];

  // Split into max 2 columns per row
  const rows = [];
  for (let i = 0; i < tableData.length; i += 2) {
    rows.push(tableData.slice(i, i + 2));
  }

  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    const newWindow = window.open("", "", "width=800,height=600");
    newWindow.document.write(`
      <html>
        <head>
          <title>Print Transaction</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #000; padding: 8px; }
            td.font-semibold { font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };

  return (
    <ServicesModalWrapper
      isOpen={isOpen}
      onClose={() => closeModal("txnForm")}
      headerBg="bg-white"
      headerTextColor="text-green-600"
      renderHeader={
        <span className="font-semibold text-lg">Transaction Successful</span>
      }
      renderMiddle={
        <div ref={printRef}>
          <table className="w-full text-[15px] border border-gray-200 border-collapse">
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border border-gray-200">
                  {row.map((item, i) => (
                    <React.Fragment key={i}>
                      <td className="border p-1 font-semibold w-1/4">
                        {item.key}
                      </td>
                      <td className="border p-1 w-1/4">{item.value}</td>
                    </React.Fragment>
                  ))}
                  {row.length === 1 && (
                    <>
                      <td className="border p-1 w-1/4">&nbsp;</td>
                      <td className="border p-1 w-1/4">&nbsp;</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      renderFooter={(close) => (
        <>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Print
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Email
          </button>
        </>
      )}
    />
  );
};
