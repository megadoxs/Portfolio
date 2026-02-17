"use client";

import {Box} from "@mantine/core";
import Sidebar from "@/widgets/SideBar/Sidebar";
import React from "react";
import { useMediaQuery } from "@mantine/hooks";

export default function DashboardLayout({children,}: { children: React.ReactNode; }) {
    const isDesktop = useMediaQuery('(min-width: 768px)');

    return (
        <Box style={{display: "flex"}}>
            <Sidebar/>
            <Box
                style={{
                    marginLeft: isDesktop ? 280 : 0,
                    width: isDesktop ? 'calc(100% - 280px)' : '100%',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}