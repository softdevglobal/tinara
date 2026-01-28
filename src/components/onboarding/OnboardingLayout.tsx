import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingProgress } from "./OnboardingProgress";

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showProgress?: boolean;
}

export function OnboardingLayout({
  children,
  title,
  description,
  showProgress = true,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {showProgress && <OnboardingProgress />}
        
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">{title}</CardTitle>
            {description && (
              <CardDescription className="text-base">
                {description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-4">{children}</CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Need help? Contact your account administrator or{" "}
          <a href="mailto:support@bmspro.blue" className="text-primary hover:underline">
            support@bmspro.blue
          </a>
        </p>
      </div>
    </div>
  );
}
