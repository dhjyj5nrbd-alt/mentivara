<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

abstract class Controller
{
    /**
     * Standardized success response with data.
     */
    protected function success(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json(['data' => $data], $status);
    }

    /**
     * Standardized message-only response.
     */
    protected function message(string $message, int $status = 200): JsonResponse
    {
        return response()->json(['message' => $message], $status);
    }

    /**
     * Standardized error response.
     */
    protected function error(string $message, int $status = 400): JsonResponse
    {
        return response()->json(['message' => $message], $status);
    }
}
