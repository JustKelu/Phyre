use crate::read_files::RouteItem;
use crate::utils::build_name::build_name;
use crate::utils::build_route::build_route;
use crate::utils::build_tree::build_tree;


pub struct BuildResult {
    pub imports: String,
    pub exports: String,
}

pub fn build_router(files: &Vec<RouteItem>, path: &str, prefix: &str) -> BuildResult {
    let mut imports = String::new();
    let mut exports = String::new();

    let mut path_pack_prefix = if !prefix.is_empty() {
        if prefix.starts_with("/") {
            prefix[1..].to_string()
        } else {
            prefix.to_string()
        }
    } else {
        "".to_string()
    };

    if !path_pack_prefix.is_empty() {
        path_pack_prefix.push_str("_");
    }

    for entry in files {
        match entry {
            RouteItem::File(file) => {
                let normalized_name = build_name(file.to_string(),  "".to_string());
                
                exports.push_str(&build_route(file, &normalized_name, "", &prefix, &path_pack_prefix, true));
                imports.push_str(&build_tree(entry, &normalized_name, path, prefix, &path_pack_prefix, false).imports);
            }
            _ => {
                let result = build_tree(entry, "", path, prefix, &path_pack_prefix, true);
                imports.push_str(&result.imports);
                exports.push_str(&result.exports);
            }
        }
    }

    BuildResult {
        imports,
        exports,
    }
}