use once_cell::sync::Lazy;
use regex::Regex;

static EXTENSION_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"\.(jsx|tsx)$").unwrap());
static PARAMS_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"\[(\w+)]").unwrap());
static INDEX_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"index$").unwrap());
static SANITIZE_RE: Lazy<Regex> = Lazy::new(|| Regex::new("[^a-zA-Z0-9_:/]").unwrap());


pub fn build_path(file: &str, parent_path: &str) -> String {
    let mut route_path = EXTENSION_RE.replace(file, "").to_lowercase();

    // Transform [id] to ':id'
    route_path = PARAMS_RE.replace_all(&route_path, ":$1").to_string();

    route_path = SANITIZE_RE.replace_all(&route_path, "").to_string();

    // Transform index.jsx to ''
    if route_path == "index" || route_path.ends_with("/index") {
        let new_path = INDEX_RE.replace(&route_path, "");

        if new_path.starts_with('/') {
            route_path = new_path[1..].to_string();
        } else {
            route_path = new_path.to_string();
        }
    }

    if !parent_path.is_empty() {
        route_path = route_path.replace(&parent_path, "");
    }

    if route_path.starts_with('/') {
        route_path = route_path[1..].to_string();
    }

    route_path
}