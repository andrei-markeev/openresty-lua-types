type tRequestMethod = number & { _ngx_tRequestMethod: never };
interface RequestMethodConstants {
    readonly HTTP_GET: tRequestMethod;
    readonly HTTP_HEAD: tRequestMethod;
    readonly HTTP_PUT: tRequestMethod;
    readonly HTTP_POST: tRequestMethod;
    readonly HTTP_DELETE: tRequestMethod;
    readonly HTTP_OPTIONS: tRequestMethod;
}
