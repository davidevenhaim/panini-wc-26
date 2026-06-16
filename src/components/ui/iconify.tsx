import { Icon, type IconProps } from "@iconify/react";
import { cn } from "@/lib/utils";
import { shouldFlipRtlIcon } from "@/utils/rtl-icon";

export type IconifyColor =
  | "foreground"
  | "error"
  | "warning"
  | "primary"
  | "secondary"
  | "white"
  | "black";

export type IconifyProps = {
  icon: string;
  className?: string;
  /**
   * Mirror the icon horizontally in RTL (`dir="rtl"`).
   * Defaults to auto for known directional icons (arrows, chevrons, log-in/out, etc.).
   */
  flipRtl?: boolean;
  /**
   * When omitted, the icon uses `text-inherit` so it follows the parent `color`
   * (e.g. `text-primary-foreground` on a solid primary `Button`).
   * Use `foreground` for theme body text on neutral surfaces.
   */
  color?: IconifyColor;
} & Omit<IconProps, "icon">;

const colorClasses: Record<IconifyColor, string> = {
  foreground: "text-foreground",
  error: "text-red-500",
  warning: "text-orange-500",
  primary: "text-primary",
  secondary: "text-secondary",
  white: "text-white",
  black: "text-black",
};

export default function Iconify({ icon, className, color, flipRtl, ...props }: IconifyProps) {
  const mirrorRtl = flipRtl ?? shouldFlipRtlIcon(icon);

  return (
    <Icon
      {...props}
      icon={icon}
      className={cn(
        color ? colorClasses[color] : "text-inherit",
        mirrorRtl && "rtl:scale-x-[-1]",
        className
      )}
    />
  );
}
