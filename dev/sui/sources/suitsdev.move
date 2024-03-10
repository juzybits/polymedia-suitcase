/// To test @polymedia/suits devInspectAndGetReturnValues()
module polymedia_suits::dev
{
    use std::string::{String, utf8};

    public fun get_vector_u64(): vector<u64> {
        return vector[2, 4, 8, 16]
    }

    public fun get_string(): String {
        return utf8(b"hello world")
    }

    public fun get_vector_string(): vector<String> {
        return vector[
            utf8(b"red"),
            utf8(b"blue"),
            utf8(b"green"),
        ]
    }
}
