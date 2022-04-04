interface NgxSharedDict<T> {
    /** Retrieving the value in the dictionary `ngx.shared.DICT` for the key `key`.
        If the key does not exist or has expired, then `null` will be returned.

        In case of errors, `null` and a string describing the error will be returned.

        The value returned will have the original data type when they were inserted into the dictionary,
        for example, Lua booleans, numbers, or strings.
    */
    get<K extends keyof T>(key: K): LuaMultiReturn<[T[K] | null, string | number | undefined]>;

    /** Similar to the get method but returns the value even if the key has already expired.

        Returns a 3rd value, stale, indicating whether the key has expired or not.
    */
    get_stale<K extends keyof T>(key: K): LuaMultiReturn<[T[K] | null, string | number, boolean]>;

    /** Unconditionally sets a key-value pair into the shm-based dictionary ngx.shared.DICT.

        Returns three values:
        - `success`: boolean value to indicate whether the key-value pair is stored or not.
        - `err`: textual error message, can be "no memory".
        - `forcible`: a boolean value to indicate whether other valid items have been removed
        forcibly when out of storage in the shared memory zone.

        @param key Uniquely identifies the value to be stored.
        @param value Can be booleans, numbers, strings, or null.
        The value type will also be stored into the dictionary and the same data type can be retrieved later via the {@link get} method.
        @param exptime Specifies expiration time (in seconds) for the inserted key-value pair.
        The time resolution is 0.001 seconds. If the exptime takes the value 0 (which is the default), then the item will never expire.
        @param flags Specifies a user flags value associated with the entry to be stored.
        It can also be retrieved later with the value. The user flags is stored as an unsigned 32-bit integer internally. Defaults to `0`.
    */
    set<K extends keyof T>(key: K, value: T[K], exptime?: number, flags?: number): LuaMultiReturn<[boolean, string, boolean]>;

    /** Similar to the {@link set} method, but never overrides the (least recently used) unexpired items in the store
        when running out of storage in the shared memory zone. In this case, it will immediately return nil and the string "no memory".
    */
    safe_set<K extends keyof T>(key: K, value: T[K], exptime?: number, flags?: number): LuaMultiReturn<[boolean, string]>;

    /** Just like the {@link set} method, but only stores the key-value pair into the dictionary `ngx.shared.DICT` if the key does not exist. */
    add<K extends keyof T>(key: K, value: T[K], exptime?: number, flags?: number): LuaMultiReturn<[boolean, string, boolean]>;

    /** Similar to the {@link add} method, but never overrides the (least recently used) unexpired items in the store
        when running out of storage in the shared memory zone. In this case, it will immediately return nil and the string "no memory".
    */
    safe_add<K extends keyof T>(key: K, value: T[K], exptime?: number, flags?: number): LuaMultiReturn<[boolean, string]>;

    /** Just like the set method, but only stores the key-value pair into the dictionary `ngx.shared.DICT` if the key does exist. */
    replace<K extends keyof T>(key: K, value: T[K], exptime?: number, flags?: number): LuaMultiReturn<[boolean, string, boolean]>;

    /** Unconditionally removes the key-value pair from the shm-based dictionary `ngx.shared.DICT`.

        It is equivalent to ngx.shared.DICT:set(key, nil).
    */
    delete<K extends keyof T>(key: K): void;

    /** Increments the (numerical) value for key in the shm-based dictionary `ngx.shared.DICT` by the step value `value`.
        Returns the new resulting number if the operation is successfully completed or `null` and an error message otherwise. */
    incr<K extends keyof T>(key: K, value: NumberValue<T, K>, init?: number, init_ttl?: number): LuaMultiReturn<[number, string]>;

    /** Inserts the specified (numerical or string) value at the head of the list named `key` in the shm-based dictionary `ngx.shared.DICT`.
        Returns the number of elements in the list after the push operation. */
    lpush<K extends keyof T>(key: K, value: NumberOrStringOfArray<T, K>): LuaMultiReturn<[number, string]>;

    /** Similar to the {@link lpush} method, but inserts the specified (numerical or string) value at the tail of the list named `key`. */
    rpush<K extends keyof T>(key: K, value: NumberOrStringOfArray<T, K>): LuaMultiReturn<[number, string]>;

    /** Removes and returns the first element of the list named key in the shm-based dictionary `ngx.shared.DICT`.

        If key does not exist, it will return `null`. When the key already takes a value that is not a list, it will return `null` and "value not a list"
    */
    lpop<K extends keyof T>(key: K): LuaMultiReturn<[NumberOrStringOfArray<T, K> | null, string]>;

    /** Removes and returns the last element of the list named key in the shm-based dictionary `ngx.shared.DICT`.

        If key does not exist, it will return `null`. When the key already takes a value that is not a list, it will return `null` and "value not a list"
    */
    rpop<K extends keyof T>(key: K): LuaMultiReturn<[NumberOrStringOfArray<T, K> | null, string]>;

    /** Returns the number of elements in the list named key in the shm-based dictionary ngx.shared.DICT.

        If key does not exist, it is interpreted as an empty list and 0 is returned. When the key already takes a value that is not a list, it will return nil and "value not a list".
    */
    llen<K extends keyof T>(key: K): LuaMultiReturn<[number | null, string]>;

    /** Retrieves the remaining TTL (time-to-live in seconds) of a key-value pair in the shm-based dictionary `ngx.shared.DICT`.
        Returns the TTL as a number if the operation is successfully completed or `null` and an error message otherwise.

        If the key does not exist (or has already expired), this method will return `null` and the error string "not found". */
    ttl<K extends keyof T>(key: K): LuaMultiReturn<[number | null, string]>;

    /** Updates the exptime (in second) of a key-value pair in the shm-based dictionary `ngx.shared.DICT`.
        Returns a boolean indicating success if the operation completes or `null` and an error message otherwise.

        If the key does not exist, this method will return `null` and the error string "not found".

        The exptime argument has a resolution of `0.001` seconds. If exptime is 0, then the item will never expire.
    */
    expire<K extends keyof T>(key: K, exptime: number): LuaMultiReturn<[boolean | null, string]>;

    /** Flushes out all the items in the dictionary.
        This method does not actually free up all the memory blocks in the dictionary but just marks all the existing items as expired.
    */
    flush_all(): void;

    /** Flushes out the expired items in the dictionary, up to the maximal number specified by the optional `max_count` argument.
        When the `max_count` argument is given `0` or not given at all, then it means unlimited.
        Returns the number of items that have actually been flushed.

        Unlike the {@link flush_all} method, this method actually frees up the memory used by the expired items.
    */
    flush_expired(max_count: number): number;

    /** Fetch a list of the keys from the dictionary, up to `max_count`.

        By default, only the first 1024 keys (if any) are returned. When the `max_count` argument is given the value `0`,
        then all the keys will be returned even there is more than `1024` keys in the dictionary.

        CAUTION: Avoid calling this method on dictionaries with a very large number of keys as it may lock the dictionary
        for significant amount of time and block Nginx worker processes trying to access the dictionary.
    */
    get_keys(max_count?: number): string[];

    /** Retrieves the capacity in bytes for the shm-based dictionary `ngx.shared.DICT` declared with the `lua_shared_dict` directive.

        Example:
        ```
        import "resty.core.shdict";

        const capacity_bytes = ngx.shared.cats.capacity();
        ```

        Note: This method requires the `resty.core.shdict` or `resty.core` modules from the `lua-resty-core` library.
    */
    capacity(): number;

    /** Retrieves the free page size in bytes for the shm-based dictionary `ngx.shared.DICT`.

        Note: The memory for `ngx.shared.DICT` is allocated via the Nginx slab allocator which has each slot
        for data size ranges like ~8, 9~16, 17~32, ..., 1025~2048, 2048~ bytes.
        And pages are assigned to a slot if there is no room in already assigned pages for the slot.

        So even if the return value of the free_space method is zero, there may be room in already assigned pages,
        so you may successfully set a new key value pair to the shared dict without getting true for forcible
        or non `null` err from the {@link set} method.

        On the other hand, if already assigned pages for a slot are full and a new key value pair is added
        to the slot and there is no free page, you may get true for forcible or non `null` err from the {@link set} method.
    */
    free_space(): number;
}

type NumberValue<T, K extends keyof T> = T[K] extends number ? number : never;
type NumberOrStringOfArray<T, K extends keyof T> = T[K] extends string[] ? string : T[K] extends number[] ? number : never;
