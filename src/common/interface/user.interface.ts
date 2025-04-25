export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  companyName: string;
  status: string; // active or inactive
}
