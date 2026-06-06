"use client";

import { useState, type InputHTMLAttributes } from "react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  containerClassName?: string;
  toggleClassName?: string;
  showText?: string;
  hideText?: string;
}

export default function PasswordInput({
  label,
  labelClassName = "block text-sm font-medium text-slate-700",
  containerClassName,
  className = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
  toggleClassName = "absolute inset-y-0 right-2 flex items-center rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-200",
  showText = "Show",
  hideText = "Hide",
  ...inputProps
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={containerClassName}>
      {label ? <label className={labelClassName}>{label}</label> : null}
      <div className="relative">
        <input
          {...inputProps}
          type={visible ? "text" : "password"}
          className={`${className} pr-24`}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className={toggleClassName}
          tabIndex={-1}
        >
          {visible ? hideText : showText}
        </button>
      </div>
    </div>
  );
}
