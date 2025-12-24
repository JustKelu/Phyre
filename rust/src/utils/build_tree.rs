use std::env;
use std::path::{Path, PathBuf};
use crate::build_router::BuildResult;
use crate::read_files::RouteItem;
use once_cell::sync::Lazy;
use regex::Regex;
use crate::utils::build_name::build_name;
use crate::utils::build_route::build_route;

static PATH_RE: Lazy<Regex> = Lazy::new(|| Regex::new("(w+)/").unwrap());

fn get_relative_path(base: &str, to_path: &str) -> String {
    let user_dir = match env::current_dir() {
        Ok(dir) => dir,
        Err(_) => return String::new(),
    };

    // Normalizza i path come fa JavaScript
    let base_path = if Path::new(base).is_absolute() {
        PathBuf::from(base)
    } else {
        user_dir.join(base)
    };

    let full_path = if Path::new(to_path).is_absolute() {
        PathBuf::from(to_path)
    } else {
        base_path.join(to_path)
    };

    // Prova a fare relative path
    match full_path.strip_prefix(&user_dir) {
        Ok(relative) => relative
            .to_str()
            .unwrap_or("")
            .replace('\\', "/"),
        Err(_) => {
            // Se fallisce, prova almeno a normalizzare
            full_path
                .to_str()
                .unwrap_or("")
                .replace('\\', "/")
        }
    }
}

fn format_name(normalized_name: &str, path_pack_prefix: &str) -> String {
    format!("{path_pack_prefix}{normalized_name}Element")
}

pub fn build_tree(tree: &RouteItem, normalized_name: &str, base_path: &str, prefix: &str, path_pack_prefix: &str, is_root: bool) -> BuildResult {
    if let RouteItem::File(_) = tree {
        let component_name = format!("{path_pack_prefix}{}Element", normalized_name);

        return BuildResult {
            imports: format!("import * as {component_name} from '../../{}';\n", get_relative_path(base_path, normalized_name)),
            exports: String::new(),
        };
    }

    if let RouteItem::Tree(tree) = tree {
        let route_path = if !tree.path.is_empty() {
            PATH_RE.replace(tree.path.as_ref(), "").to_string()
        } else {
            "".to_string()
        };

        let layout_path = if is_root {
            let mut path = prefix.replace('/', "");
            path.push_str("/");
            path.push_str(&tree.path);
            path
        } else {
            route_path
        };

        let layout_name = build_name(format!("{layout_path}{}", tree.component), "".to_string());
        
        let children_exports =
            tree.children.iter().map(|entry| {
                match entry {
                    RouteItem::File(file) => {
                        let normalized_name = build_name(file.to_string(),  "".to_string());

                        build_route(
                            file,
                            &normalized_name,
                            &tree.path,
                            prefix,
                            &path_pack_prefix,
                            false
                        )
                    },
                    _ => {
                        build_tree(
                            entry,
                            "",
                            base_path,
                            prefix,
                            path_pack_prefix,
                            false
                        ).exports
                    }
                }
            })
                .collect::<Vec<String>>()
                .join("");

        let path = if layout_path.starts_with("/") {
            &layout_path[1..]
        } else {
            &layout_path
        };

        let exports = format!("{{
        path: '{path}',
        Component: {layout_name}.default,
        loader: {layout_name}?.loader,
        meta: {layout_name}?.meta,
        ErrorBoundary: {layout_name}?.onError,
        children: [{children_exports}],
        }},");

        let mut imports = format!("import * as {layout_name} from '../../{}';\n", get_relative_path(base_path, &tree.component));
        imports.push_str(
            &tree.children.iter().map(|entry| {
                match entry {
                    RouteItem::File(file) => {
                        let normalized_file = if file.starts_with('/') { &file[1..] } else { file };
                        let component_name = build_name(normalized_file.to_string(), "".to_string());

                        format!("import * as {} from '../../{}';\n",
                                format_name(&component_name, path_pack_prefix),
                                get_relative_path(base_path, &normalized_file)
                        )
                    },
                    _ => {
                        build_tree(
                            entry,
                            "",
                            base_path,
                            prefix,
                            path_pack_prefix,
                            false
                        ).imports
                    }
                }
            })
            .collect::<Vec<String>>()
            .join("")
        );

        return BuildResult {
            imports,
            exports,
        }
    }

    BuildResult {
        imports: "".to_string(),
        exports: "".to_string(),
    }
}