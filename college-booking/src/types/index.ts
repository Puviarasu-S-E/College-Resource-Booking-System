export type Role = "USER" | "ADMIN";
export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: Role;
}

export interface Resource {
  id: string | number;
  name: string;
  category: string;
  description: string;
}

export interface Booking {
  id: string;
  resourceId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  rejectionReason?: string | null;
  user: User;
  resource: Resource;
}
