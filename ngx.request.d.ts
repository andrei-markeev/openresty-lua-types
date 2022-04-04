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
