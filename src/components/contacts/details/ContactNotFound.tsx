
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ContactNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Contact not found</h1>
      <Button variant="outline" onClick={() => navigate('/contacts')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Contacts
      </Button>
    </div>
  );
};
