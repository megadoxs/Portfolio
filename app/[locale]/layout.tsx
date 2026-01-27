import "@mantine/core/styles.css";
import {ColorSchemeScript, Combobox, mantineHtmlProps, MantineProvider} from "@mantine/core";
import type {ReactNode} from "react";
import {NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations} from "next-intl/server";
import {Auth0Provider} from "@auth0/nextjs-auth0";
import {auth0} from "@/shared/api/auth0/auth0";
import NavBar from "@/widgets/NavBar/navbar";

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ locale: string }>;
}) {
    const {locale} = await params;
    const t = await getTranslations({locale, namespace: "metadata"});

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function RootLayout({
                                             children,
                                             params,
                                         }: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const {locale} = await params;
    const messages = await getMessages({locale});

    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <html
                lang={locale}
                {...mantineHtmlProps}
            >
            <head>
                <ColorSchemeScript/>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
                />
                <title>Portfolio</title>
            </head>
            <body
                style={{minHeight: "100vh", display: "flex", flexDirection: "column"}}>
                <Auth0Provider user={user}>
                    <MantineProvider>
                        <NavBar/>
                        {children}
                    </MantineProvider>
                </Auth0Provider>
            </body>
            </html>
        </NextIntlClientProvider>
    );
}