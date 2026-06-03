package com.aicareer.navigator.data.remote

// Requests
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val full_name: String,
    val email: String,
    val password: String
)

data class OtpVerifyRequest(
    val email: String,
    val code: String
)

data class ResetPasswordRequest(
    val email: String
)

// Responses
data class AuthResponse(
    val token: String,
    val email: String,
    val name: String?,
    val status: String
)

data class StandardResponse(
    val success: Boolean,
    val message: String
)

data class ResetPasswordPayload(
    val email: String,
    val code: String,
    val new_password: String
)
