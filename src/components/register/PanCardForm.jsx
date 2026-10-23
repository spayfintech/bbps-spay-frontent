import { useState } from "react";
import { usePost } from "../../hooks/usePost";

import {
  FileText,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";

const PanCardForm = ({ onBack, onSubmit }) => {
  const [agreement, setAgreement] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [declaration, setDeclaration] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  //--------

  const { execute: submitMerchant } = usePost("/merchant-onboarding/submit");

  //--------

  const handleSubmit = async () => {
    if (!agreement || !privacy || !declaration) {
      toast.error("Please accept all declarations to continue.");
      return;
    }

    try {
      const merchantId = sessionStorage.getItem("merchant_onboarding_id");

      if (!merchantId) {
        toast.error("session expired.");
        return;
      }

      const res = await submitMerchant({
        merchant_onboarding_id: merchantId,
        agreement,
      });

      if (res?.status === "success" || res?.success) {
        sessionStorage.removeItem("merchant_onboarding_id");

        setShowSuccessModal(true);
      } else {
        toast.error(res?.message || "Unable to submit registration.");
      }
    } catch (err) {
      toast.error("Unable to submit registration.");
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-slate-900">Merchant Agreement</h2>

      <p className="mt-2 mb-8 text-sm text-slate-500">
        Please review and accept the merchant agreement before completing your
        onboarding process.
      </p>

      <div className="space-y-6">
        {/* Agreement Card */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#155DFC]/10">
              <FileText size={22} className="text-[#155DFC]" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">
                Merchant Terms & Conditions
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                By accepting this agreement, you confirm that all information
                submitted during onboarding is true and accurate. You authorize
                Spay Fintech to verify your identity, business details, Aadhaar,
                PAN, bank account, and related KYC information whenever
                required.
              </p>

              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-7 text-slate-700 border border-slate-200">
                <strong>हिंदी:</strong> इस एग्रीमेंट को स्वीकार करके आप पुष्टि
                करते हैं कि ऑनबोर्डिंग के दौरान दी गई सभी जानकारी सही और सत्य
                है। आप Spay Fintech को आपकी पहचान, व्यवसाय, आधार, पैन, बैंक खाता
                तथा अन्य KYC विवरणों का सत्यापन करने की अनुमति देते हैं।
              </p>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={20} className="mt-0.5 text-[#155DFC]" />

                  <div>
                    <p className="font-medium text-slate-800">
                      Important Information
                    </p>

                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-600">
                      <li>
                        Merchant information must always remain accurate and
                        also up-to-date.
                        <br />
                        <span className="text-slate-500">
                          जानकारी हमेशा सही और अपडेट रहनी चाहिए।
                        </span>
                      </li>

                      <li>
                        Spay may suspend services if incorrect information is
                        provided.
                        <br />
                        <span className="text-slate-500">
                          गलत जानकारी मिलने पर सेवाएं अस्थायी रूप से बंद की जा
                          सकती हैं।
                        </span>
                      </li>

                      <li>
                        All transactions are subject to regulatory compliance.
                        <br />
                        <span className="text-slate-500">
                          सभी लेन-देन नियामकीय नियमों के अधीन होंगे।
                        </span>
                      </li>

                      <li>
                        Merchant agrees to comply with applicable RBI & NPCI
                        guidelines.
                        <br />
                        <span className="text-slate-500">
                          व्यापारी RBI एवं NPCI के लागू नियमों का पालन करेगा।
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Declaration */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <AlertTriangle className="text-amber-500" size={22} />

            <h3 className="text-lg font-semibold text-slate-900">
              Declaration
            </h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
                className="mt-1 accent-[#155DFC]"
              />

              <span className="text-sm text-slate-600 leading-6">
                I have read and agree to the Merchant Terms & Conditions.
                <br />
                <span className="text-slate-500">
                  मैंने Merchant Terms & Conditions पढ़ लिए हैं और उनसे सहमत
                  हूँ।
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
                className="mt-1 accent-[#155DFC]"
              />

              <span className="text-sm text-slate-600 leading-6">
                I agree to the Privacy Policy and consent to the processing of
                my information for merchant verification.
                <br />
                <span className="text-slate-500">
                  मैं Privacy Policy से सहमत हूँ तथा Merchant Verification के
                  लिए अपनी जानकारी उपयोग करने की अनुमति देता/देती हूँ।
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={declaration}
                onChange={(e) => setDeclaration(e.target.checked)}
                className="mt-1 accent-[#155DFC]"
              />

              <span className="text-sm text-slate-600 leading-6">
                I declare that all information and documents submitted during
                onboarding are genuine, accurate, and belong to me/my business.
                <br />
                <span className="text-slate-500">
                  मैं घोषणा करता/करती हूँ कि ऑनबोर्डिंग के दौरान जमा किए गए सभी
                  दस्तावेज़ और जानकारी सही, वास्तविक और मेरे/मेरे व्यवसाय से
                  संबंधित हैं।
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Summary */}

        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 text-green-600" size={22} />

            <div>
              <h3 className="font-semibold text-green-700">
                Ready to Complete Registration
              </h3>

              <p className="mt-2 text-sm leading-6 text-green-700/90">
                Your account setup, personal details, Video KYC, shop
                verification, and DigiLocker verification have been completed
                successfully. Accept the declarations above to finish merchant
                onboarding.
              </p>
            </div>
          </div>
        </div>

        {/* Button */}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex h-11 items-center justify-center rounded-xl bg-green-600 px-8 text-sm font-medium text-white transition hover:bg-green-700 cursor-pointer"
          >
            Complete Registration
          </button>
        </div>
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={34} className="text-green-600" />
              </div>
            </div>

            <h2 className="mt-5 text-center text-2xl font-bold text-slate-900">
              Registration Submitted
            </h2>

            <p className="mt-4 text-center text-sm leading-7 text-slate-600">
              Your merchant registration has been submitted successfully.
            </p>

            <p className="text-center text-sm leading-7 text-slate-500">
              Our verification team will review your application.
            </p>

            <p className="mt-3 text-center text-sm leading-7 text-slate-500">
              📧 Once your account is verified, you will receive a confirmation
              email on your registered email address.
            </p>

            <p className="mt-3 text-center text-sm leading-7 text-slate-500">
              🔑 You can log in anytime using the email and password as a mobile
              number you used during registration to check your onboarding
              status on the dashboard.
            </p>

            <button
              onClick={() => {
                sessionStorage.removeItem("merchant_onboarding_id");
                window.location.href = "https://services.spay.live/";
              }}
              className="mt-8 h-11 w-full rounded-xl bg-[#155DFC] text-white font-medium transition hover:bg-blue-700 cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PanCardForm;
