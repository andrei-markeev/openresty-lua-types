/// <reference types="typescript-to-lua/language-extensions" />
/// <reference path="./constants/exitcodes.d.ts" />
/// <reference path="./constants/requestmethods.d.ts" />
/// <reference path="./constants/responsecodes.d.ts" />
/// <reference path="./constants/loglevels.d.ts" />
/// <reference path="./ngx.location.d.ts" />
/// <reference path="./ngx.request.d.ts" />
/// <reference path="./ngx.shared.d.ts" />
/// <reference path="./ngx.var.d.ts" />

declare const ngx: NgxModule;

/** @noSelf */
interface NgxModule extends ExitCodeConstants, RequestMethodConstants, ResponseCodeConstants, LogLevelConstants
{
    /** Emits arguments concatenated to the HTTP client (as response body).
        If response headers have not been sent, this function will send headers out first and then output body data.

        Please note that both `ngx.print` and {@link ngx.say} will always invoke the whole Nginx output body filter chain,
        which is an expensive operation. So be careful when calling either of these two in a tight loop; better buffer the data
        yourself.
    */
    print(...args: string[]): LuaMultiReturn<[1 | null, string | null]>;

    /** Just as {@link ngx.print} but also emit a trailing newline. */
    say(...args: string[]): LuaMultiReturn<[1 | null, string | null]>;

    /** Log arguments concatenated to error.log with the given logging level. */
    log(level: tLogLevel, ...args: any[]): LuaMultiReturn<[1 | null, string | null]>;

    /** Flushes response output to the client.
        @param wait Wait for output data to be written into the system send buffer, i.e. the call will be synchronous.
        Note that using the Lua coroutine mechanism means that this function does not block the Nginx event loop even in the synchronous mode.
    */
    flush(wait?: boolean): void;

    /** When status >= 200 (i.e., `ngx.HTTP_OK` and above), it will interrupt the execution of the current request and return
        status code to Nginx.

        When status == 0 (i.e., ngx.OK), it will only quit the current phase handler (or the content handler if the content_by_lua* directive is used)
        and continue to run later phases (if any) for the current request.

        To return an error page with custom contents, set {@link nginx.status} and then use `ngx.exit(ngx.HTTP_OK)`.
    */
    exit(status: tExitCode | tResponseCode): void;

    /** Returns a floating-point number for the elapsed time in seconds (including milliseconds as the decimal part)
        from the epoch for the current time stamp from the Nginx cached time (no syscall involved unlike Lua's date library).

        You can forcibly update the Nginx time cache by calling {@link update_time ngx.update_time} first.
    */
    now(): number;

    /** Forcibly updates the Nginx current time cache. This call involves a syscall and thus has some overhead,
        so do not abuse it. */
    update_time(): void;

    /** Returns the current time stamp (in the format yyyy-mm-dd hh:mm:ss) of the Nginx cached time
        (no syscall involved unlike Lua's os.date function).

        This is the local time.
    */
    localtime(): string;

    /** Returns the current time stamp (in the format yyyy-mm-dd hh:mm:ss) of the Nginx cached time
        (no syscall involved unlike Lua's os.date function).

        This is the UTC time.
    */
    utctime(): string;

    /** Issue an HTTP 301 or 302 redirection to uri.

        Note: this function throws a Lua error if the uri argument contains unsafe characters (control characters).
    */
    redirect(uri: string, status?: tResponseCode): void;

    /** Does an internal redirect to uri with args and is similar to the {@link https://github.com/openresty/echo-nginx-module#echo_exec echo_exec} directive. */
    exec(uri: string, args?:string): void;

    /** Read and write the current request's response status. This should be called before sending out the response headers. */
    status: tResponseCode;

    /** Set, add to, or clear the current request's response header that is to be sent.

        Underscores (_) in the header names will be replaced by hyphens (-) by default.
        This transformation can be turned off via the `lua_transform_underscores_in_response_headers` directive.
    */
    header: Record<string, string>;

    /** This object can be used to store per-request context data and has a life time identical to the current request
        (as with the Nginx variables).
    */
    ctx: Record<string, any>;

    var: NgxVar;
    req: NgxRequest;
    shared: { [key: string]: NgxSharedDict<any> };
    location: NgxLocation;
}
