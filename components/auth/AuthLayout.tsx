"use client";

import React from "react";
import AuthHeader from "./AuthHeader";
import AuthVisual from "./AuthVisual";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Visual Section: Top on mobile (takes 360px minimum height), Right (55% width) on desktop */}
      <div className="w-full lg:w-[55%] lg:order-2 h-[360px] lg:h-screen">
        <AuthVisual />
      </div>

      {/* Form Section: Bottom on mobile, Left (45% width) on desktop */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-6 md:p-12 lg:p-16 lg:order-1 min-h-[500px] lg:min-h-screen">
        {/* Header */}
        <div className="mb-8 lg:mb-0">
          <AuthHeader />
        </div>

        {/* Form Container with fade-in animation */}
        <div className="my-auto py-8 max-w-md w-full mx-auto animate-fade-in-up">
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">
              {title}
            </h2>
            <p className="text-sm text-neutral-500">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Footer copyright */}
        <div className="text-xs text-neutral-400 mt-8 lg:mt-0 text-center lg:text-left">
          © {new Date().getFullYear()} SuaraMoklet. All rights reserved.
        </div>
      </div>
    </div>
  );
}
