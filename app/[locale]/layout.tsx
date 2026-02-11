import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./globals.css"
import {ColorSchemeScript, mantineHtmlProps, MantineProvider, createTheme} from "@mantine/core";
import {ModalsProvider} from "@mantine/modals";
import type {ReactNode} from "react";
import {NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations} from "next-intl/server";
import {Auth0Provider} from "@auth0/nextjs-auth0";
import {auth0} from "@/shared/lib/auth0/auth0";
import Navbar from "@/widgets/NavBar/Navbar";
import {Metadata} from "next";
import Background from "@/shared/ui/background/Background";

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const {locale} = await params;
    const t = await getTranslations({locale, namespace: "metadata"});

    return {
        title: t("title"),
        description: t("description"),
    };
}

const theme = createTheme({
    colors: {
        dark: [
            '#C1C2C5',
            '#A6A7AB',
            '#909296',
            '#5C5F66',
            '#373A40',
            '#2C2E33',
            '#1f2023',
            '#101113',
            '#0a0b0c',
            '#000000',
        ],
    },
});

export default async function RootLayout({
                                             children,
                                             params,
                                         }: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const {locale} = await params;
    const messages = await getMessages({locale});
    const t = await getTranslations({locale, namespace: "metadata"});

    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <html
                lang={locale}
                {...mantineHtmlProps}
            >
            <head>
                <ColorSchemeScript defaultColorScheme="dark" />
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
                />
                <title>{t("title")}</title>
            </head>
            <body style={{margin: 0, padding: 0, height: "100vh", overflow: "hidden"}}>
            <Auth0Provider user={user}>
                <MantineProvider theme={theme} defaultColorScheme="dark">
                    <ModalsProvider>
                        <div style={{display: "flex", flexDirection: "column", height: "100vh", position: "relative"}}>
                            <Background/>
                            <Navbar/>
                            <main className="custom-scrollbar" style={{flex: 1, overflow: "auto", position: "relative", zIndex: 1}}>
                                {children}
                            </main>
                        </div>
                    </ModalsProvider>
                </MantineProvider>
            </Auth0Provider>
            </body>
            </html>
        </NextIntlClientProvider>
    );
}