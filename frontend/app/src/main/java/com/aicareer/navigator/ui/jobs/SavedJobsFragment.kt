package com.aicareer.navigator.ui.jobs

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.JobDto
import com.aicareer.navigator.databinding.FragmentSavedJobsBinding
import com.aicareer.navigator.databinding.ItemJobCardBinding
import com.google.android.material.snackbar.Snackbar
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class SavedJobsFragment : Fragment() {

    private var _binding: FragmentSavedJobsBinding? = null
    private val binding get() = _binding!!

    // Shared Activity-scoped ViewModel to synchronize state changes
    private val viewModel: JobsViewModel by activityViewModels()
    private lateinit var adapter: SavedJobsAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSavedJobsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        observeSavedJobs()
    }

    private fun setupRecyclerView() {
        binding.rvSavedJobs.layoutManager = LinearLayoutManager(requireContext())
        adapter = SavedJobsAdapter(emptyList(), { job ->
            // Click listener navigates directly to Job Details
            val bundle = Bundle().apply {
                putInt("jobId", job.job_id)
            }
            findNavController().navigate(R.id.navigation_job_detail, bundle)
        }, { job ->
            viewModel.toggleSaveJob(job)
            Toast.makeText(requireContext(), "Removed from bookmarks!", Toast.LENGTH_SHORT).show()
        })
        binding.rvSavedJobs.adapter = adapter

        // Setup swipe-to-delete with Undo Snackbar
        val swipeHandler = object : ItemTouchHelper.SimpleCallback(0, ItemTouchHelper.LEFT or ItemTouchHelper.RIGHT) {
            override fun onMove(
                recyclerView: RecyclerView,
                viewHolder: RecyclerView.ViewHolder,
                target: RecyclerView.ViewHolder
            ): Boolean = false

            override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {
                val position = viewHolder.adapterPosition
                val job = adapter.currentList[position]

                // Unsave job
                viewModel.unsaveJobById(job.job_id)

                // Show snackbar with undo action
                Snackbar.make(binding.root, "Removed bookmark: ${job.title}", Snackbar.LENGTH_LONG)
                    .setAction("Undo") {
                        viewModel.toggleSaveJob(job)
                    }
                    .setActionTextColor(ContextCompat.getColor(requireContext(), R.color.color_cyan))
                    .show()
            }
        }
        val itemTouchHelper = ItemTouchHelper(swipeHandler)
        itemTouchHelper.attachToRecyclerView(binding.rvSavedJobs)
    }

    private fun observeSavedJobs() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.savedJobsState.collectLatest { list ->
                adapter.updateData(list)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    inner class SavedJobsAdapter(
        var currentList: List<JobDto>,
        private val onItemClick: (JobDto) -> Unit,
        private val onSaveClick: (JobDto) -> Unit
    ) : RecyclerView.Adapter<SavedJobsAdapter.SavedViewHolder>() {

        inner class SavedViewHolder(val binding: ItemJobCardBinding) :
            RecyclerView.ViewHolder(binding.root)

        fun updateData(newList: List<JobDto>) {
            currentList = newList
            notifyDataSetChanged()
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SavedViewHolder {
            val binding = ItemJobCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return SavedViewHolder(binding)
        }

        override fun onBindViewHolder(holder: SavedViewHolder, position: Int) {
            val item = currentList[position]
            val binding = holder.binding

            binding.tvTitle.text = item.title
            binding.tvCompany.text = item.company ?: "Company"
            binding.tvLocation.text = item.location ?: "Location"
            binding.tvMatch.text = "${item.match_score?.toInt() ?: 80}% MATCH"
            binding.tvSalary.text = "₹${item.salary_min ?: 10}L - ₹${item.salary_max ?: 18}L/yr"

            // Save Toggle Icon visual state (will always be true since it's in the bookmarked list)
            binding.btnSave.setIconResource(R.drawable.ic_launcher_foreground)
            binding.btnSave.iconTint = ContextCompat.getColorStateList(requireContext(), R.color.color_rose)

            binding.btnSave.setOnClickListener {
                onSaveClick(item)
            }

            binding.root.setOnClickListener {
                onItemClick(item)
            }
        }

        override fun getItemCount(): Int = currentList.size
    }
}
