type NgxTimerCallback = (this: void, premature: boolean, ...userargs: any[]) => void;
/** @noSelf */
interface NgxTimer {
    /** Creates an Nginx timer with a user callback function as well as optional user arguments. */
    at: (delayInSeconds: number, callback: NgxTimerCallback, ...userargs: any[]) => LuaMultiReturn<[boolean, string | undefined]>;
    /** Timer will be created every delay seconds until the current Nginx worker process starts exiting. Delay cannot be 0. */
    every: (delayInSeconds: number, callback: NgxTimerCallback, ...userargs: any[]) => LuaMultiReturn<[boolean, string | undefined]>;
    /** Returns the number of timers currently running. */
    running_count: () => number;
    /** Returns the number of pending timers. */
    pending_count: () => number;
}