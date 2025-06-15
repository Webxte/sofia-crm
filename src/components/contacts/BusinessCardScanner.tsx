import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Camera, CameraOff, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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
  
  // Start the camera when the dialog opens
  useEffect(() => {
    if (open && !cameraActive) {
      startCamera();
    }
    
    // Cleanup when component unmounts or dialog closes
    return () => {
      if (cameraStream) {
        stopCamera();
      }
    };
  }, [open]);
  
  // Start the camera
  const startCamera = async () => {
    try {
      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setCameraStream(stream);
      setCameraActive(true);
      
      // Connect the camera stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.error("Error playing video:", err);
          });
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
    if (!videoRef.current) return;
    
    setIsProcessing(true);
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Get image data as base64
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Process the image data
        await processImage(imageData);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Error", {
        description: "Failed to capture image. Please try again.",
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
      toast.error("Error", {
        description: "Failed to process image. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Process image data (mock implementation)
  const processImage = async (imageData: string) => {
    console.log("Processing image...");
    
    // For now, simulate a successful scan with mock data
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
      
      // Apply the scan result and close the scanner dialog
      onScanComplete(mockResult);
      handleOpenChange(false);
      
      toast.success("Business Card Scanned", {
        description: "Contact information has been extracted successfully.",
      });
    }, 1500);
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
                <video 
                  ref={videoRef}
                  id="camera-feed" 
                  autoPlay 
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 w-full justify-center">
                <Button
                  onClick={captureImage}
                  disabled={isProcessing}
                  className="flex-grow sm:flex-grow-0"
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
                  className="flex-grow sm:flex-grow-0"
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
