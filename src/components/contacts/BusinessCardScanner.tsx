
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Camera, CameraOff, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  // Start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setCameraStream(stream);
      setCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraSupported(false);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access or upload an image instead.",
        variant: "destructive"
      });
    }
  };
  
  // Stop the camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };
  
  // Cleanup on dialog close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      stopCamera();
    }
    onOpenChange(open);
  };
  
  // Capture image from camera
  const captureImage = async () => {
    const videoElement = document.getElementById('camera-feed') as HTMLVideoElement;
    if (!videoElement) return;
    
    setIsProcessing(true);
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Get image data as base64
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Process the image data (here we would call an OCR API)
        await processImage(imageData);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast({
        title: "Error",
        description: "Failed to capture image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle file upload
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
        throw new Error("Failed to read file");
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Process image data (mock implementation - in a real app, this would call an OCR API)
  const processImage = async (imageData: string) => {
    // In a real implementation, we would send the image to an OCR API like Google Cloud Vision,
    // Azure Computer Vision, or similar services to extract text and identify business card fields
    
    // For now, we'll simulate a successful scan with mock data
    setTimeout(() => {
      const mockResult: ScanResult = {
        fullName: "John Smith",
        company: "Acme Corporation",
        position: "Sales Manager",
        email: "john.smith@acmecorp.com",
        phone: "+1 555-123-4567",
        mobile: "+1 555-987-6543",
        address: "123 Business Ave, Suite 101, New York, NY 10001"
      };
      
      onScanComplete(mockResult);
      handleOpenChange(false);
      
      toast({
        title: "Business Card Scanned",
        description: "Contact information has been extracted successfully.",
      });
    }, 1500);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
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
                <video 
                  id="camera-feed" 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={captureImage}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Capture Image"
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={stopCamera}
                >
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop Camera
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4 w-full py-6">
              {isCameraSupported && (
                <Button onClick={startCamera} className="w-full sm:w-auto">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              )}
              
              <div className="relative">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
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
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing image...
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
