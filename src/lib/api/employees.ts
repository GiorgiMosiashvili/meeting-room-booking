// თანამშრომლების API. მონაცემი პატარაა, ფილტრაცია საჭირო არ არის.
"use client";

import type { Employee } from "@/types/employee";
import { getEmployees as dbGetEmployees } from "@/data/db";
import { ApiError, simulate } from "./client";

// ყველა თანამშრომელი, დახარისხებული სახელით.
export function getEmployees(): Promise<Employee[]> {
  return simulate(() =>
    [...dbGetEmployees()].sort((a, b) => a.name.localeCompare(b.name)),
  );
}

// ერთი თანამშრომელი id-ით. თუ ვერ მოიძებნა, NOT_FOUND შეცდომა.
export function getEmployee(id: string): Promise<Employee> {
  return simulate(() => {
    const emp = dbGetEmployees().find((e) => e.id === id);
    if (!emp) throw new ApiError(`Employee "${id}" not found.`, "NOT_FOUND");
    return emp;
  });
}
