import React, { useRef, useMemo } from "react";
import { ServicesModalWrapper } from "../ServicesModalWrapper";
import { useModal } from "../../contexts/ServicesModalContext";
import { useServicesContext } from "../../contexts/ServicesAuthContext";

const PaymentConfirmation = () => {
  const { isModalOpen, getModalData, closeModal } = useModal();
  const { lastModal } = getModalData("lastModal") || {};
  const isOpen = isModalOpen("lastModal");

  const { forWhat } = useServicesContext();
  const printRef = useRef();

  /* ---------------- FORMAT RESPONSE ---------------- */
  const tableData = useMemo(() => {
    if (!lastModal?.response) return [];

    const resp = lastModal.response;
    let flat = {};

    if (resp.responseReason !== "FAILURE") {
      flat = {
        "Response Code": resp.responseCode,
        "Response Reason": resp.responseReason,
        "Transaction Ref Id": resp.txnRefId,
        "Transaction Type": resp.txnRespType,
        "Amount (₹)": resp.respAmount
          ? `₹ ${(Number(resp.respAmount) / 100).toLocaleString("en-IN")}`
          : "",
        "Bill Date": resp.respBillDate,
        "Customer Name": resp.respCustomerName,
        "Due Date": resp.respDueDate,
        "Approval Ref Number": resp.approvalRefNumber,
      };
    } else {
      flat = {
        "Response Code": resp.responseCode,
        "Response Reason": resp.responseReason,
        "Error Message":
          resp?.vErrorRootVO?.error?.[0]?.errorMessage || "Transaction Failed",
      };
    }

    // 🔹 Add dynamic input params
    resp.inputParams?.input?.forEach((item) => {
      flat[item.paramName] = item.paramValue;
    });

    return Object.entries(flat).map(([key, value]) => ({
      key,
      value,
    }));
  }, [lastModal]);

  /* ---------------- SPLIT INTO 2-COLUMN ROWS ---------------- */
  const rows = [];
  for (let i = 0; i < tableData.length; i += 2) {
    rows.push(tableData.slice(i, i + 2));
  }

  /* ---------------- PRINT HANDLER ---------------- */
  const handlePrint = () => {
    const printContent = printRef.current;
    const newWindow = window.open("", "", "width=900,height=650");

    newWindow.document.write(`
      <html>
        <head>
          <title>Transaction Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            td { border: 1px solid #000; padding: 8px; }
            td.label { font-weight: bold; width: 25%; }
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
      onClose={() => closeModal("lastModal")}
      headerBg="bg-white"
      headerTextColor="text-green-600"
      renderHeader={
        <span className="font-semibold text-lg">Transaction Successful..!</span>
      }
      renderMiddle={
        <div ref={printRef}>
          <table className="w-full text-sm border border-gray-300">
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  {row.map((item, i) => (
                    <React.Fragment key={i}>
                      <td className="label border p-2">{item.key}</td>
                      <td className="border p-2">{item.value}</td>
                    </React.Fragment>
                  ))}

                  {row.length === 1 && (
                    <>
                      <td className="border p-2">&nbsp;</td>
                      <td className="border p-2">&nbsp;</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      renderFooter={() => (
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

export default PaymentConfirmation;
