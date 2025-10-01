import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CallToAction = ({ finalMessage, switchNumber }) => {
  const [time, setTime] = useState(180);

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

  // ✅ Fire raTag + fallback pixels and log in console
  const fireTracking = (context = {}) => {
    try {
      const ts = new Date().toLocaleTimeString();
      let anyFired = false;

      // raTag
      if (typeof window !== "undefined" && typeof window.raTag === "function") {
        try {
          window.raTag("event", "call_click", context);
          anyFired = true;
        } catch {}
        try {
          window.raTag("call_click", context);
          anyFired = true;
        } catch {}
      }

      // nbpix
      if (typeof window !== "undefined" && typeof window.nbpix === "function") {
        try {
          window.nbpix("event", "raw_call", context);
          anyFired = true;
        } catch {}
      }

      // gtag
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        try {
          window.gtag("event", "call_click", context);
          anyFired = true;
        } catch {}
      }

      // dataLayer
      if (typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
        try {
          window.dataLayer.push({ event: "call_click", ...context });
          anyFired = true;
        } catch {}
      }

      // Console feedback
      if (anyFired) {
        console.log(`[Pixel Fired ✅] raTag/nbpix/gtag call_click @ ${ts}`, context);
      } else {
        console.log(`[Pixel Missing ⚠️] No pixel function found, simulated send @ ${ts}`, context);
      }
    } catch (e) {
      console.error("[Pixel Error ❌]", e);
    }
  };

  const hrefNumber = switchNumber ? "tel:+13236897861" : "tel:+18336638513";
  const labelNumber = switchNumber ? "CALL (323)-689-7861" : "CALL (833)-366-8513";

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

      <motion.a
        href={hrefNumber}
        className="mt-4 bg-green-500 text-white text-lg font-bold py-3 px-6 rounded-md w-full max-w-md text-center transition hover:bg-green-600 relative"
        style={{ height: "120%", fontSize: "140%" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onPointerDown={() =>
          fireTracking({
            source: "cta_button",
            number_label: labelNumber,
            number_href: hrefNumber,
            switchNumber,
          })
        }
      >
        {labelNumber}
      </motion.a>

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
        className="mt-2 text-red-500 font-bold text-lg"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        {formatTime(time)}
      </motion.p>
    </motion.div>
  );
};

export default CallToAction;
