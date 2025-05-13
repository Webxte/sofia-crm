
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const OrganizationMembers = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Organization Members</CardTitle>
        <CardDescription>
          Manage organization members and their roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Member management content will go here */}
        <p>Organization members management functionality is under development.</p>
      </CardContent>
    </Card>
  );
};

// Adding a default export to fix the import issue
export default OrganizationMembers;
