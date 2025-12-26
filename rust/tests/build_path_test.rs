use phyre_core::utils::build_path::build_path;

#[test]
fn test() {
    let result1 = build_path("[id]", "");
    assert_eq!(result1, ":id");

    let result2 = build_path("index", "");
    assert_eq!(result2, "");

    let result3 = build_path("some/path", "");
    assert_eq!(result3, "some/path");

    let result4 = build_path("destroyedè{[()]}path", "");
    assert_eq!(result4, "destroyedpath");

    let result5 = build_path("spaced path", "");
    assert_eq!(result5, "spacedpath");
}

#[test]
fn test_with_parent() {
    let result1 = build_path("[id]", "èéòçà°ù§[]{}()a1z0");
    assert_eq!(result1, ":id");
}