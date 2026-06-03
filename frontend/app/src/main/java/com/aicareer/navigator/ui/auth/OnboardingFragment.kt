package com.aicareer.navigator.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.databinding.FragmentOnboardingBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class OnboardingFragment : Fragment() {

    private var _binding: FragmentOnboardingBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by viewModels()

    private val slides = listOf(
        OnboardingSlide(
            "Smart Career Roadmaps",
            "Get step-by-step career path milestones and skill standards projected by AI.",
            R.drawable.ic_roadmap
        ),
        OnboardingSlide(
            "Real-Time AI Chatbot",
            "Streaming responses to your technical questions powered by Ms-Marco RAG.",
            R.drawable.ic_chat
        ),
        OnboardingSlide(
            "Resume ATS Analytics",
            "Analyze ATS scoring and verify skills gaps before applying to tech roles.",
            R.drawable.ic_jobs
        )
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOnboardingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.viewPager.adapter = OnboardingAdapter(slides)
        
        binding.btnNext.setOnClickListener {
            val currentItem = binding.viewPager.currentItem
            if (currentItem < slides.size - 1) {
                binding.viewPager.currentItem = currentItem + 1
            } else {
                finishOnboarding()
            }
        }

        binding.viewPager.registerOnPageChangeCallback(object : androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                if (position == slides.size - 1) {
                    binding.btnNext.text = "Get Started"
                } else {
                    binding.btnNext.text = "Next"
                }
            }
        })
    }

    private fun finishOnboarding() {
        viewModel.saveOnboardingStatus(true)
        findNavController().navigate(R.id.action_onboarding_to_login)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    data class OnboardingSlide(
        val title: String,
        val desc: String,
        val iconRes: Int
    )

    inner class OnboardingAdapter(private val list: List<OnboardingSlide>) :
        RecyclerView.Adapter<OnboardingAdapter.PageViewHolder>() {

        inner class PageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val ivIcon: ImageView = view.findViewById(R.id.iv_onboarding_image)
            val tvTitle: TextView = view.findViewById(R.id.tv_title)
            val tvDesc: TextView = view.findViewById(R.id.tv_desc)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PageViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_onboarding_page, parent, false)
            return PageViewHolder(view)
        }

        override fun onBindViewHolder(holder: PageViewHolder, position: Int) {
            val slide = list[position]
            holder.tvTitle.text = slide.title
            holder.tvDesc.text = slide.desc
            holder.ivIcon.setImageResource(slide.iconRes)
        }

        override fun getItemCount(): Int = list.size
    }
}
