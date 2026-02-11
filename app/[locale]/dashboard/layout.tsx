import {Box} from "@mantine/core";
import Sidebar from "@/widgets/SideBar/Sidebar";
import {auth0} from "@/shared/lib/auth0/auth0";
import {redirect} from "next/navigation";

export default async function DashboardLayout({children,}: { children: React.ReactNode; }) {
    const session = await auth0.getSession();

    if (!session) {
        redirect('/auth/login')
    }

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