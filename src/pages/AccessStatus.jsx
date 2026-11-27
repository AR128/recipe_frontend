import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/useAuth";

const statusContent = {
  ACCOUNT_REMOVED: {
    title: "Your account was removed",
    description:
      "You no longer have access to Poodiest. You can ask the admin to review your request to rejoin.",
  },
  ACCESS_REQUEST_PENDING: {
    title: "Request under review",
    description:
      "Your request has been sent to the admin. You can check again after it has been reviewed.",
  },
  ACCESS_REQUEST_DENIED: {
    title: "Access was not approved",
    description:
      "Your request to rejoin was not approved. You may send another request for review.",
  },
};

export default function AccessStatus() {
  const { accessRestriction, requestAccess, refreshAccess, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const status =
    statusContent[accessRestriction] || statusContent.ACCOUNT_REMOVED;
  const canRequest = ["ACCOUNT_REMOVED", "ACCESS_REQUEST_DENIED"].includes(
    accessRestriction
  );

  const handleRequest = async () => {
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await requestAccess();
      setMessage("Your request has been sent. The admin will review it.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't send your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    setError("");
    setMessage("");
    try {
      const result = await refreshAccess();
      if (result.allowed) {
        window.location.assign("/");
        return;
      }

      const messages = {
        ACCESS_REQUEST_PENDING:
          "Your request is still under review. Please check again later.",
        ACCESS_REQUEST_DENIED:
          "Your request was reviewed and access was not approved. You can request access again below.",
        ACCOUNT_REMOVED:
          "Your account is still removed. You can request access again below.",
      };
      setMessage(
        messages[result.code] ||
          "We couldn't find an active sign-in session. Please sign in again."
      );
    } catch {
      setError("We couldn't check your access right now. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    window.location.assign("/get-started");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ed] px-5 py-12 text-[#20251e]">
      <section className="w-full max-w-lg rounded-3xl border border-[#e7e1d4] bg-white p-8 shadow-xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#907b52]">
          Poodiest account access
        </p>
        <h1 className="mt-4 font-serif text-3xl font-semibold">
          {status.title}
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#666a60]">
          {status.description}
        </p>

        {(message || error) && (
          <p
            role={error ? "alert" : "status"}
            className={`mt-5 rounded-xl border p-3 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {error || message}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {canRequest && (
            <button
              type="button"
              onClick={handleRequest}
              disabled={submitting}
              className="rounded-xl bg-[#263126] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#374638] disabled:opacity-60"
            >
              {submitting ? "Sending request..." : "Request to rejoin"}
            </button>
          )}
          {accessRestriction === "ACCESS_REQUEST_PENDING" && (
            <button
              type="button"
              onClick={handleCheck}
              disabled={checking}
              className="rounded-xl bg-[#263126] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#374638] disabled:opacity-60"
            >
              {checking ? "Checking access..." : "Check access status"}
            </button>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-[#ded9cd] px-5 py-3.5 text-sm font-semibold text-[#43483f] hover:bg-[#f8f6f1]"
          >
            Sign out
          </button>
          <Link
            to="/"
            className="text-center text-sm text-[#74776d] hover:text-[#263126]"
          >
            Return to home
          </Link>
        </div>
      </section>
    </main>
  );
}
