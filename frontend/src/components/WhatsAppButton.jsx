"use client";

import Link from "next/link";

export default function WhatsAppButton() {
  return (
    <Link
      href="https://wa.me/919611925494?text=Hello%20I%20am%20interested%20in%20your%20project"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed left-5 bottom-20 lg:bottom-5 z-[9999]"
    >
      <div className="bg-green-500 hover:bg-green-600 rounded-full p-3 shadow-lg transition-all duration-300">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className="w-10 h-10"
        />
      </div>
    </Link>
  );
}