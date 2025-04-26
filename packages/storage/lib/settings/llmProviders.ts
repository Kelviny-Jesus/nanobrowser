import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';
import { type AgentNameEnum, llmProviderModelNames, llmProviderParameters, ProviderTypeEnum } from './types';

// Interface for a single provider configuration
export interface ProviderConfig {
  name?: string;
  type?: ProviderTypeEnum;
  apiKey: string;
  baseUrl?: string;
  modelNames?: string[];
  createdAt?: number;
  azureDeploymentNames?: string[];
  azureApiVersion?: string;
}

export interface LLMKeyRecord {
  providers: Record<string, ProviderConfig>;
}

export type LLMProviderStorage = BaseStorage<LLMKeyRecord> & {
  setProvider: (providerId: string, config: ProviderConfig) => Promise<void>;
  getProvider: (providerId: string) => Promise<ProviderConfig | undefined>;
  removeProvider: (providerId: string) => Promise<void>;
  hasProvider: (providerId: string) => Promise<boolean>;
  getAllProviders: () => Promise<Record<string, ProviderConfig>>;
};

const storage = createStorage<LLMKeyRecord>(
  'llm-api-keys',
  {
    providers: {
      OpenAI: {
        apiKey: '',
        name: 'OpenAI',
        type: ProviderTypeEnum.OpenAI,
        modelNames: ['gpt-4.1'],
        createdAt: Date.now(),
      },
    },
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export function getProviderTypeByProviderId(providerId: string): ProviderTypeEnum {
  if (providerId === ProviderTypeEnum.AzureOpenAI) {
    return ProviderTypeEnum.AzureOpenAI;
  }
  if (typeof providerId === 'string' && providerId.startsWith(`${ProviderTypeEnum.AzureOpenAI}_`)) {
    return ProviderTypeEnum.AzureOpenAI;
  }
  switch (providerId) {
    case ProviderTypeEnum.OpenAI:
    case ProviderTypeEnum.Anthropic:
    case ProviderTypeEnum.DeepSeek:
    case ProviderTypeEnum.Gemini:
    case ProviderTypeEnum.Grok:
    case ProviderTypeEnum.Ollama:
    case ProviderTypeEnum.OpenRouter:
      return providerId;
    default:
      return ProviderTypeEnum.CustomOpenAI;
  }
}

export function getDefaultDisplayNameFromProviderId(providerId: string): string {
  switch (providerId) {
    case ProviderTypeEnum.OpenAI:
      return 'OpenAI';
    case ProviderTypeEnum.Anthropic:
      return 'Anthropic';
    case ProviderTypeEnum.DeepSeek:
      return 'DeepSeek';
    case ProviderTypeEnum.Gemini:
      return 'Gemini';
    case ProviderTypeEnum.Grok:
      return 'Grok';
    case ProviderTypeEnum.Ollama:
      return 'Ollama';
    case ProviderTypeEnum.AzureOpenAI:
      return 'Azure OpenAI';
    case ProviderTypeEnum.OpenRouter:
      return 'OpenRouter';
    default:
      return providerId;
  }
}

export function getDefaultProviderConfig(providerId: string): ProviderConfig {
  switch (providerId) {
    case ProviderTypeEnum.OpenAI:
    case ProviderTypeEnum.Anthropic:
    case ProviderTypeEnum.DeepSeek:
    case ProviderTypeEnum.Gemini:
    case ProviderTypeEnum.Grok:
    case ProviderTypeEnum.OpenRouter:
      return {
        apiKey: '',
        name: getDefaultDisplayNameFromProviderId(providerId),
        type: providerId,
        baseUrl: providerId === ProviderTypeEnum.OpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
        modelNames: [...(llmProviderModelNames[providerId] || [])],
        createdAt: Date.now(),
      };
    case ProviderTypeEnum.Ollama:
      return {
        apiKey: 'ollama',
        name: getDefaultDisplayNameFromProviderId(ProviderTypeEnum.Ollama),
        type: ProviderTypeEnum.Ollama,
        modelNames: [],
        baseUrl: 'http://localhost:11434',
        createdAt: Date.now(),
      };
    case ProviderTypeEnum.AzureOpenAI:
      return {
        apiKey: '',
        name: getDefaultDisplayNameFromProviderId(ProviderTypeEnum.AzureOpenAI),
        type: ProviderTypeEnum.AzureOpenAI,
        baseUrl: '',
        azureDeploymentNames: [],
        azureApiVersion: '2024-02-15-preview',
        createdAt: Date.now(),
      };
    default:
      return {
        apiKey: '',
        name: getDefaultDisplayNameFromProviderId(providerId),
        type: ProviderTypeEnum.CustomOpenAI,
        baseUrl: '',
        modelNames: [],
        createdAt: Date.now(),
      };
  }
}

export function getDefaultAgentModelParams(providerId: string, agentName: AgentNameEnum): Record<string, number> {
  const newParameters = llmProviderParameters[providerId as keyof typeof llmProviderParameters]?.[agentName] || {
    temperature: 0.1,
    topP: 0.1,
  };
  return newParameters;
}

function ensureBackwardCompatibility(providerId: string, config: ProviderConfig): ProviderConfig {
  const updatedConfig = { ...config };
  if (!updatedConfig.name) {
    updatedConfig.name = getDefaultDisplayNameFromProviderId(providerId);
  }
  if (!updatedConfig.type) {
    updatedConfig.type = getProviderTypeByProviderId(providerId);
  }
  if (updatedConfig.type === ProviderTypeEnum.AzureOpenAI) {
    if (updatedConfig.azureApiVersion === undefined) {
      updatedConfig.azureApiVersion = '2024-02-15-preview';
    }
    if (!updatedConfig.azureDeploymentNames) {
      updatedConfig.azureDeploymentNames = [];
    }
    if (Object.prototype.hasOwnProperty.call(updatedConfig, 'modelNames')) {
      delete updatedConfig.modelNames;
    }
  } else {
    if (!updatedConfig.modelNames) {
      updatedConfig.modelNames = llmProviderModelNames[providerId as keyof typeof llmProviderModelNames] || [];
    }
  }
  if (!updatedConfig.createdAt) {
    updatedConfig.createdAt = new Date('03/04/2025').getTime();
  }
  return updatedConfig;
}

export const llmProviderStore: LLMProviderStorage = {
  ...storage,
  async setProvider(providerId: string, config: ProviderConfig) {
    if (!providerId) {
      throw new Error('Provider id cannot be empty');
    }
    if (config.apiKey === undefined) {
      throw new Error('API key must be provided (can be empty for local models)');
    }
    const providerType = config.type || getProviderTypeByProviderId(providerId);
    if (providerType === ProviderTypeEnum.AzureOpenAI) {
      if (!config.baseUrl?.trim()) {
        throw new Error('Azure Endpoint (baseUrl) is required');
      }
      if (!config.azureDeploymentNames || config.azureDeploymentNames.length === 0) {
        throw new Error('At least one Azure Deployment Name is required');
      }
      if (!config.azureApiVersion?.trim()) {
        throw new Error('Azure API Version is required');
      }
      if (!config.apiKey?.trim()) {
        throw new Error('API Key is required for Azure OpenAI');
      }
    } else if (providerType !== ProviderTypeEnum.CustomOpenAI && providerType !== ProviderTypeEnum.Ollama) {
      if (!config.apiKey?.trim()) {
        throw new Error(`API Key is required for ${getDefaultDisplayNameFromProviderId(providerId)}`);
      }
    }
    if (providerType !== ProviderTypeEnum.AzureOpenAI) {
      if (!config.modelNames || config.modelNames.length === 0) {
        console.warn(`Provider ${providerId} of type ${providerType} is being saved without model names.`);
      }
    }
    const completeConfig: ProviderConfig = {
      apiKey: config.apiKey || '',
      baseUrl: config.baseUrl,
      name: config.name || getDefaultDisplayNameFromProviderId(providerId),
      type: providerType,
      createdAt: config.createdAt || Date.now(),
      ...(providerType === ProviderTypeEnum.AzureOpenAI
        ? {
            azureDeploymentNames: config.azureDeploymentNames || [],
            azureApiVersion: config.azureApiVersion,
          }
        : {
            modelNames: config.modelNames || [],
          }),
    };
    console.log(`[llmProviderStore.setProvider] Saving config for ${providerId}:`, JSON.stringify(completeConfig));
    const current = (await storage.get()) || { providers: {} };
    await storage.set({
      providers: {
        ...current.providers,
        [providerId]: completeConfig,
      },
    });
  },
  async getProvider(providerId: string) {
    const data = (await storage.get()) || { providers: {} };
    const config = data.providers[providerId];
    return config ? ensureBackwardCompatibility(providerId, config) : undefined;
  },
  async removeProvider(providerId: string) {
    const current = (await storage.get()) || { providers: {} };
    const newProviders = { ...current.providers };
    delete newProviders[providerId];
    await storage.set({ providers: newProviders });
  },
  async hasProvider(providerId: string) {
    const data = (await storage.get()) || { providers: {} };
    return providerId in data.providers;
  },
  async getAllProviders() {
    const data = await storage.get();
    const providers = { ...data.providers };
    for (const [providerId, config] of Object.entries(providers)) {
      providers[providerId] = ensureBackwardCompatibility(providerId, config);
    }
    return providers;
  },
};
