"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { getCourses } from "../api/get-courses";

export function useCourses() {
  return useSuspenseQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });
}
