// Import React dependencies
import { useState, useEffect, useCallback } from 'react';
import { BaseService, BaseEntity, Observer } from './BaseService';

// Define a type for what the hook returns
type ServiceHook<TOptions extends BaseEntity, TState extends BaseEntity> = {
  options: TOptions;
  state: TState;
  updateOptions: (overrides: Partial<TOptions>) => void;
};

const useService = <TOptions extends BaseEntity, TState extends BaseEntity>(
  service: BaseService<TOptions, TState> | null,
  initOptions: TOptions,
  initState: TState,
): ServiceHook<TOptions, TState> => {
  const [options, setOptions] = useState<TOptions>(initOptions);
  const [state, setState] = useState<TState>(initState);

  useEffect(() => {
    if (!service) return;

    const observer: Observer<TOptions, TState> = {
      onOptionsChange: setOptions,
      onStateChange: setState,
    };

    service.subscribe(observer);
    return () => {
      service.unsubscribe(observer);
    };
  }, [service]);

  const updateOptions = useCallback((overrides: Partial<TOptions>) => {
    if (!service) return;
    service.updateOptions(overrides);
  }, [service]);

  return { options, state, updateOptions };
};

export default useService;
