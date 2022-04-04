/** @noSelf */
interface NgxLocation {
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
