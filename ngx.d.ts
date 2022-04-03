/// <reference types="typescript-to-lua/language-extensions" />

type tExitCode = number & { _ngx_tExitCode: never };
type tRequestMethod = number & { _ngx_tRequestMethod: never };
type tResponseCode = number & { _ngx_tResponseCode: never };
type tLogLevel = number & { _ngx_tLogLevel: never };

declare const ngx: NgxModule;

/** @noSelf */
interface NgxModule {
    readonly OK: tExitCode;
    readonly ERROR: tExitCode;
    readonly DECLINED: tExitCode;

    readonly HTTP_GET: tRequestMethod;
    readonly HTTP_HEAD: tRequestMethod;
    readonly HTTP_PUT: tRequestMethod;
    readonly HTTP_POST: tRequestMethod;
    readonly HTTP_DELETE: tRequestMethod;
    readonly HTTP_OPTIONS: tRequestMethod;

    readonly HTTP_OK: tResponseCode;
    readonly HTTP_CREATED: tResponseCode;
    readonly HTTP_ACCEPTED: tResponseCode;
    readonly HTTP_NO_CONTENT: tResponseCode;
    readonly HTTP_PARTIAL_CONTENT: tResponseCode;
    readonly HTTP_SPECIAL_RESPONSE: tResponseCode;
    readonly HTTP_MOVED_PERMANENTLY: tResponseCode;
    readonly HTTP_MOVED_TEMPORARILY: tResponseCode;
    readonly HTTP_SEE_OTHER: tResponseCode;
    readonly HTTP_NOT_MODIFIED: tResponseCode;
    readonly HTTP_TEMPORARY_REDIRECT: tResponseCode;
    readonly HTTP_PERMANENT_REDIRECT: tResponseCode;
    readonly HTTP_BAD_REQUEST: tResponseCode;
    readonly HTTP_UNAUTHORIZED: tResponseCode;
    readonly HTTP_PAYMENT_REQUIRED: tResponseCode;
    readonly HTTP_FORBIDDEN: tResponseCode;
    readonly HTTP_NOT_FOUND: tResponseCode;
    readonly HTTP_NOT_ALLOWED: tResponseCode;
    readonly HTTP_NOT_ACCEPTABLE: tResponseCode;
    readonly HTTP_REQUEST_TIMEOUT: tResponseCode;
    readonly HTTP_CONFLICT: tResponseCode;
    readonly HTTP_GONE: tResponseCode;
    readonly HTTP_UPGRADE_REQUIRED: tResponseCode;
    readonly HTTP_TOO_MANY_REQUESTS: tResponseCode;
    readonly HTTP_CLOSE: tResponseCode;
    readonly HTTP_ILLEGAL: tResponseCode;
    readonly HTTP_INTERNAL_SERVER_ERROR: tResponseCode;
    readonly HTTP_NOT_IMPLEMENTED: tResponseCode;
    readonly HTTP_METHOD_NOT_IMPLEMENTED: tResponseCode;
    readonly HTTP_BAD_GATEWAY: tResponseCode;
    readonly HTTP_SERVICE_UNAVAILABLE: tResponseCode;
    readonly HTTP_GATEWAY_TIMEOUT: tResponseCode;
    readonly HTTP_VERSION_NOT_SUPPORTED: tResponseCode;
    readonly HTTP_INSUFFICIENT_STORAGE: tResponseCode;

    readonly STDERR: tLogLevel;
    readonly EMERG: tLogLevel;
    readonly ALERT: tLogLevel;
    readonly CRIT: tLogLevel;
    readonly ERR: tLogLevel;
    readonly WARN: tLogLevel;
    readonly NOTICE: tLogLevel;
    readonly INFO: tLogLevel;
    readonly DEBUG: tLogLevel;

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

    location: {
        /** Issues a synchronous but non-blocking Nginx Subrequest using uri.

            Subrequests are completely different from HTTP 301/302 redirection (via {@link ngx.redirect})
            and internal redirection (via {@link ngx.exec}).

            You should always read the request body (by either calling {@link ngx.req.read_body} or configuring `lua_need_request_body`)
            before initiating a subrequest.

            This API function (as well as {@link ngx.location.capture_multi}) always buffers the whole response body
            of the subrequest in memory. Thus, you should use cosockets and streaming processing instead if you have to handle
            large subrequest responses.

            For more details, see {@link https://github.com/openresty/lua-nginx-module#ngxlocationcapture Official documentation}
        */
        capture(uri: string, options?: NgxCaptureOptions): NgxCaptureResult;

        /** Just like {@link ngx.location.capture}, but supports multiple subrequests running in parallel.

            This function issues several parallel subrequests specified by the input table and returns their results in the same order.
        */
        capture_multi(requests: [string, NgxCaptureOptions?][]): LuaMultiReturn<NgxCaptureResult[]>;
    }

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
}

interface NgxVar {
    /** full original request line */
    readonly request: string;
    /** current URI in request, {@link http://nginx.org/en/docs/http/ngx_http_core_module.html#location normalized}
        
        The value of `uri` may change during request processing, e.g. when doing internal redirects, or when using index files.
    */
    readonly uri: string;
    /** arguments in the request line */
    readonly args: string;
    /** client address in a binary form, value’s length is always 4 bytes for IPv4 addresses or 16 bytes for IPv6 addresses */
    readonly binary_remote_addr: any;
    /** connection serial number */
    readonly connection: number;
    /** current number of requests made through a connection */
    readonly connection_requests: number;
    /** connection time in seconds with a milliseconds resolution */
    readonly connection_time: number;
    /** "Content-Length" request header field */
    readonly content_length: number;
    /** "Content-Type" request header field */
    readonly content_type: number;
    /** "on" if connection operates in SSL mode, otherwise, empty string */
    readonly https: "on" | "";
    /** "?"" if a request line has arguments, or an empty string otherwise */
    readonly is_args: "?" | "";
    /** current time in seconds with the milliseconds resolution */
    readonly msec: number;
    /** version of nginx */
    readonly nginx_version: number;
    /** PID of the worker process */
    readonly pid: number;
    /** request scheme, "http" or "https" */
    readonly scheme: string;
    /** name of the server which accepted a request */
    readonly server_name: string;
    /** port of the server which accepted a request */
    readonly server_port: string;
    /** request protocol, usually "HTTP/1.0", "HTTP/1.1", or "HTTP/2.0" */
    readonly server_protocol: string;
    /** local time in the ISO 8601 standard format */
    readonly time_iso8601: string;
    /** local time in the Common Log Format  */
    readonly time_local: string;
    /** host name */
    readonly hostname: string;
    /** in this order of precedence: host name from the request line, or host name from the "Host" request header field, or the server name matching a request */
    readonly host: string;
    /** client IP address */
    readonly remote_addr: string;
    /** client port */
    readonly remote_port: string;
    /** user name supplied with the Basic authentication */
    readonly remote_user: string;

    readonly http_referer: string | null;
    readonly http_host: string | null;
    readonly http_user_agent: string | null;
    readonly http_cookie: string | null;
}

/** @noSelf */
interface NgxRequest {
    /** Returns a boolean indicating whether the current request is an "internal request",
        i.e., a request initiated from inside the current Nginx server instead of from the client side.

        Subrequests are all internal requests and so are requests after internal redirects.
    */
    is_internal(): boolean;

    /** Returns a floating-point number representing the timestamp (including milliseconds as the decimal part)
        when the current request was created.

        The following example emulates the $request_time variable value (provided by ngx_http_log_module):

        See also {@link now ngx.now} and {@link update_time ngx.update_time}.

        @example const request_time = ngx.now() - ngx.req.start_time();
        
    */
    start_time(): number;

    /** Returns the HTTP version number for the current request as a number.

        Current possible values are 2.0, 1.0, 1.1, and 0.9. Returns nil for unrecognized values.
    */
    http_version(): number;

    /** Returns the original raw HTTP protocol header received by the Nginx server.

        By default, the request line and trailing CR LF terminator will also be included.

        @param no_request_line Pass true to exclude the request line from the result.
     */
    raw_header(no_request_line?: boolean): string;

    /** Retrieves the current request's request method name. Strings like "GET" and "POST" are returned instead of
        numerical method constants.

        If the current request is an Nginx subrequest, then the subrequest's method name will be returned.

        See also {@link set_method ngx.req.set_method}
    */
    get_method(): "GET" | "POST" | "HEAD" | "PUT" | "DELETE" | "OPTIONS";

    /** Overrides the current request's request method with the method_id argument.
        Currently only numerical method constants are supported, like {@link ngx.HTTP_POST}

        If the current request is an Nginx subrequest, then the subrequest's method will be overridden.
    */
    set_method(method_id: tRequestMethod): void;

    /** Rewrite the current request's (parsed) URI by the uri argument.
        The uri argument must be a string and cannot be of zero length, or an error will be thrown.

        @param jump The optional boolean jump argument can trigger location rematch (or location jump) as
        ngx_http_rewrite_module's rewrite directive, that is, when jump is true (default to false), this function
        will never return and it will tell Nginx to try re-searching locations with the new URI value at the later
        post-rewrite phase and jumping to the new location.

        Location jump will not be triggered otherwise, and only the current request's URI will be modified, which is
        also the default behavior. This function will return but with no returned values when the jump argument is
        false or absent altogether.

        @param binary Allows arbitrary binary URI data. By default, this argument is false and this function will throw out
        an error when the uri argument contains any control characters (ASCII Code 0 ~ 0x08, 0x0A ~ 0x1F and 0x7F).
    */
    set_uri(uri: string, jump?: boolean, binary?: boolean): void;

    /** Rewrite the current request's URI query arguments by the args argument.
        
        @param args
        Can be either a string or an object holding query arguments key-value pairs.
        In the former case, i.e., when the whole query-string is provided directly, the input string should already
        be well-formed with the URI encoding. For security considerations, this method will automatically escape any control
        and whitespace characters (ASCII code 0x00 ~ 0x20 and 0x7F).

        @example
        ngx.req.set_uri_args("a=3&b=hello%20world");
        ngx.req.set_uri_args({ a: 3, b: "hello world" });
    */
    set_uri_args(args: string | Record<string, any>): void;

    /** Returns an object holding all the current request URL query arguments.
        An optional tab argument can be used to reuse the table returned by this method.

        Note that a maximum of 100 request arguments are parsed by default (including those with the same name)
        and that additional request arguments are silently discarded to guard against potential denial of service attacks.
        When the limit is exceeded, it will return a second value which is the string "truncated".

        @param max_args Allows overriding 100 request arguments limit. If set to 0, all arguments are processed.
        Removing the `max_args` cap is strongly discouraged.

        @param tab Allows to reuse the table returned by this method.

        For more details, see {@link https://github.com/openresty/lua-nginx-module#ngxreqget_uri_args Official documentation}

        @example
        const [args, err] = ngx.req.get_uri_args();
    */
    get_uri_args<T = Record<string, any>>(max_args?: number, tab?: boolean): LuaMultiReturn<[T, "truncated" | null]>;

    /** Returns a Lua table holding all the current request POST query arguments (of the MIME type application/x-www-form-urlencoded).
        Call {@link ngx.req.read_body} to read the request body first or turn on the {@link https://github.com/openresty/lua-nginx-module#lua_need_request_body lua_need_request_body} directive to avoid errors.

        Multiple occurrences of an argument key will result in an array value holding all of the values for that key in order.

        Arguments without the =<value> parts are treated as boolean arguments.

        Empty key arguments are discarded.

        Note that a maximum of 100 request arguments are parsed by default (including those with the same name)
        and that additional request arguments are silently discarded to guard against potential denial of service attacks.
        When the limit is exceeded, it will return a second value which is the string "truncated".

        @param max_args Allows to override the 100 request arguments limit. If set to 0, all arguments are processed.
        Removing the `max_args` cap is strongly discouraged.

        @example
        ngx.req.read_body()
        const [args, err] = ngx.req.get_post_args();
     */
    get_post_args<T = Record<string, any>>(max_args?: number): LuaMultiReturn<[T, "truncated" | null]>;

    /** Returns an object holding all the current request headers.

        Note that the {@link ngx.var ngx.var.<header>} call, which uses core `$http_<header>` variables, may be more preferable
        for reading individual request headers.

        @example
        const host = ngx.req.get_headers()["Host"];
    */
    get_headers(max_headers?: number, raw?: boolean): Record<string, string | string[]>;

    /** Set the current request's request header named header_name to value header_value, overriding any existing ones.

        The input Lua string header_name and header_value should already be well-formed with the URI encoding.
        For security considerations, this method will automatically escape " ", """, "(", ")", ",", "/", ":", ";", "?",
        "<", "=", ">", "?", "@", "[", "]", "", "{", "}", 0x00-0x1F, 0x7F-0xFF in `header_name` and automatically
        escape 0x00-0x08, 0x0A-0x0F, 0x7F in `header_value`.

        By default, all the subrequests subsequently initiated by {@link ngx.location.capture} and {@link ngx.location.capture_multi} will inherit the new header.

        It is not an equivalent of nginx `proxy_set_header` directive (same is true about {@link ngx.req.clear_header}).
        `proxy_set_header` only affects the upstream request while ngx.req.set_header change the incoming request.
        Record the http headers in the access log file will show the difference.
        But you still can use it as an alternative of nginx proxy_set_header directive as long as you know the difference.
    */
    set_header(header_name: string, header_value: string): void;

    /** Clears the current request's request header named header_name.
        None of the current request's existing subrequests will be affected but subsequently initiated subrequests will inherit the change by default.
    */
    clear_header(header_name: string): void;

    /** Reads the client request body synchronously without blocking the Nginx event loop.

        If the request body is already read previously by turning on lua_need_request_body or by using other modules,
        then this function does not run and returns immediately.

        If the request body has already been explicitly discarded, either by the ngx.req.discard_body function or other modules,
        this function does not run and returns immediately.

        In case of errors, such as connection errors while reading the data, this method will throw out an exception
        or terminate the current request with a 500 status code immediately.
    */
    read_body(): void;

    /** Explicitly discard the request body, i.e., read the data on the connection and throw it away immediately
        (without using the request body by any means).

        This function is an asynchronous call and returns immediately.

        If the request body has already been read, this function does nothing and returns immediately.
    */
    discard_body(): void;

    /** Retrieves in-memory request body data. It returns a string rather than an object.
        Use the {@link ngx.req.get_post_args} function instead if the object is required.
    */
    get_body_data(): string;

    get_body_file(): string;

    /** Set the current request's request body using the in-memory data specified by the data argument. */
    set_body_data(data: string): void;

    /** Set the current request's request body using the in-file data specified by the file_name argument. */
    set_body_file(): string;

    /** Creates a new blank request body for the current request and initializes the buffer for later request body data writing
        via the {@link ngx.req.append_body} and {@link ngx.req.finish_body} APIs.
        
        If the buffer_size argument is specified, then its value will be used for the size of the memory buffer for body writing
        with {@link ngx.req.append_body}. If the argument is omitted, then the value specified by the standard `client_body_buffer_size`
        directive will be used instead.
    */
    init_body(buffer_size?: number): void;

    /** Append new data chunk specified by the `data_chunk` argument onto the existing request body created by the {@link ngx.req.init_body} call.

        It is important to always call the {@link ngx.req.finish_body} after all the data has been appended onto the current request body.
    */
    append_body(data_chunk: string): void;

    /** Completes the construction process of the new request body created by the {@link ngx.req.init_body} and {@link ngx.req.append_body}
        calls. */
    finish_body(): void;

    /** Returns a read-only cosocket object that wraps the downstream connection.
        Only `receive`, `receiveany` and `receiveuntil` methods are supported on this object.
        
        The socket object returned by this method is usually used to read the current request's body in a streaming fashion.
        Do not turn on the `lua_need_request_body` directive, and do not mix this call with {@link ngx.req.read_body} and
        {@link ngx.req.discard_body}.
    */
    socket(raw?: boolean): LuaMultiReturn<[any, string]>;
}

interface NgxCaptureOptions {
    /** Specify the subrequest's request method, which only accepts constants like ngx.HTTP_POST. */
    method?: tRequestMethod;

    /** Specify the subrequest's request body (string value only). */
    body?: string;

    /** Specify the subrequest's URI query arguments */
    args?: string | Record<string, string>;

    /** Specify an object to be the `ngx.ctx` table for the subrequest.
        It can be the current request's ngx.ctx table, which effectively makes the parent and its subrequest
        to share exactly the same context table.
    */
    ctx?: any;

    /* An object which holds the values to set the specified Nginx variables in the subrequest as this option's value. */
    vars?: Partial<NgxVar>;

    /** specify whether to copy over all the Nginx variable values of the current request to the subrequest in question.
        modifications of the Nginx variables in the subrequest will not affect the current (parent) request.
    */
    copy_all_vars?: boolean;

    /** Specify whether to share all the Nginx variables of the subrequest with the current (parent) request.
        Modifications of the Nginx variables in the subrequest will affect the current (parent) request.
        Enabling this option may lead to hard-to-debug issues due to bad side-effects and is considered bad and harmful.
        Only enable this option when you completely know what you are doing.
    */
    share_all_vars?: boolean;

    /** When set to true, the current (parent) request's request body will always be forwarded to the subrequest
        being created if the {@link body} option is not specified.

        The request body read by either {@link ngx.req.read_body} or `lua_need_request_body` will be directly forwarded to
        the subrequest without copying the whole request body data when creating the subrequest
        (no matter the request body data is buffered in memory buffers or temporary files).

        By default, this option is false and when the body option is not specified, the request body of the current (parent)
        request is only forwarded when the subrequest takes the PUT or POST request method.
    */
    always_forward_body?: boolean;
}

interface NgxCaptureResult {
    status: tResponseCode;
    header: Record<string, string | string[]>;
    /** holds the subrequest's response body data, which might be truncated. */
    body: string;
    /** indicates that {@link body} was truncated.

        The data truncation here can only be caused by those unrecoverable errors in your subrequests like the cases that the remote end aborts the connection prematurely in the middle of the response body data stream or a read timeout happens when your subrequest is receiving the response body data from the remote.
    */
    truncated: boolean;
}
