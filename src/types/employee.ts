export interface Employee {
  id: string;
  name: string;
  email: string;
  department: Department;
  avatarUrl?: string;
}

export type Department =
  "Engineering" | "Design" | "Sales" | "People" | "Finance";
