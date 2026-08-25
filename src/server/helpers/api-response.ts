import { NextResponse } from "next/server";
import { Prisma } from "../../../generated/prisma/client";
import { ZodError } from "zod";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/server/helpers/errors";

interface SuccessBody<T> {
  success: true;
  message?: string;
  data: T;
}

interface ErrorBody {
  success: false;
  message: string;
  /** Field-level Zod validation messages, when the failure was a 422. */
  errors?: Record<string, string[] | undefined>;
}

/**
 * Every route handler funnels its response through here so callers of the
 * API — the frontend, mobile clients, whoever — get one consistent JSON
 * envelope regardless of which layer produced the result or the error.
 */
export const ApiResponse = {
  success<T>(data: T, message?: string, status = 200) {
    return NextResponse.json<SuccessBody<T>>({ success: true, message, data }, { status });
  },

  created<T>(data: T, message = "Berhasil dibuat.") {
    return ApiResponse.success(data, message, 201);
  },

  error(message: string, status = 400, errors?: ErrorBody["errors"]) {
    return NextResponse.json<ErrorBody>({ success: false, message, errors }, { status });
  },

  /**
   * Translates a thrown error into the right HTTP response. Keeping this
   * mapping in one place is what lets every handler method be a plain
   * `try { ... } catch (err) { return ApiResponse.fromError(err); }`.
   */
  fromError(err: unknown) {
    if (err instanceof ZodError) {
      return ApiResponse.error(
        "Data yang dikirim tidak valid.",
        422,
        err.flatten().fieldErrors
      );
    }

    if (err instanceof UnauthorizedError) {
      return ApiResponse.error(err.message, 401);
    }

    if (err instanceof ForbiddenError) {
      return ApiResponse.error(err.message, 403);
    }

    if (err instanceof NotFoundError) {
      return ApiResponse.error(err.message, 404);
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case "P2002": // unique constraint violation
          return ApiResponse.error("Data sudah ada (duplikat).", 409);
        case "P2003": // foreign key constraint violation
          return ApiResponse.error("Referensi data tidak valid (mis. lokasi tidak ditemukan).", 400);
        case "P2025": // record to update/delete not found
          return ApiResponse.error("Data tidak ditemukan.", 404);
        default:
          console.error("[api] Prisma error:", err.code, err.message);
          return ApiResponse.error("Terjadi kesalahan pada database.", 500);
      }
    }

    console.error("[api] Unhandled error:", err);
    return ApiResponse.error("Terjadi kesalahan pada server.", 500);
  },
};
