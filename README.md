## Openresty Lua Types

Typescript types for openresty ([ngx_http_lua_module](https://github.com/openresty/lua-nginx-module)), designed to be used with [TypeScriptToLua](https://typescripttolua.github.io/).

Installation:
```
npm i -D openresty-lua-types
```

Update your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["openresty-lua-types"],
  }
}
```