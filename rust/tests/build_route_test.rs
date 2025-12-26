use phyre_core::utils::build_route::build_route;

#[test]
pub fn build_route_test() {
    let name1 = "Index";
    let file1 = "index.jsx";
    let expected1 = format!("{{
        path: '',
        Component: IndexElement.default,
        loader: IndexElement?.loader,
        meta: IndexElement?.meta,
        ErrorBoundary: IndexElement?.onError,
    }},");
    let result1 = build_route(&file1.to_string(), name1, "", "", "", false);
    assert_eq!(result1, expected1);

    let name2 = "Index";
    let file2 = "admin/index.jsx";
    let expected2 = format!("{{
        path: 'admin/',
        Component: admin_IndexElement.default,
        loader: admin_IndexElement?.loader,
        meta: admin_IndexElement?.meta,
        ErrorBoundary: admin_IndexElement?.onError,
    }},");
    let result2 = build_route(&file2.to_string(), &name2, "", "/admin", "admin_", false);
    assert_eq!(result2, expected2);

    let name3 = "User_Home";
    let file3 = "user/Home.jsx";
    let expected3 = format!("{{
        path: 'user/home',
        Component: web_User_HomeElement.default,
        loader: web_User_HomeElement?.loader,
        meta: web_User_HomeElement?.meta,
        ErrorBoundary: web_User_HomeElement?.onError,
    }},");
    let result3 = build_route(&file3.to_string(), &name3, "", "/web", "web_", false);
    assert_eq!(result3, expected3);
}