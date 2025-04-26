import 'webextension-polyfill';
import { agentModelStore, AgentNameEnum, generalSettingsStore, llmProviderStore } from '@extension/storage';
import BrowserContext from './browser/context';
import { Executor } from './agent/executor';
import { createLogger } from './log';
import { ExecutionState } from './agent/event/types';
import { createChatModel } from './agent/helper';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

const logger = createLogger('background');

const browserContext = new BrowserContext({});
let currentExecutor: Executor | null = null;
let currentPort: chrome.runtime.Port | null = null;

// Setup side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(error => console.error(error));

// Function to check if script is already injected
async function isScriptInjected(tabId: number): Promise<boolean> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => Object.prototype.hasOwnProperty.call(window, 'buildDomTree'),
    });
    return results[0]?.result || false;
  } catch (err) {
    console.error('Failed to check script injection status:', err);
    return false;
  }
}

// // Function to inject the buildDomTree script
async function injectBuildDomTree(tabId: number) {
  try {
    // Check if already injected
    const alreadyInjected = await isScriptInjected(tabId);
    if (alreadyInjected) {
      console.log('Scripts already injected, skipping...');
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['buildDomTree.js'],
    });
    console.log('Scripts successfully injected');
  } catch (err) {
    console.error('Failed to inject scripts:', err);
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId && changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    await injectBuildDomTree(tabId);
  }
});

// Listen for debugger detached event
// if canceled_by_user, remove the tab from the browser context
chrome.debugger.onDetach.addListener(async (source, reason) => {
  console.log('Debugger detached:', source, reason);
  if (reason === 'canceled_by_user') {
    if (source.tabId) {
      await browserContext.cleanup();
    }
  }
});

// Cleanup when tab is closed
chrome.tabs.onRemoved.addListener(tabId => {
  browserContext.removeAttachedPage(tabId);
});

logger.info('background loaded');

/**
 * Listen for simple messages (e.g., from options page or side panel screenshot)
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'open_side_panel') {
    chrome.windows.getCurrent(win => {
      if (win && typeof win.id === 'number' && chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open({ windowId: win.id }).catch(() => {
          chrome.runtime.openOptionsPage();
        });
      } else {
        chrome.runtime.openOptionsPage();
      }
    });
    return;
  }
  if (message && message.type === 'close_side_panel') {
    chrome.windows.getCurrent(win => {
      if (win && typeof win.id === 'number' && chrome.sidePanel && chrome.sidePanel.close) {
        chrome.sidePanel.close({ windowId: win.id }).catch(() => {});
      }
      if (typeof sendResponse === 'function') sendResponse();
    });
    return true;
  }
  if (message && message.type === 'take_screenshot' && message.tabId) {
    chrome.tabs.get(message.tabId, tab => {
      if (chrome.runtime.lastError || !tab || typeof tab.windowId !== 'number') {
        sendResponse({ dataUrl: null });
        return;
      }
      chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, dataUrl => {
        sendResponse({ dataUrl });
      });
    });
    return true;
  }
  if (message && message.type === 'take_screenshot_full') {
    // Captura a tela inteira da janela atual
    chrome.windows.getCurrent(win => {
      if (!win || typeof win.id !== 'number') {
        sendResponse({ dataUrl: null });
        return;
      }
      chrome.tabs.captureVisibleTab(win.id, { format: 'png' }, dataUrl => {
        sendResponse({ dataUrl });
      });
    });
    return true;
  }
  if (message && message.type === 'cropped_screenshot' && message.dataUrl) {
    // Repassa para o side panel/chat (via port se disponível)
    if (typeof globalThis.currentPort === 'object' && globalThis.currentPort?.postMessage) {
      globalThis.currentPort.postMessage({
        type: 'cropped_screenshot',
        dataUrl: message.dataUrl,
        timestamp: Date.now(),
      });
    }
    return;
  }
  if (message && message.type === 'summarize_page') {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs.find(t => t.url && /^https?:\/\//.test(t.url));
      if (tab && typeof globalThis.currentPort === 'object' && globalThis.currentPort?.postMessage) {
        globalThis.currentPort.postMessage({
          type: 'summarize_page',
          url: tab.url,
          title: tab.title,
        });
      }
    });
    return;
  }
  if (message && message.type === 'quick_action_task') {
    // Faz requisição direta à OpenAI (gpt-4.1) e retorna resposta ao content script
    const apiKey = 'api_here';
    const prompt = message.prompt;
    console.log('[quick_action_task] recebida:', prompt);
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs.find(t => t.url && /^https?:\/\//.test(t.url));
      const tabId = tab?.id;
      console.log('[quick_action_task] tabId:', tabId);
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 512,
          temperature: 0.2,
        }),
      })
        .then(res => {
          console.log('[quick_action_task] fetch status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('[quick_action_task] resposta OpenAI:', data);
          const content = data.choices?.[0]?.message?.content || 'Erro ao obter resposta do modelo.';
          if (tabId) {
            chrome.tabs.sendMessage(
              tabId,
              {
                type: 'quick_action_response',
                content,
              },
              resp => {
                if (chrome.runtime.lastError) {
                  console.error(
                    '[quick_action_task] erro ao enviar resposta para content script:',
                    chrome.runtime.lastError,
                  );
                }
              },
            );
          }
        })
        .catch(err => {
          console.error('[quick_action_task] erro fetch:', err);
          if (tabId) {
            chrome.tabs.sendMessage(tabId, {
              type: 'quick_action_response',
              content: 'Erro ao consultar o modelo: ' + err,
            });
          }
        });
    });
    return;
  }
  // Handle other message types if needed in the future
  // return false;
});

// Setup connection listener for long-lived connections (e.g., side panel)
chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'side-panel-connection') {
    currentPort = port;
    globalThis.currentPort = port;

    port.onMessage.addListener(async message => {
      try {
        switch (message.type) {
          case 'heartbeat':
            // Acknowledge heartbeat
            port.postMessage({ type: 'heartbeat_ack' });
            break;

          case 'new_task': {
            if (!message.task) return port.postMessage({ type: 'error', error: 'No task provided' });
            if (!message.tabId) return port.postMessage({ type: 'error', error: 'No tab ID provided' });

            logger.info('new_task', message.tabId, message.task);
            currentExecutor = await setupExecutor(message.taskId, message.task, browserContext);
            subscribeToExecutorEvents(currentExecutor);

            const result = await currentExecutor.execute();
            logger.info('new_task execution result', message.tabId, result);
            break;
          }
          case 'follow_up_task': {
            if (!message.task) return port.postMessage({ type: 'error', error: 'No follow up task provided' });
            if (!message.tabId) return port.postMessage({ type: 'error', error: 'No tab ID provided' });

            logger.info('follow_up_task', message.tabId, message.task);

            // If executor exists, add follow-up task
            if (currentExecutor) {
              currentExecutor.addFollowUpTask(message.task);
              // Re-subscribe to events in case the previous subscription was cleaned up
              subscribeToExecutorEvents(currentExecutor);
              const result = await currentExecutor.execute();
              logger.info('follow_up_task execution result', message.tabId, result);
            } else {
              // executor was cleaned up, can not add follow-up task
              logger.info('follow_up_task: executor was cleaned up, can not add follow-up task');
              return port.postMessage({ type: 'error', error: 'Executor was cleaned up, can not add follow-up task' });
            }
            break;
          }

          case 'cancel_task': {
            if (!currentExecutor) return port.postMessage({ type: 'error', error: 'No task to cancel' });
            await currentExecutor.cancel();
            break;
          }

          case 'screenshot': {
            if (!message.tabId) return port.postMessage({ type: 'error', error: 'No tab ID provided' });
            const page = await browserContext.switchTab(message.tabId);
            const screenshot = await page.takeScreenshot();
            logger.info('screenshot', message.tabId, screenshot);
            return port.postMessage({ type: 'success', screenshot });
          }

          case 'resume_task': {
            if (!currentExecutor) return port.postMessage({ type: 'error', error: 'No task to resume' });
            await currentExecutor.resume();
            return port.postMessage({ type: 'success' });
          }

          case 'pause_task': {
            if (!currentExecutor) return port.postMessage({ type: 'error', error: 'No task to pause' });
            await currentExecutor.pause();
            return port.postMessage({ type: 'success' });
          }

          default:
            return port.postMessage({ type: 'error', error: 'Unknown message type' });
        }
      } catch (error) {
        console.error('Error handling port message:', error);
        port.postMessage({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    port.onDisconnect.addListener(() => {
      console.log('Side panel disconnected');
      currentPort = null;
    });
  }
});

async function setupExecutor(taskId: string, task: string, browserContext: BrowserContext) {
  const providers = await llmProviderStore.getAllProviders();
  // if no providers, need to display the options page
  if (Object.keys(providers).length === 0) {
    throw new Error('Please configure API keys in the settings first');
  }
  const agentModels = await agentModelStore.getAllAgentModels();
  // verify if every provider used in the agent models exists in the providers
  for (const agentModel of Object.values(agentModels)) {
    if (!providers[agentModel.provider]) {
      throw new Error(`Provider ${agentModel.provider} not found in the settings`);
    }
  }

  const navigatorModel = agentModels[AgentNameEnum.Navigator];
  if (!navigatorModel) {
    throw new Error('Please choose a model for the navigator in the settings first');
  }
  // Log the provider config being used for the navigator
  const navigatorProviderConfig = providers[navigatorModel.provider];
  const navigatorLLM = createChatModel(navigatorProviderConfig, navigatorModel);

  let plannerLLM: BaseChatModel | null = null;
  const plannerModel = agentModels[AgentNameEnum.Planner];
  if (plannerModel) {
    // Log the provider config being used for the planner
    const plannerProviderConfig = providers[plannerModel.provider];
    plannerLLM = createChatModel(plannerProviderConfig, plannerModel);
  }

  let validatorLLM: BaseChatModel | null = null;
  const validatorModel = agentModels[AgentNameEnum.Validator];
  if (validatorModel) {
    // Log the provider config being used for the validator
    const validatorProviderConfig = providers[validatorModel.provider];
    validatorLLM = createChatModel(validatorProviderConfig, validatorModel);
  }

  const generalSettings = await generalSettingsStore.getSettings();
  const executor = new Executor(task, taskId, browserContext, navigatorLLM, {
    plannerLLM: plannerLLM ?? navigatorLLM,
    validatorLLM: validatorLLM ?? navigatorLLM,
    agentOptions: {
      maxSteps: generalSettings.maxSteps,
      maxFailures: generalSettings.maxFailures,
      maxActionsPerStep: generalSettings.maxActionsPerStep,
      useVision: generalSettings.useVision,
      useVisionForPlanner: generalSettings.useVisionForPlanner,
      planningInterval: generalSettings.planningInterval,
    },
  });

  return executor;
}

// Update subscribeToExecutorEvents to use port
async function subscribeToExecutorEvents(executor: Executor) {
  // Clear previous event listeners to prevent multiple subscriptions
  executor.clearExecutionEvents();

  // Subscribe to new events
  executor.subscribeExecutionEvents(async event => {
    try {
      if (currentPort) {
        currentPort.postMessage(event);
      }
    } catch (error) {
      logger.error('Failed to send message to side panel:', error);
    }

    if (
      event.state === ExecutionState.TASK_OK ||
      event.state === ExecutionState.TASK_FAIL ||
      event.state === ExecutionState.TASK_CANCEL
    ) {
      await currentExecutor?.cleanup();
    }
  });
}
