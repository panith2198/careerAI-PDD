package com.aicareer.navigator

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.aicareer.navigator.databinding.ActivityMainBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        val navController = navHostFragment.navController
        
        binding.bottomNav.setupWithNavController(navController)
        
        binding.bottomNav.setOnItemSelectedListener { item ->
            // Trigger AVD path drawing animation
            val icon = item.icon
            if (icon is android.graphics.drawable.AnimatedVectorDrawable) {
                icon.start()
            }
            
            // Micro-interaction: lift translation animation
            val itemView = binding.bottomNav.findViewById<View>(item.itemId)
            itemView?.animate()?.translationY(-5f)?.setDuration(120)?.withEndAction {
                itemView.animate()?.translationY(0f)?.setDuration(180)
                    ?.setInterpolator(android.view.animation.OvershootInterpolator(2f))?.start()
            }?.start()

            // Handle navigation delegation
            androidx.navigation.ui.NavigationUI.onNavDestinationSelected(item, navController)
            true
        }

        // Handle FCM Deep Linking if app was launched via notification
        intent?.let { handleIntent(it) }

        // Hide bottom navigation bar when soft keyboard (IME) is visible (typing)
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { view, insets ->
            val isKeyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime())
            binding.bottomNav.visibility = if (isKeyboardVisible) View.GONE else View.VISIBLE
            ViewCompat.onApplyWindowInsets(view, insets)
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent) {
        val targetDestination = intent.getStringExtra("destination")
        if (!targetDestination.isNullOrEmpty()) {
            val navHostFragment = supportFragmentManager
                .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
            val navController = navHostFragment.navController
            
            when (targetDestination) {
                "chat" -> navController.navigate(R.id.navigation_chat)
                "career" -> navController.navigate(R.id.navigation_career)
                "jobs" -> navController.navigate(R.id.navigation_jobs)
                "profile" -> navController.navigate(R.id.navigation_profile)
                "assessment" -> navController.navigate(R.id.navigation_assessment)
                "roadmap" -> navController.navigate(R.id.navigation_roadmap)
            }
        }
    }
}
