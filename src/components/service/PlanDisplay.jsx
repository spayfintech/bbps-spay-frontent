import React, { useEffect, useMemo, useState } from "react";
import { ServicesModalWrapper } from "../ServicesModalWrapper";
import { useModal } from "../../contexts/ServicesModalContext";
import placeholderImg from "../../images/Spaylogo.png";
import { usePost } from "../../hooks/usePost";
import { useServicesContext } from "../../contexts/ServicesAuthContext";

const PlanDisplay = () => {
  const { isModalOpen, getModalData, openModal, closeModal } = useModal();
  const { selectedBiller } = getModalData("plandisplay") || {};
  const isOpen = isModalOpen("plandisplay");
  const { forWhat } = useServicesContext();

  const testEnv = useMemo(() => {
    return forWhat;
  }, [forWhat]);

  const { execute } = usePost(`/bbps/plan-pull${testEnv}/json`);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!selectedBiller.billerId) return;

      const res = await execute(selectedBiller.billerId);

      setResponse(res);

      // Use plans from API response
      if (res) {
        // console.log(res.data.decoded.planDetails);

        setPlans(res.data.decoded.planDetails);
      } else if (Array.isArray(res)) {
        setPlans(res);
      }
    };

    fetchPlans();
  }, [selectedBiller]);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);

    closeModal("plandisplay"); // closes first modal

    setTimeout(() => {
      openModal("details", {
        selectedBiller: selectedBiller,
        plan: selectedPlan,
        // inputParams:inputParams
      });
    }, 150); // small delay ensures modal context updates
  };

  const handleCancel = (close) => {
    window.location.reload(true);
    close();
  };
  const handleNext = (close) => {
    if (!selectedPlan) {
      alert("Please select a plan first.");
      return;
    }

    close();

    setTimeout(() => {
      openModal("details", {
        selectedPlan,
        fullResponse: response,
      });
    }, 250);
  };

  const planHandle = (item) => {};
  const renderPlans = () => {
    if (!plans || plans.length === 0) {
      return <p>No plans available.</p>;
    }

    return plans.map((item, index) => (
      <div
        key={index}
        onClick={() => handleSelectPlan(item)}
        className={`border rounded p-3 mb-3 shadow cursor-pointer 
          ${selectedPlan === item ? "border-blue-600 bg-blue-50" : ""}`}
      >
        <h3 className="font-bold text-lg">{item.planName || "Plan"}</h3>

        <p className="text-sm text-gray-700">Amount: ₹{item.amountInRupees}</p>

        <p className="text-sm text-gray-700">
          Description: {item.planDesc || "N/A"}
        </p>

        <button
          onClick={() => {
            console.log("");
          }}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Select Plan
        </button>
      </div>
    ));
  };
  console.log("Plan Display");
  console.log(selectedBiller);

  return (
    <ServicesModalWrapper
      isOpen={isOpen}
      onClose={() => closeModal("plandisplay")}
      renderHeader={
        <>
          <img src={placeholderImg} alt="Logo" className="h-7" />
          <span className="font-semibold ml-2">Available Plans</span>
        </>
      }
      renderMiddle={<div>{renderPlans()}</div>}
      renderFooter={(close) => (
        <>
          <button
            onClick={() => handleCancel(close)}
            className="px-3 py-1.5 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={() => handleNext(close)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Next
          </button>
        </>
      )}
    />
  );
};

export default PlanDisplay;
