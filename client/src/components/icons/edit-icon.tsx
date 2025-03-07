
import React from "react";

export function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 21h18v-2H3v2zm5.44-10.506l.413-1.636 1.636.414 7.587-7.587a1.154 1.154 0 0 0-1.636-1.636L8.857 7.632l.413 1.636-1.636.413-2.887-2.886L3 14.269l2.887 2.887 2.553-6.662z" />
    </svg>
  );
}
