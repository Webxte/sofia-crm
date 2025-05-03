
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Contact } from '@/types';

interface ContactActionsProps {
  contact: Contact;
  onDelete: () => void;
  onEmail: () => void;
}

export const ContactActions = ({ contact, onDelete, onEmail }: ContactActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/contacts')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEmail}
        >
          <Mail className="h-4 w-4 mr-1" />
          Email
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/contacts/${contact.id}/edit`)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};
