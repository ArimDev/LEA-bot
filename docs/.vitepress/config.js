import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Příručka LEA",
    description: "VegasRP",
    base: '/docs/',

    lastUpdated: true,
    cleanUrls: true,
    metaChunk: true,
    head: [
        ['link', { rel: 'icon', href: '/docs/media/logo/leabot.png' }],
        ['meta', { property: 'og:image', content: '/docs/media/logo/leabot.png' }],
        ['meta', { name: 'og:site_name', content: 'VegasRP' }],
        ['meta', { name: 'twitter:card', content: 'summary' }],
        ['meta', { name: 'theme-color', content: '#ffffff' }]
    ],

    transformPageData(pageData) {
        pageData.frontmatter.head ??= [];
        pageData.frontmatter.head.push([
            'meta', { name: 'og:title', content: pageData.frontmatter.title ? ("LEA Příručka | " + pageData.frontmatter.title) : "LEA Příručka" },
            'meta', { name: 'og:description', content: pageData.frontmatter.description || "Příručka se vším všudy!" }
        ]);
    },

    themeConfig: {

        // https://vitepress.dev/reference/default-theme-config

        logo: '/media/logo/leabot.png',

        outline: {
            label: "Obsah stránky"
        },

        docFooter: {
            prev: 'Předchozí stránka',
            next: 'Následující stránka'
        },

        lastUpdated: {
            text: 'Aktualizováno',
            formatOptions: {
                dateStyle: 'long',
                timeStyle: 'short'
            }
        },

        search: {
            provider: 'local',
            options: {
                locales: {
                    root: {
                        translations: {
                            button: {
                                buttonText: 'Hledat',
                            },
                            modal: {
                                displayDetails: 'Zobrazení',
                                resetButtonTitle: 'Smazat',
                                backButtonTitle: 'Zpět',
                                noResultsText: 'Žádné výsledky pro',
                                footer: {
                                    selectText: 'Přejít na',
                                    navigateText: 'Výběr',
                                    closeText: 'Zavřít'
                                }
                            }
                        }
                    }
                }
            }
        },

        nav: [
            { text: 'Home', link: '/' },
            {
                text: 'Návody', link: '/navody/pravidla',
                activeMatch: '/navody/'
            },
            {
                text: 'Bot', link: '/bot/uvod',
                activeMatch: '/bot/'
            },
            {
                text: 'Tabulky', link: 'https://leabot.petyxbron.cz/',
                target: '_self',
            }
        ],

        sidebar: {
            '/navody/': {
                base: '/navody/', items: [
                    {
                        text: 'Pravidla',
                        collapsed: false,
                        items: [
                            { text: 'Interní pravidla LEA', link: 'pravidla' },
                            { text: 'Výchovné tresty', link: 'tresty' },
                            { text: 'Vstup do kanceláře', link: 'kancelar' },
                            { text: 'Povinná výbava', link: 'vybava' }
                        ]
                    },
                    {
                        text: 'Postupy',
                        collapsed: false,
                        items: [
                            { text: 'Kódy a zkratky', link: 'kody-zkratky' },
                            { text: 'MDT (Video)', link: 'mdt' },
                            { text: 'Postup v CPZ', link: 'cpz' },
                            { text: 'Traffic stop (10-11)', link: 'traffic-stop' },
                            { text: 'Stíhání (10-80 a 10-70)', link: 'stihani' },
                            { text: 'Felony stop (Kód 5)', link: 'felony-stop' },
                            { text: 'Loupeže a přepadení (10-68)', link: 'loupeze' }
                        ]
                    },
                ]
            },
            '/bot/': {
                base: '/bot/', items: [
                    {
                        text: 'Základní',
                        collapsed: false,
                        items: [
                            { text: 'Úvod', link: 'uvod' },
                            { text: 'Složka', link: 'slozka' },
                            { text: 'Zápis služby', link: 'sluzby' },
                            { text: 'Omlouvání se', link: 'omluvenky' }
                        ]
                    },
                    {
                        text: 'Admin',
                        collapsed: true,
                        items: [
                            { text: 'Tabulky', link: 'tabulky' },
                            { text: 'Blacklist', link: 'blacklist' },
                            { text: 'Registrace a vyhazov', link: 'registrace-vyhazov' },
                            { text: 'Povýšení a degradace', link: 'povyseni-degradace' }
                        ]
                    },
                ]
            },
            '/legal/': {
                base: '/legal/', items: [
                    {
                        text: 'Dokumnenty',
                        collapsed: false,
                        items: [
                            { text: 'Zásady Ochrany Osobních Údajů', link: 'privacy-policy' },
                            { text: 'Podmínky používání', link: 'terms-of-use' },
                            { text: 'Použítí', link: 'usage' }
                        ]
                    },
                ]
            }
        },

        socialLinks: [
            { icon: 'discord', link: 'https://discord.com/invite/PYTqqhWad2' },
            { icon: 'github', link: 'https://github.com/ArimDev/LEA-bot' }
        ],

        footer: {
            copyright: '© 2024 LEA-Bot vytvořil PetyXbron (b1ngo)'
        }
    },
});
