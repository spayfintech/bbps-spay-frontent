import { useState } from "react";
import { toast } from "react-toastify";
import { usePost } from "../../hooks/usePost";
import { Video, Store, ShieldCheck, CheckCircle } from "lucide-react";

const AadhaarForm = ({ onBack, onNext }) => {
  const [videoDone, setVideoDone] = useState(false);
  const [shopDone, setShopDone] = useState(false);
  const [digilockerDone, setDigilockerDone] = useState(false);

  const [videoSession, setVideoSession] = useState({
    sessionId: "",
    link: "",
    purpose: "",
  });

  const { execute: createVideoSession, loading: videoLoading } =
    usePost("/vkyc/session");

  const startVideoKyc = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await createVideoSession({
        user_id: user?.id,
      });

      if (res?.status !== "success") {
        throw new Error(res?.message || "Unable to create Video KYC session");
      }

      const session = res.data;

      setVideoSession({
        sessionId: session.session_id,
        link: session.link,
        purpose: session.purpose,
      });

      if (!session.link) {
        throw new Error("VKYC link not received.");
      }

      toast.success("Video KYC session created successfully.");

      window.open(session.link, "_blank", "noopener,noreferrer");

      // Temporary for testing
      // setVideoDone(true);
    } catch (err) {
      console.error("Video KYC Error:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to start Video KYC.",
      );
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-slate-900">
        Identity Verification
      </h2>

      <p className="text-sm text-slate-500 mt-2 mb-8">
        Complete the following verification steps.
      </p>

      <div className="space-y-5">
        {/* Video KYC */}

        {!videoDone && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#155DFC]/10">
                <Video size={22} className="text-[#155DFC]" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Video KYC
                  </h3>

                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    Secure
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Verify your identity through a secure live video call to
                  continue your onboarding process.
                </p>

                <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-[#155DFC]" />
                    Encrypted Verification
                  </div>

                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={15} className="text-green-600" />
                    Takes 2–3 Minutes
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startVideoKyc}
                  disabled={videoLoading}
                  className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] text-sm font-medium text-white transition-all duration-200 hover:bg-[#0F4FD1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Video size={18} />

                  {videoLoading ? "Generating Link..." : "Start Video KYC"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shop Photos */}

        {videoDone && !shopDone && (
          <div className="border rounded-xl p-5">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Store className="text-blue-600" size={22} />
              </div>

              <div>
                <h3 className="font-semibold">Shop Verification</h3>

                <p className="text-sm text-slate-500 mt-1">
                  Upload shop outside & inside photos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <input type="file" className="border rounded-md p-2" />

              <input type="file" className="border rounded-md p-2" />
            </div>

            <button
              onClick={() => setShopDone(true)}
              className="mt-5 w-full h-11 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Upload Photos
            </button>
          </div>
        )}

        {/* Digilocker */}

        {videoDone && shopDone && !digilockerDone && (
          <div className="border rounded-xl p-5">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShieldCheck className="text-blue-600" size={22} />
              </div>

              <div>
                <h3 className="font-semibold">DigiLocker Verification</h3>

                <p className="text-sm text-slate-500 mt-1">
                  Fetch Aadhaar & PAN using DigiLocker.
                </p>
              </div>
            </div>

            <button
              onClick={() => setDigilockerDone(true)}
              className="mt-6 w-full h-11 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Connect DigiLocker
            </button>
          </div>
        )}

        {videoDone && shopDone && digilockerDone && (
          <div className="border rounded-xl p-8 text-center">
            <CheckCircle size={60} className="mx-auto text-green-600" />

            <h3 className="mt-4 text-xl font-semibold">
              Verification Completed
            </h3>

            <p className="text-slate-500 mt-2">
              All verification steps have been completed successfully.
            </p>

            <button
              onClick={onNext}
              className="mt-8 w-full h-11 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue
            </button>
          </div>
        )}

        {/* Buttons */}

        <div className="flex justify-end pt-3">
          <button
            disabled={!(videoDone && shopDone && digilockerDone)}
            onClick={onNext}
            className={`h-11 px-8 rounded-md text-white transition
            ${
              videoDone && shopDone && digilockerDone
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default AadhaarForm;
