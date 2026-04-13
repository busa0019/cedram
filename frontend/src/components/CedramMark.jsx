function CedramMark({ className = "", light = true }) {
  const fill = light ? "#F5F7FF" : "#3E4A87";
  const cut = light ? "#3E4A87" : "#F5F7FF";

  return (
    <svg
      viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CEDRAM mark"
      role="img"
    >
      <g fill={fill}>
        <path d="M20 46 L46 20 H138 V42 H56 L42 58 V162 L56 178 H138 V200 H46 L20 174 Z" />
        <rect x="110" y="84" width="34" height="52" fill={cut} />

        <path
          fillRule="evenodd"
          d="M92 52 H142 L180 80 V140 L142 168 H92 Z
             M114 74 V146 H136 L158 130 V90 L136 74 Z"
        />
        <rect x="150" y="96" width="18" height="32" fill={cut} />
      </g>
    </svg>
  );
}

export default CedramMark;