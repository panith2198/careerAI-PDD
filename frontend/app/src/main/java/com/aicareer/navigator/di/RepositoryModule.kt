package com.aicareer.navigator.di

import com.aicareer.navigator.data.repository.RagRepositoryImpl
import com.aicareer.navigator.domain.repository.RagRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindsRagRepository(
        ragRepositoryImpl: RagRepositoryImpl
    ): RagRepository
}
