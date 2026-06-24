package com.aicareer.navigator.di

import com.aicareer.navigator.data.remote.AuthApiService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import kotlinx.coroutines.flow.firstOrNull
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    private const val BASE_URL = "http://192.168.31.46:8000/"

    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        loggingInterceptor: HttpLoggingInterceptor,
        sessionManager: com.aicareer.navigator.data.datastore.SessionManager
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor { chain ->
                val original = chain.request()
                val requestBuilder = original.newBuilder()
                val url = original.url.toString()
                
                android.util.Log.d("DEBUG_AUTH", "Intercepting URL: $url")
                
                // Read token synchronously from Datastore Flow
                val token = kotlinx.coroutines.runBlocking {
                    try {
                        val t = sessionManager.authTokenFlow.firstOrNull()
                        android.util.Log.d("DEBUG_AUTH", "Retrieved token from Datastore: $t")
                        t
                    } catch (e: Exception) {
                        android.util.Log.e("DEBUG_AUTH", "Error reading token from Datastore", e)
                        null
                    }
                }
                
                if (!token.isNullOrEmpty()) {
                    android.util.Log.d("DEBUG_AUTH", "Injecting Bearer token into headers")
                    requestBuilder.header("Authorization", "Bearer $token")
                } else {
                    android.util.Log.d("DEBUG_AUTH", "No token injected (empty or null)")
                }
                
                chain.proceed(requestBuilder.build())
            }
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApiService(retrofit: Retrofit): AuthApiService {
        return retrofit.create(AuthApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideHomeApiService(retrofit: Retrofit): com.aicareer.navigator.data.remote.HomeApiService {
        return retrofit.create(com.aicareer.navigator.data.remote.HomeApiService::class.java)
    }
}

