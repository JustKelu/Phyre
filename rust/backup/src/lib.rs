use napi_derive::napi;
use std::path::Path;
use std::fs::read_dir;
use regex::Regex;

#[napi]
pub enum RouteItem {
    Tree(RouteTree),
    File(String)
}

#[napi(object)]
pub struct RouteTree {
    pub path: String,
    pub component: String,
    pub children: Vec<RouteItem>
}

#[napi]
pub fn read_files(dir_path: String, base_path: String, current_prefix: String) -> Vec<RouteItem> {
    let full_path = Path::new(&base_path).join(dir_path);
    let re = Regex::new(r"(?i)_layout\.(jsx|tsx)$").unwrap();

    internal_scanner(&full_path, &current_prefix, &re)
}

fn internal_scanner(full_path: &Path, current_prefix: &str, re: &Regex) -> Vec<RouteItem> {
    let entries: Vec<_> = read_dir(full_path)
        .unwrap()
        .filter_map(Result::ok)
        .collect();

    let mut files = Vec::<RouteItem>::new();
    let layout = entries.iter()
        .find(|entry| {
            if let Some(file_name) = entry.file_name().to_str() {
                re.is_match(file_name)
            } else {
                false
            }
        });

    for entry in &entries {
        let file_name = entry.file_name().to_str().unwrap().to_string();
        
        if file_name.starts_with(".") { continue; };
        if re.is_match(&file_name) { continue; };

        let file_type = entry.file_type().unwrap();
        
        let file_path = if current_prefix.is_empty() {
            format!("/{}", file_name)
        } else if current_prefix == "/" {
            format!("/{}", file_name)
        } else {
            format!("{}/{}", current_prefix, file_name)
        };

        if file_type.is_dir() {
            let nested = internal_scanner(&entry.path(), &file_path, re);
            
            files.extend(nested);
        } else {
            files.push(RouteItem::File(file_path));
        }
    }

    if let Some(layout_entry) = layout {
        vec![RouteItem::Tree(RouteTree {
            path: current_prefix.to_string(),
            component: layout_entry.file_name().to_string_lossy().to_string(),
            children: files, 
        })]
    } else {
        files
    }
}