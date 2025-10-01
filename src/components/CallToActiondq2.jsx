import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CallToAction = ({ finalMessage, switchNumber }) => {
  const [time, setTime] = useState(180);

  // 🔎 Verification state for raTag / pixels
  const [sendStatus, setSendStatus] = useState("idle"); // "idle" | "sent" | "error"
  const [firedAt, setFiredAt] = useState(null);         // timestamp string for UI
  const [badgeVisible, setBadgeVisible] = useState(false);

  useEffect(() => {
    if (!finalMessage || time <= 0) return;
    const timer = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [finalMessage, time]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ✅ Fire raTag/nbpix/gtag/dataLayer safely on pointerdown (before tel: navigation)
  const fireTracking = (context = {}) => {
    try {
      const now = new Date();
      const ts = now.toLocaleTimeString();
      let anyFired = false;

      // 1) raTag (your requested pixel)
      if (typeof window !== "undefined" && typeof window.raTag === "function") {
        // Two common calling styles; try both
        try {
          window.raTag("event", "call_click", context);
          anyFired = true;
        } catch {}
        try {
          window.raTag("call_click", context);
          anyFired = true;
        } catch {}
      }

      // 2) nbpix (if present)
      if (typeof window !== "undefined" && typeof window.nbpix === "function") {
        try {
          window.nbpix("event", "raw_call", context);
          anyFired = true;
        } catch {}
      }

      // 3) gtag fallback
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        try {
          window.gtag("event", "call_click", context);
          anyFired = true;
        } catch {}
      }

      // 4) dataLayer fallback
      if (typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
        try {
          window.dataLayer.push({ event: "call_click", ...context });
          anyFired = true;
        } catch {}
      }

      // 5) Console fallback so you can still confirm in DevTools
      if (!anyFired) {
        // Still show success UI so you can verify clicks visually
        // and check DevTools console output.
        // If you prefer this to show "error" instead, flip the branch below.
        // (Keeping "sent" makes manual testing easier.)
        console.log("[raTag debug] call_click", context);
      }

      setSendStatus("sent");
      setFiredAt(ts);
      setBadgeVisible(true);
      // Auto-hide the chip after a few seconds
      setTimeout(() => setBadgeVisible(false), 3500);
    } catch (e) {
      console.error("Pixel error:", e);
      setSendStatus("error");
      setFiredAt(new Date().toLocaleTimeString());
      setBadgeVisible(true);
      setTimeout(() => setBadgeVisible(false), 4500);
    }
  };

  // Numbers
  const hrefNumber = switchNumber ? "tel:+13236897861" : "tel:+18336638513";
  const labelNumber = switchNumber ? "CALL (323)-689-7861" : "CALL (833)-366-8513";

  // Dynamic styles for verification chip + button border
  const chipClasses =
    sendStatus === "sent"
      ? "bg-green-600 text-white"
      : sendStatus === "error"
      ? "bg-red-600 text-white"
      : "bg-gray-300 text-gray-800";

  const buttonOutline =
    sendStatus === "sent"
      ? "ring-4 ring-green-300"
      : sendStatus === "error"
      ? "ring-4 ring-red-300"
      : "ring-0";

  return (
    <motion.div
      className="flex flex-col items-center pt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="bg-green-100 text-green-700 text-center p-3 rounded-md w-full max-w-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <p className="font-semibold">
          Tap on the button below to make a quick call & that&apos;s it. You&apos;ll be
          qualified on the call by a licensed agent in minutes 👇
        </p>
      </motion.div>

   

      <motion.p
        className="mt-4 text-gray-600 text-center text-sm w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Due to high call volume, your official agent is waiting for only{" "}
        <span className="font-bold">3 minutes</span>, then your spot will not be
        reserved.
      </motion.p>

      <motion.p
        className="mt-2 font-bold text-lg"
        style={{
          color:
            sendStatus === "sent"
              ? "#16a34a" // green when event fired
              : sendStatus === "error"
              ? "#dc2626" // red on error
              : "#ef4444", // default red pulse
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        {formatTime(time)}
      </motion.p>
    </motion.div>
  );
};

export default CallToAction;
