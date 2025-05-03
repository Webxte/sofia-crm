
import { Helmet } from "react-helmet-async";
import { CreateOrganizationForm } from "@/components/organizations/CreateOrganizationForm";

const NewOrganization = () => {
  return (
    <>
      <Helmet>
        <title>New Organization | CRM</title>
      </Helmet>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Organization</h1>
        <CreateOrganizationForm />
      </div>
    </>
  );
};

export default NewOrganization;
