/**
 * Small, deliberately flat error taxonomy for the service layer to throw.
 * Handlers never inspect these directly — `ApiResponse.fromError` (in
 * `./api-response.ts`) maps each one to the right HTTP status so every
 * route's try/catch stays a one-liner.
 */

export class UnauthorizedError extends Error {
  constructor(message = "Anda belum login.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Anda tidak memiliki akses untuk aksi ini.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Data tidak ditemukan.") {
    super(message);
    this.name = "NotFoundError";
  }
}
