import { authClient } from "@/lib/auth-client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { ChevronDownIcon, CreditCardIcon, LogOutIcon, LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

export const DashboardUserButton = () => {
    const { data, isPending } = authClient.useSession();
    const isMobile = useIsMobile();
    const router = useRouter();
    const onLogout = () => {
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/sign-in");
                },
            },
        });
    };

    const connectToNotion = () => {
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_NOTION_CLIENT_ID!,
            response_type: "code",
            owner: "user",
            redirect_uri: process.env.NEXT_PUBLIC_NOTION_REDIRECT_URI!,
        });
        window.open(
            `https://api.notion.com/v1/oauth/authorize?${params}`,
            "notion-oauth",
            "width=600,height=700"
        );
    };

    if (isPending || !data?.user) {
        return null;
    }

    if (isMobile) {
        return (
            <Drawer>
                <DrawerTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden">
                    {data.user.image ? (
                        <Avatar>
                            <AvatarImage src={data.user.image} />
                        </Avatar>
                    ) : (
                        <GeneratedAvatar
                            seed={data.user.name || ""}
                            variant="initials"
                            className="size-9 mr-3"
                        />
                    )}

                    <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
                        <p className="text-sm truncate w-full ml-3">
                            {data.user.name}
                        </p>
                        <p className="text-xs truncate w-full ml-3">
                            {data.user.email}
                        </p>
                    </div>
                    <ChevronDownIcon className="size-4 shrink-0" />
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{data.user.name}</DrawerTitle>
                        <DrawerDescription>{data.user.email}</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <Button variant="outline" onClick={connectToNotion}>
                            <LinkIcon className="size-4 text-black" />
                            Connect Notion
                        </Button>
                        <Button variant="outline" onClick={() => {}}>
                            <CreditCardIcon className="size-4 text-black" />
                            Billing
                        </Button>
                        <Button variant="outline" onClick={onLogout}>
                            <LogOutIcon className="size-4 text-black" />
                            Logout
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden">
                {data.user.image ? (
                    <Avatar>
                        <AvatarImage src={data.user.image} />
                    </Avatar>
                ) : (
                    <GeneratedAvatar
                        seed={data.user.name || ""}
                        variant="initials"
                        className="size-9 mr-3"
                    />
                )}

                <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
                    <p className="text-sm truncate w-full ml-3">
                        {data.user.name}
                    </p>
                    <p className="text-xs truncate w-full ml-3">
                        {data.user.email}
                    </p>
                </div>
                <ChevronDownIcon className="size-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-72">
                <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                        <span className="font-medium truncate">
                            {" "}
                            {data.user.name}
                        </span>
                        <span className="text-sm font-normal text-muted-foreground truncate">
                            {data.user.email}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    className="cursor-pointer flex items-center justify-between"
                    onClick={connectToNotion}
                >
                    Connect Notion
                    <LinkIcon className="size-4" />
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
                    Billing
                    <CreditCardIcon className="size-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer flex items-center justify-between"
                    onClick={onLogout}
                >
                    Logout
                    <LogOutIcon className="size-4" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default DashboardUserButton;