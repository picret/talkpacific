export abstract class BaseEntity {
  copy(overrides: Partial<this>): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, overrides);
  }
}

export type Observer<TOptions extends BaseEntity, TState extends BaseEntity> = {
  onOptionsChange?: (options: TOptions) => void;
  onStateChange?: (state: TState) => void;
};

export abstract class BaseService<TOptions extends BaseEntity, TState extends BaseEntity> {
  private state: TState;
  private options: TOptions;
  private observers: Set<Observer<TOptions, TState>>;

  constructor(options: TOptions, state: TState) {
    this.options = options;
    this.state = state;
    this.observers = new Set();
  }

  public getOptions(): TOptions {
    return this.options;
  }

  public updateOptions(overrides: Partial<TOptions>) {
    this.options = this.options.copy(overrides);
    this.observers.forEach(observer =>
      observer.onOptionsChange && observer.onOptionsChange(this.options)
    );
  }

  public getState(): TState {
    return this.state;
  }

  protected updateState(overrides: Partial<TState>): TState {
    const nextState = this.state.copy(overrides);
    this.state = nextState;
    this.observers.forEach(observer =>
      observer.onStateChange && observer.onStateChange(this.state)
    );
    return nextState;
  }

  protected updateStateFrom(func : (state: TState) => Partial<TState>): TState {
    return this.updateState(func(this.state));
  }

  public subscribe(observer: Observer<TOptions, TState>): void {
    if (this.options && observer.onOptionsChange) {
      observer.onOptionsChange(this.options);
    }
    if (this.state && observer.onStateChange) {
      observer.onStateChange(this.state);
    }
    this.observers.add(observer);
  }

  public unsubscribe(observer: Observer<TOptions, TState>): void {
    this.observers.delete(observer);
  }
}
