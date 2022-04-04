type tExitCode = number & { _ngx_tExitCode: never };

interface ExitCodeConstants {
    readonly OK: tExitCode;
    readonly ERROR: tExitCode;
    readonly DECLINED: tExitCode;
}