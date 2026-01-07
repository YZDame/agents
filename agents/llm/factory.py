"""
Factory for creating LLM and Embedding instances from different providers.
"""

import os
from typing import Optional, Union

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from agents.llm.config import (
    LLMProvider,
    EmbeddingProvider,
    LLM_MODEL_MAPPING,
    EMBEDDING_MODEL_MAPPING,
    TOKEN_LIMITS,
    PROVIDER_BASE_URLS,
)

load_dotenv()


class LLMFactory:
    """Factory for creating LLM instances from different providers."""

    @staticmethod
    def get_api_key(provider: LLMProvider) -> Optional[str]:
        """Get API key for a given provider."""
        key_mapping = {
            LLMProvider.OPENAI: "OPENAI_API_KEY",
            LLMProvider.OPENROUTER: "OPENROUTER_API_KEY",
            LLMProvider.GEMINI: "GOOGLE_API_KEY",
            LLMProvider.QINIU: "QINIU_API_KEY",
            LLMProvider.SILICONFLOW: "SILICONFLOW_API_KEY",
        }
        return os.getenv(key_mapping.get(provider, ""))

    @staticmethod
    def create_llm(
        provider: Union[str, LLMProvider] = LLMProvider.OPENAI,
        model: Optional[str] = None,
        temperature: float = 0,
        **kwargs
    ):
        """
        Create an LLM instance from the specified provider.

        Args:
            provider: The LLM provider to use
            model: Model name (if None, uses provider default)
            temperature: Temperature for generation
            **kwargs: Additional provider-specific arguments

        Returns:
            LangChain LLM instance
        """
        if isinstance(provider, str):
            provider = LLMProvider(provider)

        api_key = LLMFactory.get_api_key(provider)
        if not api_key:
            raise ValueError(
                f"API key not found for provider: {provider}. "
                f"Please set the environment variable: {LLMFactory._get_env_var_name(provider)}"
            )

        # Get model name (use default if not specified)
        if model is None:
            model = LLM_MODEL_MAPPING[provider]["default"]

        # Create LLM based on provider
        if provider == LLMProvider.OPENAI:
            return ChatOpenAI(
                model=model,
                temperature=temperature,
                api_key=api_key,
                **kwargs
            )

        elif provider == LLMProvider.GEMINI:
            # Import Google GenAI only when needed
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
            except ImportError:
                raise ImportError(
                    "langchain-google-genai is required for Gemini. "
                    "Install it with: pip install langchain-google-genai"
                )
            return ChatGoogleGenerativeAI(
                model=model,
                temperature=temperature,
                api_key=api_key,
                **kwargs
            )

        elif provider in [LLMProvider.OPENROUTER, LLMProvider.SILICONFLOW, LLMProvider.QINIU]:
            # OpenAI-compatible providers
            base_url = PROVIDER_BASE_URLS.get(provider)
            return ChatOpenAI(
                model=model,
                temperature=temperature,
                api_key=api_key,
                base_url=base_url,
                **kwargs
            )

        else:
            raise ValueError(f"Unsupported provider: {provider}")

    @staticmethod
    def _get_env_var_name(provider: LLMProvider) -> str:
        """Get the environment variable name for a provider's API key."""
        key_mapping = {
            LLMProvider.OPENAI: "OPENAI_API_KEY",
            LLMProvider.OPENROUTER: "OPENROUTER_API_KEY",
            LLMProvider.GEMINI: "GOOGLE_API_KEY",
            LLMProvider.QINIU: "QINIU_API_KEY",
            LLMProvider.SILICONFLOW: "SILICONFLOW_API_KEY",
        }
        return key_mapping.get(provider, "")

    @staticmethod
    def get_token_limit(provider: LLMProvider, model: str) -> int:
        """Get token limit for a specific provider/model combination."""
        if provider in TOKEN_LIMITS and model in TOKEN_LIMITS[provider]:
            return TOKEN_LIMITS[provider][model]
        # Conservative default fallback
        return 4000


class EmbeddingFactory:
    """Factory for creating Embedding instances from different providers."""

    @staticmethod
    def get_api_key(provider: EmbeddingProvider) -> Optional[str]:
        """Get API key for a given provider."""
        key_mapping = {
            EmbeddingProvider.OPENAI: "OPENAI_API_KEY",
            EmbeddingProvider.OPENROUTER: "OPENROUTER_API_KEY",
            EmbeddingProvider.GEMINI: "GOOGLE_API_KEY",
            EmbeddingProvider.QINIU: "QINIU_API_KEY",
            EmbeddingProvider.SILICONFLOW: "SILICONFLOW_API_KEY",
        }
        return os.getenv(key_mapping.get(provider, ""))

    @staticmethod
    def create_embeddings(
        provider: Union[str, EmbeddingProvider] = EmbeddingProvider.OPENAI,
        model: Optional[str] = None,
        **kwargs
    ):
        """
        Create an Embeddings instance from the specified provider.

        Args:
            provider: The embedding provider to use
            model: Model name (if None, uses provider default)
            **kwargs: Additional provider-specific arguments

        Returns:
            LangChain Embeddings instance
        """
        if isinstance(provider, str):
            provider = EmbeddingProvider(provider)

        api_key = EmbeddingFactory.get_api_key(provider)
        if not api_key:
            raise ValueError(
                f"API key not found for provider: {provider}. "
                f"Please set the environment variable: {EmbeddingFactory._get_env_var_name(provider)}"
            )

        # Get model name (use default if not specified)
        if model is None:
            model = EMBEDDING_MODEL_MAPPING[provider]["default"]

        # Create embeddings based on provider
        if provider == EmbeddingProvider.OPENAI:
            return OpenAIEmbeddings(
                model=model,
                api_key=api_key,
                **kwargs
            )

        elif provider == EmbeddingProvider.GEMINI:
            # Import Google GenAI only when needed
            try:
                from langchain_google_genai import GoogleGenerativeAIEmbeddings
            except ImportError:
                raise ImportError(
                    "langchain-google-genai is required for Gemini embeddings. "
                    "Install it with: pip install langchain-google-genai"
                )
            return GoogleGenerativeAIEmbeddings(
                model=model,
                api_key=api_key,
                **kwargs
            )

        elif provider in [EmbeddingProvider.OPENROUTER, EmbeddingProvider.SILICONFLOW, EmbeddingProvider.QINIU]:
            # OpenAI-compatible providers
            base_url = PROVIDER_BASE_URLS.get(provider)
            return OpenAIEmbeddings(
                model=model,
                api_key=api_key,
                base_url=base_url,
                **kwargs
            )

        else:
            raise ValueError(f"Unsupported provider: {provider}")

    @staticmethod
    def _get_env_var_name(provider: EmbeddingProvider) -> str:
        """Get the environment variable name for a provider's API key."""
        key_mapping = {
            EmbeddingProvider.OPENAI: "OPENAI_API_KEY",
            EmbeddingProvider.OPENROUTER: "OPENROUTER_API_KEY",
            EmbeddingProvider.GEMINI: "GOOGLE_API_KEY",
            EmbeddingProvider.QINIU: "QINIU_API_KEY",
            EmbeddingProvider.SILICONFLOW: "SILICONFLOW_API_KEY",
        }
        return key_mapping.get(provider, "")
