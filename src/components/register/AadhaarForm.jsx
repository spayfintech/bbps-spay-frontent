import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { usePost } from "../../hooks/usePost";
import {
  Video,
  Store,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";

const AadhaarForm = ({ onBack, onNext, disableBack = false, initialData }) => {
  const [cookie] = useCookies(["token"]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  /* -------------------------------------------------------------------------- */
  /* COMPLETION STATES                                                          */
  /* -------------------------------------------------------------------------- */

  const [videoDone, setVideoDone] = useState(false);
  const [shopDone, setShopDone] = useState(false);
  const [digilockerDone, setDigilockerDone] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* SHOP STATE                                                                 */
  /* -------------------------------------------------------------------------- */

  const [shopFront, setShopFront] = useState(null);
  const [shopInside, setShopInside] = useState(null);

  /* -------------------------------------------------------------------------- */
  /* DIGILOCKER STATE                                                           */
  /* -------------------------------------------------------------------------- */

  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [digilockerData, setDigilockerData] = useState(null);

  /* -------------------------------------------------------------------------- */
  /* VIDEO KYC STATE                                                            */
  /* -------------------------------------------------------------------------- */

  const [videoSession, setVideoSession] = useState({
    sessionId: "",
    link: "",
    purpose: "",
  });

  /* -------------------------------------------------------------------------- */
  /* BACK CONFIRMATION MODAL                                                    */
  /* -------------------------------------------------------------------------- */

  const [showBackModal, setShowBackModal] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* API HOOKS                                                                  */
  /* -------------------------------------------------------------------------- */

  const { execute: saveShop, loading: shopLoading } = usePost(
    "/merchant-onboarding/save-shop",
  );

  const { execute: linkVkyc } = usePost("/merchant-onboarding/link-vkyc");

  const { execute: linkDigilocker } = usePost(
    "/merchant-onboarding/link-digilocker",
  );

  const { execute: createVideoSession, loading: videoLoading } = usePost(
    "/vkyc/session",
  );

  /* -------------------------------------------------------------------------- */
  /* HELPERS — DIGILOCKER COMPLETENESS                                          */
  /* -------------------------------------------------------------------------- */

  const hasAadhaarData = Boolean(digilockerData?.aadhaar);
  const hasPanData = Boolean(digilockerData?.pan);

  const isDigilockerFullyFetched = hasAadhaarData && hasPanData;

  /* -------------------------------------------------------------------------- */
  /* RESTORE PREVIOUSLY COMPLETED DATA                                          */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("merchant_onboarding_data");

      const data =
        (initialData && Object.keys(initialData).length > 0
          ? initialData
          : null) || (stored ? JSON.parse(stored) : null);

      if (!data) return;

      /* Video KYC */
      if (data?.video_session_id) {
        setVideoDone(true);
        setVideoSession((previous) => ({
          ...previous,
          sessionId: data.video_session_id,
        }));
      }

      /* Shop */
      if (data?.shop_front_image || data?.shop_inside_image) {
        setShopDone(true);
      }

      /* DigiLocker — RELAXED CHECK (requires only both documents) */
      const cachedDigilocker = data?.digilocker_data || null;

      const cachedHasAadhaar = Boolean(cachedDigilocker?.aadhaar);
      const cachedHasPan = Boolean(cachedDigilocker?.pan);

      if (cachedDigilocker) {
        setDigilockerData(cachedDigilocker);
      }

      if (cachedHasAadhaar && cachedHasPan) {
        setDigilockerDone(true);
      } else {
        setDigilockerDone(false);
      }
    } catch (error) {
      console.error("Unable to restore onboarding identity data:", error);
    }
  }, [initialData]);

  /* -------------------------------------------------------------------------- */
  /* LOCAL STORAGE HELPER                                                       */
  /* -------------------------------------------------------------------------- */

  const updateOnboardingSession = (newData) => {
    try {
      const existingData = JSON.parse(
        sessionStorage.getItem("merchant_onboarding_data") || "{}",
      );

      const merged = {
        ...existingData,
        ...newData,
      };

      sessionStorage.setItem(
        "merchant_onboarding_data",
        JSON.stringify(merged),
      );

      return merged;
    } catch (error) {
      console.error("Unable to update onboarding session:", error);
      return newData;
    }
  };

  /* -------------------------------------------------------------------------- */
  /* SHOP PHOTO UPLOAD                                                          */
  /* -------------------------------------------------------------------------- */

  const handleShopUpload = async () => {
    if (!shopFront || !shopInside) {
      toast.error("Please upload both shop photos.");
      return;
    }

    const merchantId = sessionStorage.getItem("merchant_onboarding_id");

    if (!merchantId) {
      toast.error("Merchant onboarding session expired.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("merchant_onboarding_id", merchantId);
      formData.append("shop_front_image", shopFront);
      formData.append("shop_inside_image", shopInside);

      const response = await saveShop(formData);

      if (response?.status !== "success") {
        toast.error(
          response?.message || "Unable to upload shop photos.",
        );
        return;
      }

      setShopDone(true);

      updateOnboardingSession({
        shop_front_image: true,
        shop_inside_image: true,
      });

      toast.success("Shop Photos Uploaded Successfully");
    } catch (error) {
      console.error("Shop upload error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to upload shop photos.",
      );
    }
  };

  /* -------------------------------------------------------------------------- */
  /* DIGILOCKER — INIT                                                          */
  /* -------------------------------------------------------------------------- */

  const startDigilocker = async () => {
    const merchantId = sessionStorage.getItem("merchant_onboarding_id");

    if (!merchantId) {
      toast.error("Merchant onboarding session expired.");
      return;
    }

    if (!cookie?.token) {
      toast.error("Authentication session expired. Please login again.");
      return;
    }

    try {
      setDigilockerLoading(true);

      const response = await axios.post(
        `${BASE_URL}/digilocker/init-aadhaar-pan`,
        {},
        {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
            Accept: "application/json",
          },
        },
      );

      const sdkUrl = response?.data?.data?.sdk_url;
      const requestId = response?.data?.data?.request_id;

      if (!sdkUrl || !requestId) {
        throw new Error(
          "DigiLocker SDK URL or request ID was not received.",
        );
      }

      const popup = window.open(
        sdkUrl,
        "Digilocker",
        "width=900,height=700,resizable=yes,scrollbars=yes",
      );

      if (!popup) {
        toast.error("Please allow popups for this website.");
        return;
      }

      let handled = false;

      const timer = window.setInterval(async () => {
        if (!popup.closed || handled) {
          return;
        }

        handled = true;

        window.clearInterval(timer);

        toast.info("Fetching DigiLocker documents...");

        await fetchDocuments(requestId);
      }, 1000);

      window.setTimeout(() => {
        window.clearInterval(timer);
      }, 10 * 60 * 1000);
    } catch (error) {
      console.error("DigiLocker initialization error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start DigiLocker.",
      );
    } finally {
      setDigilockerLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* DIGILOCKER — FETCH BOTH AADHAAR + PAN                                      */
  /* -------------------------------------------------------------------------- */

  const fetchDocuments = async (requestId) => {
    if (!requestId) {
      toast.error("DigiLocker request ID is missing.");
      return;
    }

    const merchantId = sessionStorage.getItem("merchant_onboarding_id");

    if (!merchantId) {
      toast.error("Merchant onboarding session expired.");
      return;
    }

    try {
      setFetchLoading(true);

      const response = await axios.post(
        `${BASE_URL}/digilocker/fetch-documents`,
        { request_id: requestId },
        {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
            Accept: "application/json",
          },
        },
      );

      const data = response?.data?.data;

      if (!data) {
        throw new Error("DigiLocker documents were not received.");
      }

      const aadhaarBlock = data?.aadhaar;
      const panBlock = data?.pan;

      if (!aadhaarBlock || !panBlock) {
        setDigilockerData(data);
        setDigilockerDone(false);

        toast.error(
          "Both Aadhaar and PAN must be fetched successfully. Please try again.",
        );

        return;
      }

      setDigilockerData(data);

      const aadhaarNumber =
        aadhaarBlock?.aadhaar_data?.uid || null;

      const panNumber =
        panBlock?.pancard_data?.pan_number || null;

      await linkDigilocker({
        merchant_onboarding_id: merchantId,
        digilocker_request_id: requestId,
        aadhaar_number: aadhaarNumber,
        pan_number: panNumber,
      });

      setDigilockerDone(true);

      updateOnboardingSession({
        digilocker_request_id: requestId,
        aadhaar_number: aadhaarNumber,
        pan_number: panNumber,
        digilocker_data: data,
      });

      toast.success("Aadhaar & PAN Verified Successfully");
    } catch (error) {
      console.error("DigiLocker document error:", error);

      setDigilockerDone(false);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch DigiLocker documents.",
      );
    } finally {
      setFetchLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* VIDEO KYC                                                                  */
  /* -------------------------------------------------------------------------- */

  const startVideoKyc = async () => {
    const merchantId = sessionStorage.getItem("merchant_onboarding_id");

    if (!merchantId) {
      toast.error("Merchant session expired.");
      return;
    }

    try {
      const userData = sessionStorage.getItem("user");
      let user = null;

      try {
        user = userData ? JSON.parse(userData) : null;
      } catch {
        user = null;
      }

      const response = await createVideoSession({
        user_id: user?.id,
        merchant_onboarding_id: merchantId,
      });

      if (response?.status !== "success") {
        throw new Error(
          response?.message || "Unable to create Video KYC session.",
        );
      }

      const session = response?.data;

      if (!session?.link) {
        throw new Error("Video KYC link was not received.");
      }

      setVideoSession({
        sessionId: session.session_id || "",
        link: session.link || "",
        purpose: session.purpose || "",
      });

      toast.success("Video KYC session created successfully.");

      const popup = window.open(
        session.link,
        "VideoKYC",
        "width=900,height=700,resizable=yes,scrollbars=yes",
      );

      if (!popup) {
        toast.error("Please allow popups for this website.");
        return;
      }

      let interval = null;
      let completed = false;
      let stopped = false;

      const pollingStartTimer = window.setTimeout(() => {
        if (stopped) return;

        interval = window.setInterval(async () => {
          if (stopped) return;

          try {
            const statusResponse = await axios.get(
              `${BASE_URL}/vkyc/${session.session_id}/status`,
              {
                headers: {
                  Authorization: `Bearer ${cookie.token}`,
                  Accept: "application/json",
                },
              },
            );

            const status = statusResponse?.data?.data?.session_status;

            if (status === "uploaded") {
              completed = true;
              stopped = true;

              if (interval) window.clearInterval(interval);

              if (!popup.closed) popup.close();

              await linkVkyc({
                merchant_onboarding_id: merchantId,
                video_session_id: session.session_id,
              });

              setVideoDone(true);

              updateOnboardingSession({
                video_session_id: session.session_id,
              });

              toast.success("Video KYC Completed Successfully");
            }
          } catch (error) {
            console.error("Video KYC status error:", error);
          }
        }, 2000);
      }, 30000);

      window.setTimeout(() => {
        stopped = true;

        window.clearTimeout(pollingStartTimer);

        if (interval) window.clearInterval(interval);

        if (!completed) {
          toast.info("Video KYC window closed before completion.");
        }
      }, 150000);
    } catch (error) {
      console.error("Video KYC error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start Video KYC.",
      );
    }
  };

  /* -------------------------------------------------------------------------- */
  /* BACK BUTTON                                                                */
  /* -------------------------------------------------------------------------- */

  const handleBackClick = () => {
    if (disableBack) return;
    setShowBackModal(true);
  };

  const handleBackConfirm = () => {
    setShowBackModal(false);

    if (typeof onBack === "function") {
      onBack();
      return;
    }

    window.history.back();
  };

  /* -------------------------------------------------------------------------- */
  /* STEP COMPLETENESS                                                          */
  /* -------------------------------------------------------------------------- */

  const isStepCompleted =
    videoDone && shopDone && digilockerDone && isDigilockerFullyFetched;

  /* -------------------------------------------------------------------------- */
  /* NEXT BUTTON — SAVE DATA + MOVE FORWARD                                     */
  /* -------------------------------------------------------------------------- */

  const handleNextClick = () => {
    if (!videoDone) {
      toast.error("Please complete Video KYC first.");
      return;
    }

    if (!shopDone) {
      toast.error("Please upload both shop photos.");
      return;
    }

    if (!digilockerDone || !isDigilockerFullyFetched) {
      toast.error(
        "Please complete DigiLocker verification for both Aadhaar and PAN.",
      );
      return;
    }

    const stepData = {
      video_session_id: videoSession.sessionId || null,
      video_done: true,
      shop_done: true,
      digilocker_done: true,
      digilocker_data: digilockerData || null,
      aadhaar_number:
        digilockerData?.aadhaar?.aadhaar_data?.uid || null,
      pan_number:
        digilockerData?.pan?.pancard_data?.pan_number || null,
    };

    const merged = updateOnboardingSession(stepData);

    if (typeof onNext === "function") {
      onNext(merged);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <>
      <h2 className="text-3xl font-bold text-slate-900">
        Identity Verification
      </h2>

      <p className="mt-2 mb-8 text-sm text-slate-500">
        Complete the following verification steps.
      </p>

      <div className="space-y-5">
        {/* VIDEO KYC */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#155DFC]/10">
              <Video size={22} className="text-[#155DFC]" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  Video KYC
                </h3>

                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  Secure
                </span>
              </div>

              {!videoDone ? (
                <>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Verify your identity through a secure live video call
                    to continue your onboarding process.
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
                </>
              ) : (
                <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Video KYC Completed Successfully
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SHOP VERIFICATION */}
        {videoDone &&
          (!shopDone ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#155DFC]/10">
                  <Store size={22} className="text-[#155DFC]" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Shop Verification
                    </h3>

                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Required
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Upload clear photos of your shop from the outside and
                    inside for verification.
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Shop Front Photo
                      </label>

                      <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-[#155DFC] hover:bg-blue-50">
                        <Store size={30} className="text-[#155DFC]" />

                        <span className="mt-3 text-sm font-medium text-slate-700">
                          {shopFront ? shopFront.name : "Click to upload"}
                        </span>

                        <span className="mt-1 text-xs text-slate-500">
                          JPG, PNG (Max 5MB)
                        </span>

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) setShopFront(file);
                          }}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Shop Inside Photo
                      </label>

                      <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-[#155DFC] hover:bg-blue-50">
                        <Store size={30} className="text-[#155DFC]" />

                        <span className="mt-3 text-sm font-medium text-slate-700">
                          {shopInside ? shopInside.name : "Click to upload"}
                        </span>

                        <span className="mt-1 text-xs text-slate-500">
                          JPG, PNG (Max 5MB)
                        </span>

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) setShopInside(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleShopUpload}
                    disabled={shopLoading}
                    className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-[#155DFC] text-sm font-medium text-white transition-all duration-200 hover:bg-[#0F4FD1] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {shopLoading ? "Uploading..." : "Upload Photos"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Store size={22} className="text-blue-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Shop Verification
                    </h3>

                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      Completed
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Shop Photos Uploaded Successfully
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* DIGILOCKER */}
        {videoDone &&
          shopDone &&
          (!digilockerDone ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#155DFC]/10">
                  <ShieldCheck size={22} className="text-[#155DFC]" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      DigiLocker Verification
                    </h3>

                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Required
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Securely fetch your Aadhaar and PAN details using
                    DigiLocker. Both Aadhaar and PAN are required to
                    complete this step.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-[#155DFC]" />
                      Government Verified
                    </div>

                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={15} className="text-green-600" />
                      100% Secure
                    </div>
                  </div>

                  {/* Partial fetch warning */}
                  {digilockerData &&
                    (!hasAadhaarData || !hasPanData) && (
                      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-xs font-medium text-amber-700">
                          Both Aadhaar and PAN must be fetched successfully.
                          {!hasAadhaarData && " Aadhaar is missing."}
                          {!hasPanData && " PAN is missing."}
                        </p>
                      </div>
                    )}

                  <button
                    type="button"
                    onClick={startDigilocker}
                    disabled={digilockerLoading || fetchLoading}
                    className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] text-sm font-medium text-white transition hover:bg-[#0F4FD1] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ShieldCheck size={18} />

                    {digilockerLoading
                      ? "Opening DigiLocker..."
                      : fetchLoading
                        ? "Fetching Documents..."
                        : "Connect DigiLocker"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <ShieldCheck size={22} className="text-blue-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      DigiLocker Verification
                    </h3>

                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      Completed
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Aadhaar & PAN Verified Successfully
                    </span>
                  </div>

                  {/* AADHAAR DATA */}
                  {digilockerData?.aadhaar && (
                    <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold text-blue-700">
                          Aadhaar Card
                        </h3>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs">
                          FETCHED
                        </span>
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row">
                        {digilockerData?.aadhaar?.aadhaar_data
                          ?.photo_base64 && (
                          <img
                            src={`data:image/jpeg;base64,${digilockerData.aadhaar.aadhaar_data.photo_base64}`}
                            alt="Aadhaar"
                            className="h-28 w-24 shrink-0 rounded-lg border object-cover shadow-sm"
                          />
                        )}

                        <div className="space-y-1 text-sm">
                          <p>
                            <b>Name:</b>{" "}
                            {digilockerData?.aadhaar?.aadhaar_data
                              ?.personal_info?.name || "-"}
                          </p>

                          <p>
                            <b>DOB:</b>{" "}
                            {digilockerData?.aadhaar?.aadhaar_data
                              ?.personal_info?.dob || "-"}
                          </p>

                          <p>
                            <b>Gender:</b>{" "}
                            {digilockerData?.aadhaar?.aadhaar_data
                              ?.personal_info?.gender || "-"}
                          </p>

                          <p>
                            <b>UID:</b>{" "}
                            {digilockerData?.aadhaar?.aadhaar_data?.uid ||
                              "-"}
                          </p>
                        </div>
                      </div>

                      {digilockerData?.aadhaar?.aadhaar_data?.address && (
                        <div className="mt-4 text-sm">
                          <b>Address:</b>

                          <p className="mt-1">
                            {
                              digilockerData.aadhaar.aadhaar_data.address
                                .house
                            }
                            ,{" "}
                            {digilockerData.aadhaar.aadhaar_data.address.loc}
                            ,{" "}
                            {digilockerData.aadhaar.aadhaar_data.address.dist}
                            ,{" "}
                            {
                              digilockerData.aadhaar.aadhaar_data.address
                                .state
                            }
                            ,{" "}
                            {digilockerData.aadhaar.aadhaar_data.address.pc}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PAN DATA */}
                  {digilockerData?.pan && (
                    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold text-green-700">
                          PAN Card
                        </h3>

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs">
                          FETCHED
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p>
                          <b>PAN Number:</b>{" "}
                          {digilockerData?.pan?.pancard_data?.pan_number ||
                            "-"}
                        </p>

                        <p>
                          <b>Holder Name:</b>{" "}
                          {digilockerData?.pan?.pancard_data?.holder_name ||
                            "-"}
                        </p>

                        <p>
                          <b>DOB:</b>{" "}
                          {digilockerData?.pan?.pancard_data?.holder_dob ||
                            "-"}
                        </p>

                        <p>
                          <b>Certificate Number:</b>{" "}
                          {digilockerData?.pan?.pancard_data
                            ?.certificate_number || "-"}
                        </p>

                        <p>
                          <b>Issuer:</b>{" "}
                          {digilockerData?.pan?.issuer || "-"}
                        </p>

                        <p>
                          <b>Document:</b>{" "}
                          {digilockerData?.pan?.document_name || "-"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

        {/* BOTTOM BUTTONS */}
        <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
          {/* BACK */}
          <button
            type="button"
            onClick={handleBackClick}
            disabled={disableBack}
            title={
              disableBack ? "Contact details step is already completed." : ""
            }
            className={`flex h-11 items-center justify-center gap-2 rounded-md border px-8 text-sm font-medium transition ${
              disableBack
                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ArrowLeft size={17} />
            Back
          </button>

          {/* NEXT */}
          <button
            type="button"
            disabled={!isStepCompleted}
            onClick={handleNextClick}
            title={
              !isStepCompleted
                ? "Complete all three steps (Video KYC, Shop, DigiLocker) to continue."
                : ""
            }
            className={`flex h-11 items-center justify-center gap-2 rounded-md px-8 text-sm font-medium text-white transition ${
              isStepCompleted
                ? "cursor-pointer bg-blue-600 hover:bg-blue-700"
                : "cursor-not-allowed bg-slate-300"
            }`}
          >
            Next
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* BACK CONFIRMATION MODAL */}
      {showBackModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#0757A6] px-5 py-3">
              <h3 className="text-base font-semibold text-white">
                Are you sure you want to go back?
              </h3>

              <button
                type="button"
                onClick={() => setShowBackModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 transition hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm leading-6 text-slate-600">
                If you go back then you may lose your unsaved changes in
                this step.
              </p>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBackModal(false)}
                  className="h-10 rounded-md bg-slate-500 px-6 text-sm font-medium text-white transition hover:bg-slate-600"
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={handleBackConfirm}
                  className="h-10 rounded-md bg-blue-600 px-6 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AadhaarForm;