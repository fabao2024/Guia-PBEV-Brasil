// LangSmith tracing — dev only. Silently no-ops in production or when key is missing.

interface LLMTraceInput {
  userMessage: string;
  fullMessage: string; // may include RAG context prefix
  model: string;
  lang: string;
  ragUsed: boolean;
}

export async function traceLLMCall(
  input: LLMTraceInput,
  fn: () => Promise<string>
): Promise<string> {
  if (!import.meta.env.DEV) return fn();

  const apiKey = import.meta.env.VITE_LANGSMITH_API_KEY;
  if (!apiKey) return fn();

  try {
    const { RunTree, Client } = await import('langsmith');

    const client = new Client({ apiKey });
    const run = new RunTree({
      name: 'gemini-pbev',
      run_type: 'llm',
      inputs: {
        messages: [{ role: 'user', content: input.userMessage }],
        model: input.model,
        lang: input.lang,
        rag_used: input.ragUsed,
      },
      project_name: import.meta.env.VITE_LANGSMITH_PROJECT || 'guia-pbev',
      client,
    });

    await run.postRun();
    const t0 = performance.now();

    try {
      const result = await fn();
      await run.end({
        outputs: {
          content: result,
          latency_ms: Math.round(performance.now() - t0),
        },
      });
      await run.patchRun();
      return result;
    } catch (err) {
      await run.end({ error: String(err) });
      await run.patchRun();
      throw err;
    }
  } catch {
    // tracing failure must never break chat
    return fn();
  }
}
