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
    readonly http_origin: string | null;
}
