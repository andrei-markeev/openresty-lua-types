/// <reference types="@typescript-to-lua/language-extensions" />
/// <reference path="./constants/exitcodes.d.ts" />
/// <reference path="./constants/requestmethods.d.ts" />
/// <reference path="./constants/responsecodes.d.ts" />
/// <reference path="./constants/loglevels.d.ts" />
/// <reference path="./ngx.location.d.ts" />
/// <reference path="./ngx.request.d.ts" />
/// <reference path="./ngx.shared.d.ts" />
/// <reference path="./ngx.var.d.ts" />
/// <reference path="./ngx.timer.d.ts" />
/// <reference path="./cjson.d.ts" />

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

    /** Explicitly specify the end of the response output stream. In the case of HTTP 1.1 chunked encoded output,
        it will just trigger the Nginx core to send out the "last chunk".

        When you disable the HTTP 1.1 keep-alive feature for your downstream connections, you can rely on well written HTTP clients
        to close the connection actively for you when you call this method. This trick can be used do background jobs without
        letting the HTTP clients to wait on the connection, as in the following example:

        ```nginx
        location = /async {
            keepalive_timeout 0;
            content_by_lua_block {
                ngx.say("got the task!")
                ngx.eof()  -- well written HTTP clients will close the connection at this point
                -- access MySQL, PostgreSQL, Redis, Memcached, and etc here...
            }
        }
        ```

        But if you create subrequests to access other locations configured by Nginx upstream modules, then you should configure those
        upstream modules to ignore client connection abortions if they are not by default. For example, by default the standard
        [ngx_http_proxy_module](http://nginx.org/en/docs/http/ngx_http_proxy_module.html) will terminate both the subrequest and the main
        request as soon as the client closes the connection, so it is important to turn on the
        [proxy_ignore_client_abort](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_ignore_client_abort) directive in your
        location block configured by [ngx_http_proxy_module](http://nginx.org/en/docs/http/ngx_http_proxy_module.html):

        ```nginx
        proxy_ignore_client_abort on;
        ```

        A better way to do background jobs is to use the {@link ngx.timer.at} API.

        Since `v0.8.3` this function returns `1` on success, or returns `nil` and a string describing the error otherwise.
    */
    eof(): LuaMultiReturn<[boolean, string]>;

    /** Sleeps for the specified seconds without blocking. One can specify time resolution up to 0.001 seconds (i.e., one millisecond).

        Behind the scenes, this method makes use of the Nginx timers.

        Since the `0.7.20` release, The `0` time argument can also be specified.

        This method was introduced in the `0.5.0rc30` release.
    */
    sleep(seconds: number): void;

    /** Escapes URI or URI component.

        Since `v0.10.16`, this function accepts an optional `type` argument. It accepts the following values (defaults to `2`):

        - `0`: escapes `str` as a full URI. Characters ` ` (space), `#`, `%`, `?`, 0x00 ~ 0x1F, 0x7F ~ 0xFF will be escaped.
        - `2`: escape `str` as a URI component. All characters except alphabetic characters, digits, `-`, `.`, `_`, `~` will be encoded as `%XX`.
    */
    escape_uri(str: string, type?: 0 | 2): string;

    /** Unescapes an escaped URI component. This is the inverse function of {@link escape_uri}.

        For example,
        ```lua
        ngx.say(ngx.unescape_uri("b%20r56+7"))
        ```
        gives the output `b r56 7`

        Invalid escaping sequences are handled in a conventional way: `%`s are left unchanged.
        Also, characters that should not appear in escaped string are simply left unchanged.

        For example,
        ```lua
        ngx.say(ngx.unescape_uri("try %search%%20%again%"))
        ```
        gives the output `try %search% %again%`

        (Note that `%20` following `%` got unescaped, even though it can be considered to be a part of invalid sequence.)
    */
    unescape_uri(str: string): string;

    /** Encode the object to a query args string according to the URI encoded rules.

        For example,
        ```lua
        ngx.encode_args({foo = 3, ["b r"] = "hello world"})
        ```
        yields `foo=3&b%20r=hello%20world`.

        The table keys must be strings.

        Multi-value query args are also supported. Just use a Lua table for the argument's value, for example:
        ```lua
        ngx.encode_args({baz = {32, "hello"}})
        ```
        gives `baz=32&baz=hello`.

        If the value table is empty and the effect is equivalent to the `nil` value.

        Boolean argument values are also supported, for instance,
        ```lua
        ngx.encode_args({a = true, b = 1})
        ```
        yields `a&b=1`.

        If the argument value is `false`, then the effect is equivalent to the `nil` value.

        This method was first introduced in the `v0.3.1rc27` release.
    */
    encode_args<T>(obj: T): string;

    /** Decodes a URI encoded query-string into a Lua table. This is the inverse function of {@link encode_args}.

        The optional `max_args` argument can be used to specify the maximum number of arguments parsed from the `str` argument. By default, a maximum of 100 request arguments are parsed (including those with the same name) and that additional URI arguments are silently discarded to guard against potential denial of service attacks. Since `v0.10.13`, when the limit is exceeded, it will return a second value which is the string `"truncated"`.

        This argument can be set to zero to remove the limit and to process all request arguments received:

        ```lua
        local args = ngx.decode_args(str, 0)
        ```

        Removing the `max_args` cap is strongly discouraged.

        This method was introduced in the `v0.5.0rc29`.
    */
    decode_args<T>(args_string: string): T;

    /** Encodes `str` to a base64 digest.

        Since the `0.9.16` release, an optional boolean-typed `no_padding` argument can be specified to control
        whether the base64 padding should be appended to the resulting digest (default to `false`, i.e., with padding enabled).
    */
    encode_base64(str: string, no_padding?: boolean): string;

    /** Decodes the `str` argument as a base64 digest to the raw form. Returns `nil` if `str` is not well formed. */
    decode_base64(str: string): string;

    /** 
        Calculates the CRC-32 (Cyclic Redundancy Code) digest for the `str` argument.

        This method performs better on relatively short `str` inputs (i.e., less than 30 ~ 60 bytes), as compared to {@link crc32_long}.
        The result is exactly the same as {@link crc32_long}.

        Behind the scene, it is just a thin wrapper around the `ngx_crc32_short` function defined in the Nginx core.

        This API was first introduced in the `v0.3.1rc8` release.
    */
    crc32_short(str: string): number;

    /** 
        Calculates the CRC-32 (Cyclic Redundancy Code) digest for the `str` argument.

        This method performs better on relatively long `str` inputs (i.e., longer than 30 ~ 60 bytes), as compared to {@link crc32_short}.
        The result is exactly the same as {@link crc32_short}.

        Behind the scene, it is just a thin wrapper around the `ngx_crc32_long` function defined in the Nginx core.

        This API was first introduced in the `v0.3.1rc8` release.
    */
    crc32_long(str: string): number;

    /** Computes the [HMAC-SHA1](https://en.wikipedia.org/wiki/HMAC) digest of the argument `str` and turns the result using the secret
        key `<secret_key>`.

        The raw binary form of the `HMAC-SHA1` digest will be generated, use {@link encode_base64}, for example, to encode the result
        to a textual representation if desired.

        For example,
        ```lua
            local key = "thisisverysecretstuff"
            local src = "some string we want to sign"
            local digest = ngx.hmac_sha1(key, src)
            ngx.say(ngx.encode_base64(digest))
        ```
        yields the output `R/pvxzHC4NLtj7S+kXFg/NePTmk=`

        This API requires the OpenSSL library enabled in the Nginx build (usually by passing the `--with-http_ssl_module` option to
        the `./configure` script).

        This function was first introduced in the `v0.3.1rc29` release.
    */
    hmac_sha1(key: string, str: string): string;

    /** Returns the hexadecimal representation of the MD5 digest of the `str` argument.

        For example,
        ```nginx
        location = /md5 {
            content_by_lua_block {
                ngx.say(ngx.md5("hello"))
            }
        }
        ```
        yields `5d41402abc4b2a76b9719d911017c592`.

        See {@link md5_bin} if the raw binary MD5 digest is required.
    */
    md5(str: string): string;

        /** Returns the binary form of the MD5 digest of the `str` argument.

        See {@link md5} if the hexadecimal MD5 digest is required.
    */
    md5_bin(str: string): string;

    /** Returns the binary form of the SHA-1 digest of the `str` argument.

        This function requires SHA-1 support in the Nginx build. (This usually just means OpenSSL should be installed while building Nginx).

        This function was first introduced in the `v0.5.0rc6`.
    */
    sha1_bin(str: string): string;

    /** Returns a quoted SQL string literal according to the MySQL quoting rules. */
    quote_sql_str(str: string): string;

    /** Returns current date (in the format `yyyy-mm-dd`) from the Nginx cached time (no syscall involved unlike Lua's date library).

        This is the local time.
    */
    today(): string;

    /** Returns the elapsed seconds from the epoch for the current time stamp from the Nginx cached time (no syscall involved unlike Lua's date library).

        Updates of the Nginx time cache can be forced by calling {@link update_time ngx.update_time} first.
    */
    time(): number;

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

    /** Returns a formatted string can be used as the cookie expiration time.
     
        @param sec is the timestamp in seconds (like those returned from {@link time})

        ```ts
        ngx.say(ngx.cookie_time(1290079655)) // yields "Thu, 18-Nov-10 11:27:35 GMT"
        ```
    */
    cookie_time(sec: number): string;

    /** Returns a formated string can be used in http headers (for example, being used in `Last-Modified` header).
        The parameter `sec` is the time stamp in seconds (like those returned from {@link time}

        ```ts
        ngx.say(ngx.http_time(1290079655)) // yields "Thu, 18 Nov 2010 11:27:35 GMT"
        ```
    */
    http_time(sec: number): string;

    /** Parse the http time string (as returned by {@link http_time} into seconds from beginning of epoch.
        Returns the seconds or `null` if the input string is in bad format.

        ```ts
        const time = ngx.parse_http_time("Thu, 18 Nov 2010 11:27:35 GMT")
        if (time === null) {
            // ...
        }
        ```
    */
    parse_http_time(str: string): number

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
    timer: NgxTimer;
}
