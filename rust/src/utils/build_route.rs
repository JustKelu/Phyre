use crate::utils::build_path::build_path;

pub fn build_route(file: &String, normalized_name: &str, parent_path: &str, prefix: &str, path_pack_prefix: &str, is_root: bool) -> String {
    let mut path = build_path(file, parent_path);

    let new_prefix = if prefix.starts_with('/') {
        &prefix[1..]
    } else {
        prefix
    };


    if is_root && !new_prefix.is_empty() {
        path = format!("{}/{}", new_prefix, path)
    }

    let component_name = format!("{path_pack_prefix}{}Element", normalized_name);
    
    format!("{{
        path: '{path}',
        Component: {component_name}.default,
        loader: {component_name}?.loader,
        meta: {component_name}?.meta,
        ErrorBoundary: {component_name}?.onError,
    }},")
}