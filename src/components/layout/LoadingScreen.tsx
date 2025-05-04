
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message: string;
  description?: string;
}

export const LoadingScreen = ({ message, description }: LoadingScreenProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">{message}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
};
