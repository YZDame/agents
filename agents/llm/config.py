"""
Configuration classes for LLM providers.
Defines provider types, model mappings, and token limits.
"""

from enum import Enum
from typing import Dict, Optional


class LLMProvider(str, Enum):
    """Supported LLM providers."""
    OPENAI = "openai"
    OPENROUTER = "openrouter"
    GEMINI = "gemini"
    QINIU = "qiniu"
    SILICONFLOW = "siliconflow"


class EmbeddingProvider(str, Enum):
    """Supported embedding providers."""
    OPENAI = "openai"
    OPENROUTER = "openrouter"
    GEMINI = "gemini"
    QINIU = "qiniu"
    SILICONFLOW = "siliconflow"


# Model name mappings for different LLM providers
LLM_MODEL_MAPPING: Dict[LLMProvider, Dict[str, str]] = {
    LLMProvider.OPENAI: {
        "default": "gpt-3.5-turbo-16k",
        "gpt-3.5": "gpt-3.5-turbo-16k",
        "gpt-4": "gpt-4-1106-preview",
    },
    LLMProvider.OPENROUTER: {
        "default": "anthropic/claude-3.5-sonnet",
        "claude": "anthropic/claude-3.5-sonnet",
        "gpt-4": "openai/gpt-4-turbo",
        "gpt-3.5": "openai/gpt-3.5-turbo",
        "gemini": "google/gemini-pro-1.5",
    },
    LLMProvider.GEMINI: {
        "default": "gemini-2.0-flash-exp",
        "flash": "gemini-2.0-flash-exp",
        "pro": "gemini-2.5-pro",
        "gemini-3-pro-preview": "models/gemini-3-pro-preview",
    },
    LLMProvider.QINIU: {
        "default": "qwen-plus",
        "qwen": "qwen-plus",
        "deepseek": "deepseek-chat",
    },
    LLMProvider.SILICONFLOW: {
        "default": "Qwen/Qwen2.5-72B-Instruct",
        "qwen": "Qwen/Qwen2.5-72B-Instruct",
        "deepseek": "deepseek-ai/DeepSeek-V3",
    },
}

# Model name mappings for embedding providers
EMBEDDING_MODEL_MAPPING: Dict[EmbeddingProvider, Dict[str, str]] = {
    EmbeddingProvider.OPENAI: {
        "default": "text-embedding-3-small",
    },
    EmbeddingProvider.OPENROUTER: {
        "default": "openai/text-embedding-3-small",
    },
    EmbeddingProvider.GEMINI: {
        "default": "text-embedding-004",
    },
    EmbeddingProvider.QINIU: {
        "default": "text-embedding-v1",
    },
    EmbeddingProvider.SILICONFLOW: {
        "default": "BAAI/bge-large-en-v1.5",
    },
}

# Token limits per model (conservative estimates for context window)
TOKEN_LIMITS: Dict[LLMProvider, Dict[str, int]] = {
    LLMProvider.OPENAI: {
        "gpt-3.5-turbo-16k": 15000,
        "gpt-4-1106-preview": 95000,
    },
    LLMProvider.OPENROUTER: {
        "anthropic/claude-3.5-sonnet": 200000,
        "openai/gpt-4-turbo": 128000,
        "openai/gpt-3.5-turbo": 16000,
        "google/gemini-pro-1.5": 1000000,
    },
    LLMProvider.GEMINI: {
        "gemini-2.0-flash-exp": 1000000,
        "gemini-2.5-pro": 2000000,
    },
    LLMProvider.QINIU: {
        "qwen-plus": 32000,
        "deepseek-chat": 32000,
    },
    LLMProvider.SILICONFLOW: {
        "Qwen/Qwen2.5-72B-Instruct": 32000,
        "deepseek-ai/DeepSeek-V3": 64000,
    },
}

# Base URLs for OpenAI-compatible providers
PROVIDER_BASE_URLS: Dict[LLMProvider, str] = {
    LLMProvider.OPENROUTER: "https://openrouter.ai/api/v1",
    LLMProvider.SILICONFLOW: "https://api.siliconflow.cn/v1",
    LLMProvider.QINIU: "https://qiniu.ai.example.com/v1",  # TODO: Verify from Qiniu docs
}
