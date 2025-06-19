
import React from 'react';

// Lazy load main pages for better performance
export const Dashboard = React.lazy(() => import('../../pages/Dashboard'));
export const Contacts = React.lazy(() => import('../../pages/Contacts'));
export const ContactDetails = React.lazy(() => import('../../pages/ContactDetails'));
export const EditContact = React.lazy(() => import('../../pages/contacts/EditContact'));
export const NewContact = React.lazy(() => import('../../pages/contacts/NewContact'));
export const Meetings = React.lazy(() => import('../../pages/Meetings'));
export const MeetingDetails = React.lazy(() => import('../../pages/MeetingDetails'));
export const EditMeeting = React.lazy(() => import('../../pages/meetings/EditMeeting'));
export const NewMeeting = React.lazy(() => import('../../pages/meetings/NewMeeting'));
export const Tasks = React.lazy(() => import('../../pages/Tasks'));
export const TaskDetails = React.lazy(() => import('../../pages/TaskDetails'));
export const EditTask = React.lazy(() => import('../../pages/tasks/EditTask'));
export const NewTask = React.lazy(() => import('../../pages/tasks/NewTask'));
export const Orders = React.lazy(() => import('../../pages/Orders'));
export const OrderDetails = React.lazy(() => import('../../pages/orders/OrderDetails'));
export const EditOrder = React.lazy(() => import('../../pages/orders/EditOrder'));
export const NewOrder = React.lazy(() => import('../../pages/orders/NewOrder'));
export const Settings = React.lazy(() => import('../../pages/Settings'));
export const Reports = React.lazy(() => import('../../pages/Reports'));
export const Calendar = React.lazy(() => import('../../pages/Calendar'));
