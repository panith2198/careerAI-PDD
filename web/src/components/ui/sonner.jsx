import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, InformationCircleIcon, Alert02Icon, MultiplicationSignCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 text-emerald-brand" />
        ),
        info: (
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4 text-cyan-brand" />
        ),
        warning: (
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4 text-violet-warning" />
        ),
        error: (
          <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2} className="size-4 text-rose-brand" />
        ),
        loading: (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 text-primary-bright animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--surface-3)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border-violet)",
          "--border-radius": "12px",
          "--success-bg": "var(--emerald-dim)",
          "--success-border": "rgba(16, 185, 129, 0.2)",
          "--success-text": "var(--emerald-brand)",
          "--error-bg": "var(--rose-dim)",
          "--error-border": "rgba(244, 63, 94, 0.2)",
          "--error-text": "var(--rose-brand)",
          "--warning-bg": "var(--violet-warning-dim)",
          "--warning-border": "var(--violet-warning-dim)",
          "--warning-text": "var(--violet-warning)",
          "--info-bg": "var(--cyan-dim)",
          "--info-border": "var(--cyan-border)",
          "--info-text": "var(--cyan-brand)",
        }
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-[var(--normal-bg)] group-[.toaster]:text-[var(--normal-text)] group-[.toaster]:border-[var(--normal-border)] group-[.toaster]:shadow-[0_8px_32px_rgba(109,40,217,0.15)] group-[.toaster]:backdrop-blur-md rounded-xl font-sans",
          description: "group-[.toast]:text-text-secondary text-xs",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
        },
      }}
      {...props} />
  );
}

export { Toaster }
