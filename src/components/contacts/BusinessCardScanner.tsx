import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Camera, CameraOff, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BusinessCardScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: (data: ScanResult) => void;
}

interface ScanResult {
  fullName?: string;
  company?: string;
  position?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
}

export const BusinessCardScanner = ({ open, onOpenChange, onScanComplete }: BusinessCardScannerProps) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (open && !cameraActive) {
      startCamera();
    }
    return () => {
      if (cameraStream) {
        stopCamera();
      }
    };
  }, [open]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraSupported(false);
      toast.error("Camera access denied", {
        description: "Please allow camera access or upload an image instead.",
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) stopCamera();
    onOpenChange(open);
  };

  const captureImage = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        await processImage(imageData);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Error", { description: "Failed to capture image. Please try again." });
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        await processImage(imageData);
      };
      reader.onerror = () => {
        toast.error("Error", { description: "Failed to read file." });
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error", { description: "Failed to process image." });
      setIsProcessing(false);
    }
  };

  const processImage = async (imageData: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('scan-business-card', {
        body: { imageData }
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Scan Failed", {
          description: "Could not extract contact information. Please try again or enter details manually.",
        });
        setIsProcessing(false);
        return;
      }

      if (data?.error) {
        toast.error("Scan Failed", { description: data.error });
        setIsProcessing(false);
        return;
      }

      const result: ScanResult = {
        fullName: data.fullName || "",
        company: data.company || "",
        position: data.position || "",
        email: data.email || "",
        phone: data.phone || "",
        mobile: data.mobile || "",
        address: data.address || "",
      };

      onScanComplete(result);
      handleOpenChange(false);
      toast.success("Business Card Scanned", {
        description: "Contact information has been extracted successfully.",
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Scan Failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan Business Card</DialogTitle>
          <DialogDescription>
            Take a photo of a business card or upload an image to automatically extract contact information.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {cameraActive ? (
            <>
              <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-wrap gap-2 w-full justify-center">
                <Button onClick={captureImage} disabled={isProcessing} className="flex-grow sm:flex-grow-0">
                  {isProcessing ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Processing</>
                  ) : (
                    "Capture Image"
                  )}
                </Button>
                <Button variant="outline" onClick={stopCamera} className="flex-grow sm:flex-grow-0">
                  <CameraOff className="mr-2 h-4 w-4" />Stop Camera
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4 w-full py-6">
              {isCameraSupported && (
                <Button onClick={startCamera} className="w-full sm:w-auto">
                  <Camera className="mr-2 h-4 w-4" />Start Camera
                </Button>
              )}
              <div className="relative">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isProcessing}
                  />
                </Button>
              </div>
              {isProcessing && (
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />Processing image...
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
