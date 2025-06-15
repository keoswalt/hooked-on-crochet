
import * as React from "react";

export const BallOfYarnIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    {...props}
  >
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path d="M4 19c2-2.5 6-6 12-6m4 6C18.5 17 14 13.5 6 13" strokeWidth="2"/>
    <path d="M4 15c1.5-1 5-3 8-3s6.5 2 8 3" strokeWidth="1"/>
    <path d="M12 8c0 2-2 4-4 4" strokeWidth="1"/>
    <path d="M16 8c0 2 2 4 4 4" strokeWidth="1"/>
  </svg>
);

export default BallOfYarnIcon;
