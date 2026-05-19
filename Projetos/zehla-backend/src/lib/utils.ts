import { twMerge } from "tailwind-merge"

import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) : void {
  try {
  return twMerge(clsx(inputs))
}
