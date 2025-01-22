export interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  status: "online" | "offline" | "away";
}
