import { useContext, useEffect, useState } from 'react';
import { PlatformContext } from '../platform/PlatformContext';

interface InstanceOptions<T> {
  webClass?: new (...args: any[]) => T;
  desktopClass?: new (...args: any[]) => T;
}

export function createUseInstance<T>({ webClass, desktopClass }: InstanceOptions<T>) {
  return (): T | null => {
    const context = useContext(PlatformContext);
    const [instance, setInstance] = useState<T | null>(null);

    useEffect(() => {
      if (context.isDesktop() && desktopClass) {
        setInstance(new desktopClass(context));
      } else if (webClass) {
        setInstance(new webClass(context));
      } else {
        setInstance(null);
      }
    }, [context]);

    return instance;
  };
}
