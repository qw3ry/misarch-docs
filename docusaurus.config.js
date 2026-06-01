// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import lightTheme from "./prismLight.mjs";
import darkTheme from "./prismDark.mjs";

/** @type {import('@docusaurus/types').Config} */
export default {
    title: "MiSArch",
    tagline: "A representable microservice reference architecture",
    url: "https://misarch.github.io",
    favicon: "icons/misarch-logo.svg",
    baseUrl: "/misarch-docs",
    organizationName: "misarch",
    projectName: "misarch.github.io",
    onBrokenLinks: "throw",
    i18n: {
        defaultLocale: "en",
        locales: ["en"]
    },
    presets: [
        [
            "classic",
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve("./sidebars.mjs"),
                    remarkPlugins: [remarkMath],
                    rehypePlugins: [rehypeKatex]
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css")
                }
            })
        ]
    ],
    themes: [
        "@docusaurus/theme-mermaid",
        [
            require.resolve("@easyops-cn/docusaurus-search-local"),
            /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
            ({
                hashed: true,
                removeDefaultStopWordFilter: true,
                highlightSearchTermsOnTargetPage: true
            })
        ]
    ],
    themeConfig: {
        navbar: {
            title: "MiSArch",
            logo: {
                src: "icons/misarch-logo.svg",
                srcDark: "icons/misarch-logo-dark.svg"
            },
            items: [
                {
                    type: "search",
                    position: "left"
                },
                {
                    href: "https://github.com/MiSArch",
                    label: "GitHub",
                    position: "right"
                }
            ]
        },
        footer: {
            style: "dark",
            copyright: `Original documentation © 2026 MiSArch contributors. Unofficial fork © 2026 Tobias Eisenreich. Built with Docusaurus.`
        },
        prism: {
            theme: lightTheme,
            darkTheme: darkTheme,
            additionalLanguages: ["bash"]
        }
    },
    plugins: [
        [
            "@graphql-markdown/docusaurus",
            {
                id: "supergraph",
                schema: "supergraph.graphql",
                rootPath: ".",
                baseURL: `docs/graphql/schema`,
                docOptions: {
                    index: true
                },
                loaders: {
                    GraphQLFileLoader: "@graphql-tools/graphql-file-loader"
                }
            }
        ]
    ],
    markdown: {
        mermaid: true,
        hooks: {
            onBrokenMarkdownLinks: "throw"
        }
    },
    stylesheets: [
        {
            href: "https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css",
            type: "text/css",
            integrity: "sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM",
            crossorigin: "anonymous"
        }
    ]
};
