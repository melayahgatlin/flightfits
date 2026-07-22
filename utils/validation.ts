import {
  isValidDateOnly,
  parseDateOnly,
} from "@/utils/date";

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );
}

export function validateRequired(
  value: string,
  label: string
): ValidationResult {
  if (!isRequired(value)) {
    return {
      valid: false,
      message: `${label} is required.`,
    };
  }

  return { valid: true };
}

export function validateEmail(
  value: string
): ValidationResult {
  if (!isRequired(value)) {
    return {
      valid: false,
      message: "Email is required.",
    };
  }

  if (!isValidEmail(value)) {
    return {
      valid: false,
      message: "Enter a valid email address.",
    };
  }

  return { valid: true };
}

export function validatePassword(
  value: string
): ValidationResult {
  if (value.length < 8) {
    return {
      valid: false,
      message:
        "Password must contain at least 8 characters.",
    };
  }

  if (!/[A-Z]/.test(value)) {
    return {
      valid: false,
      message:
        "Password must contain an uppercase letter.",
    };
  }

  if (!/[a-z]/.test(value)) {
    return {
      valid: false,
      message:
        "Password must contain a lowercase letter.",
    };
  }

  if (!/\d/.test(value)) {
    return {
      valid: false,
      message:
        "Password must contain a number.",
    };
  }

  return { valid: true };
}

export function validateDateRange(
  startDate: string,
  endDate: string
): ValidationResult {
  if (
    !isValidDateOnly(startDate) ||
    !isValidDateOnly(endDate)
  ) {
    return {
      valid: false,
      message:
        "Enter dates using the YYYY-MM-DD format.",
    };
  }

  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (!start || !end) {
    return {
      valid: false,
      message: "Enter valid trip dates.",
    };
  }

  if (end < start) {
    return {
      valid: false,
      message:
        "The end date cannot be before the start date.",
    };
  }

  return { valid: true };
}

export function validateUrl(
  value: string
): ValidationResult {
  if (!value.trim()) {
    return { valid: true };
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      throw new Error("Unsupported protocol");
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      message: "Enter a valid website address.",
    };
  }
}