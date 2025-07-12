import type { SVGProps } from 'react';

export function GateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 20V6" />
      <path d="M6 20V6" />
      <path d="M18 12H6" />
      <path d="M12 12V6" />
      <path d="M12 20V12" />
      <path d="M12 6H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h9" />
      <path d="M12 6h9a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-9" />
    </svg>
  );
}
