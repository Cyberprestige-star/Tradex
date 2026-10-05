import { createClient } from '@/lib/supabase/browser';

export async function invokeUserFunction<T>(name: string, options?: { method?: 'GET' | 'POST'; body?: unknown; query?: Record<string,string> }) {
  const supabase = createClient();
  const method = options?.method ?? 'GET';
  const query = new URLSearchParams(options?.query ?? {});
  const suffix = query.toString() ? `?${query.toString()}` : '';

  const { data, error } = await supabase.functions.invoke<T>(`${name}${suffix}`, {
    method,
    body: options?.body,
  });
  if (error) throw error;
  return data as T;
}
