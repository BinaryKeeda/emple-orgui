export interface Subscription {
  plan: string;
  status: string;
  autoRenew: boolean;
  paymentProvider: string | null;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  isPasswordChanged: boolean;
  isBlocked: boolean;
  profileCompleted: boolean;
  phone: string;
  isVerified: boolean;
  googleId: string;
  pendingInvites: any[]; // Could be refined if you know the type
  subscription: Subscription;
  createdAt: string; // Could be Date if parsed
  updatedAt: string; // Could be Date if parsed
  __v: number;
  program: string;
  semester: string;
  specialisation: string;
  university: string;
  yearOfGraduation: string;
}

export interface Ownership {
  _id: string;
  group?: string;
  section?: string
  userId: string;
  __v: number;
}


export interface UserData {
  user: User;
  ownership: Ownership | [Ownership];
}
