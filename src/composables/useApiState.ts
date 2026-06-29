import { reactive, toRefs } from 'vue';

export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  errorCode: string | null;
  isEmpty: boolean;
}

export function useApiState<T>() {
  const state = reactive<ApiState<T>>({
    data: null,
    isLoading: false,
    isError: false,
    errorMessage: null,
    errorCode: null,
    isEmpty: false,
  });

  async function execute(apiFn: () => Promise<T>) {
    state.isLoading = true;
    state.isError = false;
    state.errorMessage = null;
    state.errorCode = null;
    try {
      const result = await apiFn();
      state.data = result as any;
      state.isEmpty = Array.isArray(result) ? result.length === 0 : !result;
      return result;
    } catch (err: any) {
      state.isError = true;
      state.errorCode = err.response?.data?.error?.code || null;
      state.errorMessage = err.response?.data?.error?.message || err.message || 'Đã xảy ra lỗi';
      throw err;
    } finally {
      state.isLoading = false;
    }
  }

  return {
    ...toRefs(state),
    execute,
  };
}
