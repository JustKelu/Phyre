mod read_files;
mod build_router;
pub mod utils;

use std::env;
use napi_derive::napi;
use crate::build_router::build_router;
use crate::read_files::scanner;
use std::fs::{write, create_dir_all};

#[napi(object)]
pub struct PhyrePackage {
    pub name: String,
    pub prefix: String,
}

#[napi(object)]
pub struct Monorepo {
    pub use_pack_structure: Option<bool>,
    pub packages: Option<Vec<PhyrePackage>>,
}

#[napi]
pub fn route_scanner(config: Option<Monorepo>)  {
    let monorepo = match config {
        Some(value) => {
            value
        },
        None => return
    };

    let use_pack_structure = if let Some(use_pack_structure) = monorepo.use_pack_structure {
        use_pack_structure
    } else {
        false
    };

    let user_dir = match env::current_dir() {
        Ok(dir) => dir,
        Err(_) => return
    };

    let mut imp = String::new();
    let mut exp = String::from("export const routes = [\n");
    let current_prefix = "";

    if use_pack_structure {
        let packages = match monorepo.packages {
            Some(packages) => packages,
            None => return
        };

        for pack in packages {
            let path = format!("packages/{}/src/client/routes", pack.name);
            let files = scanner(&path, &user_dir, current_prefix);

            let result = build_router(&files, &path, &pack.prefix);

            imp.push_str(&result.imports);
            exp.push_str(&result.exports);
        }
    } else {
        let path = "src/client/routes";

        let files = scanner(&path, &user_dir, current_prefix);
        let result = build_router(&files, &path, "");

        imp.push_str(&result.imports);
        exp.push_str(&result.exports);
    }

    exp.push_str("\n]");

    let output = format!("{imp}\n{exp}");
    let output_dir = user_dir.join(".phyre").join("routes");
    
    create_dir_all(&output_dir).unwrap();
    write(output_dir.join("import-routes.jsx"), &output).unwrap();
}