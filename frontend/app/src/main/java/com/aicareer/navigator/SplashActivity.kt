package com.aicareer.navigator

import android.content.Intent
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.aicareer.navigator.data.datastore.SessionManager
import com.aicareer.navigator.databinding.ActivitySplashBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding

    @Inject
    lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        lifecycleScope.launch {
            // Simulated delay for premium brand presentation
            delay(1200)

            val isOnboardingCompleted = sessionManager.isOnboardingCompletedFlow.first()
            val token = sessionManager.authTokenFlow.first()

            if (!isOnboardingCompleted) {
                // Route to Onboarding
                navigateToAuth(startAtLogin = false)
            } else if (token.isNullOrEmpty()) {
                // Onboarding complete but requires login
                navigateToAuth(startAtLogin = true)
            } else {
                // Authorized session -> MainActivity
                startActivity(Intent(this@SplashActivity, MainActivity::class.java))
                finish()
            }
        }
    }

    private fun navigateToAuth(startAtLogin: Boolean) {
        val intent = Intent(this, AuthActivity::class.java).apply {
            putExtra("start_at_login", startAtLogin)
        }
        startActivity(intent)
        finish()
    }
}
