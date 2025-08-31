
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useContacts } from '@/context/contacts/ContactsContext';

export const ContactNotFound = () => {
  const navigate = useNavigate();
  const { refreshContacts } = useContacts();
  
  const handleRefresh = async () => {
    await refreshContacts();
    navigate('/contacts');
  };
  
  return (
    <div className="p-6 space-y-4">
      <Alert variant="destructive">
        <AlertTitle>Contact not found</AlertTitle>
        <AlertDescription>
          The contact you're looking for doesn't exist or you don't have permission to view it.
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/contacts')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contacts
        </Button>
        
        <Button onClick={handleRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Contacts
        </Button>
      </div>
    </div>
  );
};
