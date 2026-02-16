import {Box} from "@mantine/core";
import Sidebar from "@/widgets/SideBar/Sidebar";
import React from "react";

export default async function DashboardLayout({children,}: { children: React.ReactNode; }) {
    return (
        <Box style={{display: "flex"}}>
            <Sidebar/>
            <Box
                style={{
                    marginLeft: 280,
                    width: "calc(100% - 280px)",
                }}
            >
                {children}
            </Box>
        </Box>
    );
}