/** @noSelfInFile */

declare module "cjson" {
    /** Deserialise any UTF-8 JSON string into an object

        UTF-16 and UTF-32 JSON strings are not supported.
    */
    function decode<T>(text: string): T;

    /** Serialise an object to a string

        The following types are supported:

            - `boolean`
            - `null`
            - `number`
            - `string`
            - `object`
            - `array`

        Other types will throw an error.

        By default, numbers are encoded with 14 significant digits.
        Refer to {@link encode_number_precision} for details.

        The following characters within each UTF-8 string will be escaped:

            - Control characters (ASCII 0 - 31)
            - Double quote (ASCII 34)
            - Forward slash (ASCII 47)
            - Blackslash (ASCII 92)
            - Delete (ASCII 127)

        All other bytes are passed transparently.

        ***Caution**: This method will successfully encode/decode binary strings,
        but this is technically not supported by JSON and may not be compatible
        with other JSON libraries. To ensure the output is valid JSON, applications
        should ensure all Lua strings passed to this method are UTF-8.
    */
    function encode<T>(obj: T): string;

    /** This setting defines behavior of {@link decode} method when it decodes
        numbers that are not supported by JSON spec: infinity, `NaN` and hexadecimals.

        @param enabled

        - `true` - accept and decode invalid numbers. This is the default setting.
        - `false` - throw an error when invalid numbers are encountered.

        The current setting is always returned, and is only updated when an argument is provided.
    */
    function decode_invalid_numbers(enabled?: boolean): boolean;

    /** {@link decode} will generate an error when parsing deeply nested JSON once
        the maximum array/object depth has been exceeded. This check prevents
        unnecessarily complicated JSON from slowing down the application, or crashing
        the application due to lack of process stack space.

        An error may be generated before the depth limit is hit if Lua is unable to
        allocate more objects on the Lua stack.

        By default, Lua CJSON will reject JSON with arrays and/or objects nested more
        than 1000 levels deep.

        The current setting is always returned, and is only updated when an argument is provided.
    */
    function decode_max_depth(setting?: number): number;

    /** If enabled, JSON Arrays decoded by {@link decode} will result in Lua tables with
        the {@link array_mt} metatable. This can ensure a 1-to-1 relationship between 
        arrays upon multiple encoding/decoding of your JSON data with this module.

        If disabled, JSON Arrays will be decoded to plain Lua tables, without the array_mt
        metatable.
    */
    function decode_array_with_array_mt(enabled: boolean): boolean;

    /** This setting defines behavior of {@link encode} method when it encodes
        numbers that are not supported by JSON spec: infinity, `NaN`

        @param setting

        - `true` - Allow invalid numbers to be encoded using the Javascript compatible 
        values `NaN` and `Infinity`. This will generate non-standard JSON, but these values
        are supported by some libraries.
        - "null" - Encode invalid numbers as a JSON null value. This allows infinity and `NaN`
        to be encoded into valid JSON.
        - `false` - Throw an error when attempting to encode invalid numbers. This is the default setting.

        The current setting is always returned, and is only updated when an argument is provided.
    */
    function encode_invalid_numbers(setting?: boolean | "null"): boolean | "null";

    /** Reuse the JSON encoding buffer to improve performance.

        - `true` - The buffer will grow to the largest size required and is not freed until the Lua CJSON
        module is garbage collected. This is the default setting.
        - `false` - Free the encode buffer after each call to cjson.encode.
    */
    function encode_keep_buffer(enabled?: boolean): boolean;

    /** Prevent a deeply nested or recursive data structure from crashing the application.

        By default, Lua CJSON will generate an error when trying to encode data structures
        with more than `1000` nested tables.

        The current setting is always returned, and is only updated when an argument is provided.
    */
    function encode_max_depth(setting?: number): number;

    /** The amount of significant digits returned by Lua CJSON when encoding numbers can be changed
        to balance accuracy versus performance. For data structures containing many numbers, setting
        `encode_number_precision` to a smaller integer, for example 3, can improve encoding performance
        by up to 50%.

        By default, Lua CJSON will output 14 significant digits when converting a number to text.
        Value can be between 1 and 16.

        The current setting is always returned, and is only updated when an argument is provided. */
    function encode_number_precision(setting?: number): number;

    /** Lua CJSON classifies a Lua table into one of three kinds when encoding a
        JSON array. This is determined by the number of values missing from the
        Lua array as follows:

        - Normal: All values are available.
        - Sparse: At least 1 value is missing.
        - Excessively sparse: The number of values missing exceeds the configured
        ratio.

        Lua CJSON encodes sparse Lua arrays as JSON arrays using JSON `null` for
        the missing entries.

        An array is excessively sparse when all the following conditions are
        met:

        - `ratio` > `0`
        - _maximum_index_ > `safe`
        - _maximum_index_ > _item_count_ * `ratio`

        Lua CJSON will never consider an array to be _excessively sparse_ when
        `ratio` = `0`. The `safe` limit ensures that small Lua arrays are always
        encoded as sparse arrays.

        By default, attempting to encode an _excessively sparse_ array will
        generate an error. If `convert` is set to `true`, _excessively sparse_
        arrays will be converted to a JSON object.

        The current settings are always returned. A particular setting is only
        changed when the argument is provided (non-`null`).

        Encoding a sparse array
        ```lua
        cjson.encode({ [3] = "data" })
        -- Returns: '[null,null,"data"]'
        ```

        Enabling conversion to a JSON object
        ```lua
        cjson.encode_sparse_array(true)
        cjson.encode({ [1000] = "excessively sparse" })
        -- Returns: '{"1000":"excessively sparse"}'
        ```
    */
    function encode_sparse_array(convert?: boolean, ratio?: number, safe?: number): LuaMultiReturn<[boolean, number, number]>;

    /** Change the default behavior when encoding an empty object or array.

        This is needed because Lua doesn't have distinction between objects and arrays.

        By default, empty objects and arrays are encoded as empty JSON Objects (`{}`).
        If this is set to `false`, empty objects and arrays will be encoded as empty JSON Arrays instead (`[]`).
    */
    function encode_empty_table_as_object(enabled?: boolean | "on" | "off"): boolean | "on" | "off";

    /** If enabled, forward slash '/' will be encoded as '\/'. (this is default)

        If disabled, forward slash '/' will be encoded as '/', i.e. no escape is applied.
    */
    function encode_escape_forward_slash(enabled?: boolean): boolean;

    /** This constant will be encoded as an empty JSON Array by {@link encode}.

        This is needed because Lua doesn't have distinction between objects and arrays.

        For example, since {@link encode_empty_table_as_object} is `true` by default:

        ```ts
            const json = cjson.encode({
                empty_array1 = [],
                empty_array2 = cjson.empty_array
            })
        ```

        will generate

        ```json
            {
                "empty_array1": {},
                "empty_array2": []
            }
        ```
    */
    const empty_array: any[];

    /** When cjson encodes an object with this metatable, it will systematically encode
        it as a JSON Array. The resulting, encoded Array will contain the array part of the table,
        and will be of the same length as the # operator on that table.

        Holes in the array will be encoded with the null JSON value.

        This is needed because Lua doesn't have distinction between objects and arrays.
    */
    const array_mt: any;

    /** A metatable which can "tag" an object as a JSON Array in case it is empty
        (that is, if the table has no elements, cjson.encode() will encode it as an
        empty JSON Array).

        This is needed because Lua doesn't have distinction between objects and arrays.
    */
    const empty_array_mt: any;
}
