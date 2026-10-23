import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { usePost } from "../../hooks/usePost";
import { Video, Store, ShieldCheck, CheckCircle } from "lucide-react";

const AadhaarForm = ({ onBack, onNext }) => {
  const [cookie] = useCookies(["token"]);
  const [videoDone, setVideoDone] = useState(false);
  const [shopDone, setShopDone] = useState(false);
  const [digilockerDone, setDigilockerDone] = useState(false);

  const [shopFront, setShopFront] = useState(null);
  const [shopInside, setShopInside] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleShopUpload = async () => {
    if (!shopFront || !shopInside) {
      toast.error("Please upload both shop photos.");
      return;
    }

    try {
      const merchantId = sessionStorage.getItem("merchant_onboarding_id");

      const formData = new FormData();

      formData.append("merchant_onboarding_id", merchantId);

      formData.append("shop_front_image", shopFront);

      formData.append("shop_inside_image", shopInside);

      const res = await saveShop(formData);

      if (res.status === "success") {
        setShopDone(true);

        toast.success("Shop Photos Uploaded Successfully");
      }
    } catch (err) {
      toast.error("Unable to upload shop photos.");
    }
  };

  //--------

  const { execute: saveShop } = usePost("/merchant-onboarding/save-shop");

  //--------

  const { execute: linkVkyc } = usePost("/merchant-onboarding/link-vkyc");

  const { execute: linkDigilocker } = usePost(
    "/merchant-onboarding/link-digilocker",
  );

  //digilocker state

  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const [digilockerData, setDigilockerData] = useState(null);

  const startDigilocker = async () => {
    try {
      setDigilockerLoading(true);

      const res = await axios.post(
        `${BASE_URL}/digilocker/init-aadhaar-pan`,
        {},
        {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
            Accept: "application/json",
          },
        },
      );

      const sdkUrl = res.data.data.sdk_url;
      const requestId = res.data.data.request_id;

      const popup = window.open(sdkUrl, "Digilocker", "width=900,height=700");

      if (!popup) {
        toast.error("Allow popup.");
        return;
      }

      const timer = setInterval(async () => {
        if (popup.closed) {
          clearInterval(timer);

          toast.info("Fetching DigiLocker documents...");

          await fetchDocuments(requestId);
        }
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to start Digilocker");
    } finally {
      setDigilockerLoading(false);
    }
  };

  const fetchDocuments = async (reqId) => {
    try {
      setFetchLoading(true);

      const res = await axios.post(
        `${BASE_URL}/digilocker/fetch-documents`,
        {
          request_id: reqId,
        },
        {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
            Accept: "application/json",
          },
        },
      );

      setDigilockerData(res.data.data);

      const merchantId = sessionStorage.getItem("merchant_onboarding_id");

      await linkDigilocker({
        merchant_onboarding_id: merchantId,

        digilocker_request_id: reqId,

        aadhaar_number: res.data.data.aadhaar?.aadhaar_data?.uid,

        pan_number: res.data.data.pan?.pancard_data?.pan_number,
      });

      setDigilockerDone(true);

      toast.success("Aadhaar & PAN Verified Successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to fetch documents");
    } finally {
      setFetchLoading(false);
    }
  };

  //

  const [videoSession, setVideoSession] = useState({
    sessionId: "",
    link: "",
    purpose: "",
  });

  const { execute: createVideoSession, loading: videoLoading } =
    usePost("/vkyc/session");

  const startVideoKyc = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));

      const merchantId = sessionStorage.getItem("merchant_onboarding_id");

      if (!merchantId) {
        toast.error("Merchant session expired.");
        return;
      }

      const res = await createVideoSession({
        user_id: user?.id,
        merchant_onboarding_id: merchantId,
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

      // window.open(session.link, "_blank", "noopener,noreferrer");
      const popup = window.open(
        session.link,
        "VideoKYC",
        "width=900,height=700,resizable=yes,scrollbars=yes",
      );

      if (!popup) {
        toast.error("Please allow popups for this site.");
        return;
      }

      let interval = null;
      let completed = false;

      // Wait 30 seconds before polling
      setTimeout(() => {
        interval = setInterval(async () => {
          try {
            const response = await axios.get(
              `${BASE_URL}/vkyc/${session.session_id}/status`,
              {
                headers: {
                  Authorization: `Bearer ${cookie.token}`,
                  Accept: "application/json",
                },
              },
            );

            if (response.data.data.session_status === "uploaded") {
              completed = true;

              clearInterval(interval);

              if (!popup.closed) {
                popup.close();
              }

              const merchantId = sessionStorage.getItem(
                "merchant_onboarding_id",
              );

              await linkVkyc({
                merchant_onboarding_id: merchantId,
                video_session_id: session.session_id,
              });

              setVideoDone(true);

              toast.success("Video KYC Completed Successfully");

              return;
            }
          } catch (err) {
            console.log("AXIOS ERROR:", err);

            if (err.response) {
              console.log("STATUS:", err.response.status);
              console.log("DATA:", err.response.data);
            } else {
              console.log("MESSAGE:", err.message);
            }
          }
        }, 2000);
      }, 30000);

      // Stop polling after 150 seconds if still not uploaded
      setTimeout(() => {
        clearInterval(interval);

        if (!completed) {
          toast.info("Video KYC window closed before completion.");
        }
      }, 150000);
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

              {!videoDone ? (
                <>
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

        {/* Shop Photos */}
        {videoDone &&
          (!shopDone ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#155DFC]/10">
                  <Store size={22} className="text-[#155DFC]" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Shop Verification
                    </h3>

                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Required
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Upload clear photos of your shop from the outside and inside
                    for verification.
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Shop Front */}
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
                          onChange={(e) => setShopFront(e.target.files[0])}
                        />
                      </label>
                    </div>

                    {/* Shop Inside */}
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
                          onChange={(e) => setShopInside(e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleShopUpload}
                    className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-[#155DFC] text-sm font-medium text-white transition-all duration-200 hover:bg-[#0F4FD1]"
                  >
                    Upload Photos
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Store size={22} className="text-blue-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Shop Verification</h3>

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

        {/* Digilocker */}

        {videoDone &&
          shopDone &&
          (!digilockerDone ? (
            // ================= DIGILOCKER UI =================

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#155DFC]/10">
                  <ShieldCheck size={22} className="text-[#155DFC]" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      DigiLocker Verification
                    </h3>

                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Required
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Securely fetch your Aadhaar and PAN details using
                    DigiLocker. This verification is government approved and
                    completely secure.
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

                  <button
                    onClick={startDigilocker}
                    disabled={digilockerLoading || fetchLoading}
                    className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] text-sm font-medium text-white transition hover:bg-[#0F4FD1] disabled:opacity-60"
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
            // ================= SUCCESS UI =================

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <ShieldCheck size={22} className="text-blue-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
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
                  <div className="mt-6 space-y-6">
                    {digilockerData?.aadhaar && (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
                        <div className="flex justify-between mb-4">
                          <h3 className="font-bold text-blue-700">
                            Aadhaar Card
                          </h3>

                          <span className="text-xs bg-blue-100 px-3 py-1 rounded-full">
                            FETCHED
                          </span>
                        </div>

                        <div className="flex gap-4">
                          <img
                            src={`data:image/jpeg;base64,${digilockerData.aadhaar.aadhaar_data.photo_base64}`}
                            className="w-24 h-28 rounded-lg border shadow-sm object-cover flex-shrink-0"
                          />

                          <div className="space-y-1 text-sm">
                            <p>
                              <b>Name:</b>{" "}
                              {
                                digilockerData.aadhaar.aadhaar_data
                                  .personal_info.name
                              }
                            </p>

                            <p>
                              <b>DOB:</b>{" "}
                              {
                                digilockerData.aadhaar.aadhaar_data
                                  .personal_info.dob
                              }
                            </p>

                            <p>
                              <b>Gender:</b>{" "}
                              {
                                digilockerData.aadhaar.aadhaar_data
                                  .personal_info.gender
                              }
                            </p>

                            <p>
                              <b>UID:</b>{" "}
                              {digilockerData.aadhaar.aadhaar_data.uid}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 text-sm">
                          <b>Address:</b>

                          <p className="mt-1">
                            {digilockerData.aadhaar.aadhaar_data.address.house},
                            {digilockerData.aadhaar.aadhaar_data.address.loc},
                            {digilockerData.aadhaar.aadhaar_data.address.dist},
                            {digilockerData.aadhaar.aadhaar_data.address.state},
                            {digilockerData.aadhaar.aadhaar_data.address.pc}
                          </p>
                        </div>
                      </div>
                    )}
                    {digilockerData?.pan && (
                      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                        <div className="flex justify-between mb-4">
                          <h3 className="font-bold text-green-700">PAN Card</h3>

                          <span className="text-xs bg-green-100 px-3 py-1 rounded-full">
                            FETCHED
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <p>
                            <b>PAN Number:</b>{" "}
                            {digilockerData.pan.pancard_data.pan_number}
                          </p>

                          <p>
                            <b>Holder Name:</b>{" "}
                            {digilockerData.pan.pancard_data.holder_name}
                          </p>

                          <p>
                            <b>DOB:</b>{" "}
                            {digilockerData.pan.pancard_data.holder_dob}
                          </p>

                          <p>
                            <b>Certificate Number:</b>{" "}
                            {digilockerData.pan.pancard_data.certificate_number}
                          </p>

                          <p>
                            <b>Issuer:</b> {digilockerData.pan.issuer}
                          </p>

                          <p>
                            <b>Document:</b> {digilockerData.pan.document_name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* Buttons */}

        <div className="flex justify-end pt-3">
          <button
            disabled={!(videoDone && shopDone && digilockerDone)}
            onClick={onNext}
            className={`h-11 px-8 rounded-md text-white transition
            ${
              videoDone && shopDone && digilockerDone
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
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
