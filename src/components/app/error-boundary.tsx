"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | undefined;
};

function DefaultErrorFallback({ onReset }: { onReset: () => void }) {
  const t = useTranslations("errorBoundary");
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-8 text-center">
      <Typography variant="subtitle1" as="p" className="text-foreground">
        {t("title")}
      </Typography>
      <Typography variant="body2" as="p" className="text-muted-foreground">
        {t("description")}
      </Typography>
      <Button variant="outline" size="sm" onClick={onReset}>
        {t("refresh")}
      </Button>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <DefaultErrorFallback
          onReset={() => {
            this.setState({ hasError: false, error: undefined });
            window.location.reload();
          }}
        />
      );
    }

    return this.props.children;
  }
}
