// ყალბი API-ს "ქსელის ფენა": დაყოვნება + შესაძლო შეცდომა.
// ყველა api/* ფუნქცია აქ გადის, რომ UI-ს ჰქონდეს რეალური loading/error მდგომარეობები.

export type ApiErrorCode = "VALIDATION" | "NOT_FOUND" | "CONFLICT" | "NETWORK";

// API-ს ტიპიზირებული შეცდომა code-ით UI-ს შეუძლია განსხვავებული რეაქცია.
export class ApiError extends Error {
  code: ApiErrorCode;
  constructor(message: string, code: ApiErrorCode) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

// შემთხვევითი "ქსელის ჩავარდნის" ალბათობა. 0 = გამორთული (deploy-ისთვის უსაფრთხო).
// error UI-ს შესამოწმებლად დროებით დააყენე მაგ. 0.2.
const FAILURE_RATE = 0;

// ხელოვნური დაყოვნება 300–600მწ ნაგულისხმევად.
export function delay(min = 300, max = 600): Promise<void> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ამატებს დაყოვნებას და შესაძლო შეცდომას, შემდეგ აბრუნებს fn()-ის შედეგს.
export async function simulate<T>(fn: () => T | Promise<T>): Promise<T> {
  await delay();
  if (Math.random() < FAILURE_RATE) {
    throw new ApiError("Network request failed. Please try again.", "NETWORK");
  }
  return fn();
}
