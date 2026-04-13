function CedramWordmark({ className = "", light = true }) {
  const fill = light ? "#F5F7FF" : "#3E4A87";
  const cut = light ? "#3E4A87" : "#F5F7FF";

  return (
    <svg
      viewBox="0 0 1580 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CEDRAM"
      role="img"
    >
      <g fill={fill}>
        <path d="M0 54 L54 0 H194 V38 H74 L38 74 V186 L74 222 H194 V260 H54 L0 206 Z" />
        <rect x="146" y="98" width="48" height="56" fill={cut} />

        <path d="M240 0 H424 V38 H280 V104 H392 V142 H280 V222 H424 V260 H240 Z" />
        <rect x="332" y="94" width="60" height="24" fill={cut} />
        <rect x="332" y="142" width="52" height="20" fill={cut} />

        <path
          fillRule="evenodd"
          d="M470 0 H608 L692 58 V202 L608 260 H470 Z
             M510 38 V222 H592 L652 180 V80 L592 38 Z"
        />
        <rect x="636" y="106" width="36" height="48" fill={cut} />

        <path
          fillRule="evenodd"
          d="M740 0 H886 L942 50 V118 L900 154 L962 260 H914 L856 176 H780 V260 H740 Z
             M780 38 V136 H872 L904 108 V68 L874 38 Z"
        />
        <rect x="880" y="136" width="34" height="32" fill={cut} />

        <path
          fillRule="evenodd"
          d="M992 260 L1108 0 H1164 L1280 260 H1236 L1208 202 H1064 L1038 260 Z
             M1082 166 H1190 L1136 48 Z"
        />
        <rect x="1112" y="166" width="48" height="36" fill={cut} />

        <path d="M1330 260 V0 H1376 L1456 90 L1536 0 H1580 V260 H1540 V66 L1456 154 L1370 66 V260 Z" />
        <rect x="1448" y="0" width="16" height="38" fill={cut} />
      </g>
    </svg>
  );
}

export default CedramWordmark;