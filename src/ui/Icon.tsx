interface IconProps {
  name: string;
  fill?: boolean;
  size?: number;
  className?: string;
}

/** Material Symbols Outlined 图标包装 */
export function Icon({ name, fill, size, className }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined${fill ? " fill" : ""} ${className ?? ""}`}
      style={size ? { fontSize: `${size}px` } : undefined}
    >
      {name}
    </span>
  );
}
