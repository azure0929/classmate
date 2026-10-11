import type { MouseEventHandler, ReactNode } from "react";
import { Button as MantineButton, type ButtonProps as MantineButtonProps } from "@mantine/core";

type ButtonProps = Omit<MantineButtonProps, "variant" | "color" | "className"> & {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <MantineButton
      color="forest"
      variant={variant === "primary" ? "filled" : variant === "secondary" ? "light" : "subtle"}
      className={`button button--${variant} ${className}`}
      {...props}
    >
      {children}
    </MantineButton>
  );
}
