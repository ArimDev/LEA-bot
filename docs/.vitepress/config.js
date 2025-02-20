import { loadEnv, defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default async () => {
    const env = loadEnv("", process.cwd());

    return defineConfig({
        title: "Příručka LEA",
        description: "FreshRP",
        base: '/',

        sitemap: {
            hostname: env.VITE_hostname
        },

        lastUpdated: true,
        cleanUrls: true,
        metaChunk: true,
        head: [
            ['link', { rel: 'icon', href: '/media/logo/leabot.png' }],

            //Discord embeds (OpenGraph)
            ['meta', { property: 'og:image', content: '/media/logo/leabot.png' }],
            ['meta', { name: 'og:site_name', content: 'FreshRP' }],
            ['meta', { name: 'twitter:card', content: 'summary' }],
            ['meta', { name: 'theme-color', content: '#ffffff' }],

            //Google Analytics
            ['script',
                { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=' + env.VITE_GTAG }
            ],
            ['script', {},
                `window.dataLayer = window.dataLayer || [];`
                + `\nfunction gtag(){dataLayer.push(arguments);}`
                + `\ngtag('js', new Date());`
                + `\nconst cookiesAccepted = localStorage.getItem("cookiesAccepted");`
                + `\n\nif (cookiesAccepted !== null) {`
                + `\n    gtag('consent', 'default', {`
                + `\n        'ad_storage': 'granted',`
                + `\n        'ad_user_data': 'granted',`
                + `\n        'ad_personalization': 'granted',`
                + `\n        'analytics_storage': 'granted'`
                + `\n    });`
                + `\n} else {`
                + `\n    gtag('consent', 'default', {`
                + `\n        'ad_storage': 'denied',`
                + `\n        'ad_user_data': 'denied',`
                + `\n        'ad_personalization': 'denied',`
                + `\n        'analytics_storage': 'denied'`
                + `\n    });`
                + `\n}`
                + `\n\ngtag('config', '${env.VITE_GTAG}');`
            ],

            //Google AdSense
            ['script',
                { async: true, src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${env.VITE_GADS}`, crossorigin: "anonymous" }
            ],
        ],

        transformPageData(pageData) {
            pageData.frontmatter.head ??= [];
            pageData.frontmatter.head.push(
                ['meta', { name: 'og:title', content: pageData.frontmatter.title ? ("LEA Příručka | " + pageData.frontmatter.title) : "LEA Příručka" }],
                ['meta', { name: 'og:description', content: pageData.frontmatter.description || "Příručka se vším všudy!" }]
            );
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
                    text: 'Sbory', link: '/sbory/uvod',
                    activeMatch: '/sbory/'
                },
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
                '/sbory/': {
                    base: '/sbory/', items: [
                        { text: 'Úvod', link: 'uvod' },
                        {
                            text: 'SAHP',
                            collapsed: false,
                            items: [
                                { text: 'Leadership', link: 'sahp/vedeni' },
                                { text: 'Hodnosti', link: 'sahp/hodnosti' },
                                { text: 'Divize', link: 'sahp/divize' }
                            ]
                        },
                        {
                            text: 'LSSD',
                            collapsed: false,
                            items: [
                                { text: 'Leadership', link: 'lssd/vedeni' },
                                { text: 'Hodnosti', link: 'lssd/hodnosti' },
                                { text: 'Divize', link: 'lssd/divize' }
                            ]
                        },
                    ]
                },
                '/navody/': {
                    base: '/navody/', items: [
                        { text: 'FreshRP Pravidla', link: '../pravidla' },
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
                                { text: 'Box a Pit Manévr', link: 'box-pit' },
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
                copyright: '© 2024 - 2025 LEA-Bot<br>vytvořil PetyXbron (b1ngo)'
            }
        },
    });
};
