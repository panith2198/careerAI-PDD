package com.aicareer.navigator.ui.career

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import android.view.inputmethod.InputMethodManager
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.databinding.FragmentCareerBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class CareerFragment : Fragment() {

    private var _binding: FragmentCareerBinding? = null
    private val binding get() = _binding!!

    private val careers = listOf(
        CareerProfile(
            "Android Engineer", 
            "android-developer",
            "₹7L – ₹18L/yr", 
            "94%", 
            "Build innovative mobile apps and shape the Android ecosystem.", 
            R.drawable.ic_android, 
            94
        ),
        CareerProfile(
            "Data Analyst", 
            "data-analyst",
            "₹5L – ₹12L/yr", 
            "86%", 
            "Analyze data, build models, and drive data-informed decisions.", 
            R.drawable.ic_chart_bar, 
            86
        ),
        CareerProfile(
            "DevOps Architect", 
            "devops-engineer",
            "₹8L – ₹20L/yr", 
            "78%", 
            "Design scalable infrastructure and streamline deployment pipelines.", 
            R.drawable.ic_infinity, 
            78
        ),
        CareerProfile(
            "Frontend Developer", 
            "frontend-developer",
            "₹6L – ₹15L/yr", 
            "72%", 
            "Construct high-fidelity, responsive user interface layouts and client applications.", 
            R.drawable.ic_code, 
            72
        )
    )

    private var filteredCareers = careers.toList()
    private lateinit var careerAdapter: CareerAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCareerBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.rvCareers.layoutManager = LinearLayoutManager(requireContext())
        setupAdapter()

        // Toggle Search field
        binding.ibSearch.setOnClickListener {
            if (binding.etSearch.visibility == View.VISIBLE) {
                binding.etSearch.visibility = View.GONE
                binding.etSearch.setText("")
                hideKeyboard()
            } else {
                binding.etSearch.visibility = View.VISIBLE
                binding.etSearch.requestFocus()
                showKeyboard()
            }
        }

        // Live filtering TextWatcher
        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val query = s?.toString() ?: ""
                filteredCareers = if (query.isEmpty()) {
                    careers.toList()
                } else {
                    careers.filter {
                        it.title.contains(query, ignoreCase = true) || 
                        it.description.contains(query, ignoreCase = true)
                    }
                }
                setupAdapter()
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun setupAdapter() {
        careerAdapter = CareerAdapter(filteredCareers) { career ->
            val bundle = Bundle().apply {
                putString("careerSlug", career.slug)
            }
            findNavController().navigate(R.id.action_career_to_detail, bundle)
        }
        binding.rvCareers.adapter = careerAdapter
        animateListEntrance()
    }

    private fun showKeyboard() {
        val imm = requireContext().getSystemService(android.content.Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.showSoftInput(binding.etSearch, InputMethodManager.SHOW_IMPLICIT)
    }

    private fun hideKeyboard() {
        val imm = requireContext().getSystemService(android.content.Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(binding.etSearch.windowToken, 0)
    }

    private fun animateListEntrance() {
        binding.rvCareers.post {
            for (i in 0 until careerAdapter.itemCount) {
                binding.rvCareers.findViewHolderForAdapterPosition(i)?.itemView?.apply {
                    alpha = 0f
                    translationY = 40f
                    animate().alpha(1f).translationY(0f)
                        .setStartDelay(i * 40L)
                        .setDuration(350)
                        .setInterpolator(DecelerateInterpolator())
                        .start()
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    data class CareerProfile(
        val title: String,
        val slug: String,
        val salary: String,
        val fitScore: String,
        val description: String,
        val iconResId: Int,
        val fitPercent: Int
    )

    inner class CareerAdapter(
        private val list: List<CareerProfile>,
        private val onClick: (CareerProfile) -> Unit
    ) : RecyclerView.Adapter<CareerAdapter.CareerViewHolder>() {

        inner class CareerViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val ivIcon: ImageView = view.findViewById(R.id.iv_career_icon)
            val tvTitle: TextView = view.findViewById(R.id.tv_title)
            val tvDescription: TextView = view.findViewById(R.id.tv_description)
            val tvSalary: TextView = view.findViewById(R.id.tv_salary)
            val pbFit: ProgressBar = view.findViewById(R.id.pb_fit_circle)
            val tvFitScore: TextView = view.findViewById(R.id.tv_fit_score)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CareerViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_career, parent, false)
            return CareerViewHolder(view)
        }

        override fun onBindViewHolder(holder: CareerViewHolder, position: Int) {
            val career = list[position]
            holder.ivIcon.setImageResource(career.iconResId)
            holder.tvTitle.text = career.title
            holder.tvDescription.text = career.description
            holder.tvSalary.text = career.salary
            holder.pbFit.progress = career.fitPercent
            holder.tvFitScore.text = career.fitScore
            holder.itemView.setOnClickListener { onClick(career) }
        }

        override fun getItemCount(): Int = list.size
    }
}
