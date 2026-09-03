"use client";

// თანამშრომლების Query ჰუკები.
import { useQuery } from "@tanstack/react-query";
import type { Employee } from "@/types/employee";
import { getEmployees } from "@/lib/api/employees";

// ყველა თანამშრომელი. staleTime დიდია — სია პრაქტიკულად არ იცვლება.
export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    staleTime: Infinity,
  });
}

// id → Employee რუკა (ჯავშნებში ორგანიზატორის/დამსწრეების საჩვენებლად).
export function useEmployeeMap() {
  const query = useEmployees();
  const map: Record<string, Employee> = {};
  for (const e of query.data ?? []) map[e.id] = e;
  return { ...query, map };
}
