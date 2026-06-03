package com.aicareer.navigator.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.data.datastore.SessionManager
import com.aicareer.navigator.data.remote.AuthApiService
import com.aicareer.navigator.data.remote.AuthResponse
import com.aicareer.navigator.data.remote.LoginRequest
import com.aicareer.navigator.data.remote.OtpVerifyRequest
import com.aicareer.navigator.data.remote.RegisterRequest
import com.aicareer.navigator.data.remote.ResetPasswordRequest
import com.aicareer.navigator.data.remote.ResetPasswordPayload
import com.aicareer.navigator.data.remote.StandardResponse
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<out T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authApiService: AuthApiService,
    private val sessionManager: SessionManager
) : ViewModel() {

    private val _loginState = MutableStateFlow<UiState<AuthResponse>>(UiState.Idle)
    val loginState: StateFlow<UiState<AuthResponse>> = _loginState.asStateFlow()

    private val _registerState = MutableStateFlow<UiState<StandardResponse>>(UiState.Idle)
    val registerState: StateFlow<UiState<StandardResponse>> = _registerState.asStateFlow()

    private val _otpState = MutableStateFlow<UiState<AuthResponse>>(UiState.Idle)
    val otpState: StateFlow<UiState<AuthResponse>> = _otpState.asStateFlow()

    private val _forgotPasswordState = MutableStateFlow<UiState<StandardResponse>>(UiState.Idle)
    val forgotPasswordState: StateFlow<UiState<StandardResponse>> = _forgotPasswordState.asStateFlow()

    private val _resetPasswordState = MutableStateFlow<UiState<AuthResponse>>(UiState.Idle)
    val resetPasswordState: StateFlow<UiState<AuthResponse>> = _resetPasswordState.asStateFlow()

    fun login(request: LoginRequest) {
        _loginState.value = UiState.Loading
        viewModelScope.launch {
            try {
                val response = authApiService.login(request)
                sessionManager.saveAuthToken(response.token)
                sessionManager.saveUserEmail(response.email)
                response.name?.let { sessionManager.saveUserEmail(it) }
                _loginState.value = UiState.Success(response)
            } catch (e: retrofit2.HttpException) {
                val errorMsg = try {
                    val errorBody = e.response()?.errorBody()?.string()
                    val jsonObj = org.json.JSONObject(errorBody ?: "")
                    jsonObj.optString("detail", "Incorrect email or password")
                } catch (jsonEx: Exception) {
                    "Incorrect email or password"
                }
                _loginState.value = UiState.Error(errorMsg)
            } catch (e: Exception) {
                _loginState.value = UiState.Error("Server is unreachable. Please verify your connection.")
            }
        }
    }

    fun register(request: RegisterRequest) {
        _registerState.value = UiState.Loading
        viewModelScope.launch {
            try {
                val response = authApiService.register(request)
                _registerState.value = UiState.Success(response)
            } catch (e: retrofit2.HttpException) {
                val errorMsg = try {
                    val errorBody = e.response()?.errorBody()?.string()
                    val jsonObj = org.json.JSONObject(errorBody ?: "")
                    jsonObj.optString("detail", "Registration failed")
                } catch (jsonEx: Exception) {
                    "Registration failed"
                }
                _registerState.value = UiState.Error(errorMsg)
            } catch (e: Exception) {
                _registerState.value = UiState.Error("Server is unreachable. Please try again.")
            }
        }
    }

    fun verifyOtp(email: String, code: String) {
        _otpState.value = UiState.Loading
        viewModelScope.launch {
            try {
                val response = authApiService.verifyOtp(OtpVerifyRequest(email, code))
                sessionManager.saveAuthToken(response.token)
                _otpState.value = UiState.Success(response)
            } catch (e: retrofit2.HttpException) {
                val errorMsg = try {
                    val errorBody = e.response()?.errorBody()?.string()
                    val jsonObj = org.json.JSONObject(errorBody ?: "")
                    jsonObj.optString("detail", "Verification failed")
                } catch (jsonEx: Exception) {
                    "Verification failed"
                }
                _otpState.value = UiState.Error(errorMsg)
            } catch (e: Exception) {
                _otpState.value = UiState.Error("Server is unreachable. Please try again.")
            }
        }
    }

    fun forgotPassword(email: String) {
        _forgotPasswordState.value = UiState.Loading
        viewModelScope.launch {
            try {
                val response = authApiService.forgotPassword(ResetPasswordRequest(email))
                _forgotPasswordState.value = UiState.Success(response)
            } catch (e: retrofit2.HttpException) {
                val errorMsg = try {
                    val errorBody = e.response()?.errorBody()?.string()
                    val jsonObj = org.json.JSONObject(errorBody ?: "")
                    jsonObj.optString("detail", "Failed to send reset instructions")
                } catch (jsonEx: Exception) {
                    "Failed to send reset instructions"
                }
                _forgotPasswordState.value = UiState.Error(errorMsg)
            } catch (e: Exception) {
                _forgotPasswordState.value = UiState.Error("Server is unreachable. Please try again.")
            }
        }
    }

    fun resetPassword(payload: ResetPasswordPayload) {
        _resetPasswordState.value = UiState.Loading
        viewModelScope.launch {
            try {
                val response = authApiService.resetPassword(payload)
                sessionManager.saveAuthToken(response.token)
                sessionManager.saveUserEmail(response.email)
                response.name?.let { sessionManager.saveUserEmail(it) }
                _resetPasswordState.value = UiState.Success(response)
            } catch (e: retrofit2.HttpException) {
                val errorMsg = try {
                    val errorBody = e.response()?.errorBody()?.string()
                    val jsonObj = org.json.JSONObject(errorBody ?: "")
                    jsonObj.optString("detail", "Failed to reset password")
                } catch (jsonEx: Exception) {
                    "Failed to reset password"
                }
                _resetPasswordState.value = UiState.Error(errorMsg)
            } catch (e: Exception) {
                _resetPasswordState.value = UiState.Error("Server is unreachable. Please try again.")
            }
        }
    }

    fun saveOnboardingStatus(completed: Boolean) {
        viewModelScope.launch {
            sessionManager.saveOnboardingCompleted(completed)
        }
    }
}
