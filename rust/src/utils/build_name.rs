use once_cell::sync::Lazy;
use regex::Regex;

static EXTENSION_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"\.(jsx|tsx)$").unwrap());
static LEADING_SLASH_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"^/").unwrap());
static PATH_SEP_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"[/\\]").unwrap());
static BRACKETS_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"\[(\w+)]").unwrap());
static NON_ALNUM_RE: Lazy<Regex> = Lazy::new(|| Regex::new("[^a-zA-Z0-9_]").unwrap());
static MULTI_UNDERSCORE_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"_+").unwrap());
static TRIM_UNDERSCORE_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"^_|_$").unwrap());
static SANITIZE_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"(\W+)").unwrap());

pub fn build_name(file: String, mut pack: String) -> String {
    if !pack.is_empty() {
        pack.push_str("_");
    }
    
    let file = EXTENSION_RE.replace(&file, "");
    let file = LEADING_SLASH_RE.replace(&file, "");
    let file = PATH_SEP_RE.replace(&file, "_");
    let file = BRACKETS_RE.replace(&file, "$1");
    let file = NON_ALNUM_RE.replace(&file, "_");
    let file = MULTI_UNDERSCORE_RE.replace(&file, "_");
    let file = TRIM_UNDERSCORE_RE.replace(&file, "");
    let file = SANITIZE_RE.replace_all(&file, "");

    let mut file = file.into_owned();

    file = file.replace(' ', "_");
    file = file.replace("(", "");
    file = file.replace(")", "");

    if !file.is_empty() {
        let mut chars = file.chars();
        if let Some(first) = chars.next() {
            file = first.to_uppercase().collect::<String>() + chars.as_str()
        }
    }

    format!("{pack}{file}")
}