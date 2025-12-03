import prettier from "@prettier/sync";

export function formatCode(code) {
    return prettier.format(code, {
        parser: "babel",    // o "babel-ts" se TypeScript
        singleQuote: true,
        tabWidth: 4,        // <-- qui imposti 4 spazi
        useTabs: false      // assicurati di usare spazi e non tab
    });
}