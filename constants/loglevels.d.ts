type tLogLevel = number & { _ngx_tLogLevel: never };

interface LogLevelConstants {
    readonly STDERR: tLogLevel;
    readonly EMERG: tLogLevel;
    readonly ALERT: tLogLevel;
    readonly CRIT: tLogLevel;
    readonly ERR: tLogLevel;
    readonly WARN: tLogLevel;
    readonly NOTICE: tLogLevel;
    readonly INFO: tLogLevel;
    readonly DEBUG: tLogLevel;
}