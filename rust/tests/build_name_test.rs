use phyre_core::utils::build_name::build_name;

#[test]
fn test_build_name() {
    let result1 = build_name("[id]".to_string(), "".to_string());
    assert_eq!(result1, "Id");

    let result2 = build_name("index".to_string(), "".to_string());
    assert_eq!(result2, "Index");

    let result3 = build_name("some/path".to_string(), "".to_string());
    assert_eq!(result3, "Some_path");

    let result4 = build_name("destroyedè{[()]}path".to_string(), "".to_string());
    assert_eq!(result4, "Destroyed_path");

    let result5 = build_name("spaced path".to_string(), "".to_string());
    assert_eq!(result5, "Spaced_path");
}