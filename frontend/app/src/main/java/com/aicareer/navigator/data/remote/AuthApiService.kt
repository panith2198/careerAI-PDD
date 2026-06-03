package com.aicareer.navigator.data.remote

import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {

    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): StandardResponse

    @POST("api/v1/auth/verify-otp")
    suspend fun verifyOtp(@Body request: OtpVerifyRequest): AuthResponse

    @POST("api/v1/auth/forgot-password")
    suspend fun forgotPassword(@Body request: ResetPasswordRequest): StandardResponse

    @POST("api/v1/auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordPayload): AuthResponse
}
