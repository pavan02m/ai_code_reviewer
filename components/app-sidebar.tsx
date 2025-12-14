'use client';
import React from 'react';
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Logout from "@/module/auth/components/logout"
import {BookOpen, ChartNoAxesCombined, Github, HandCoins, LogOut, MoonIcon, Settings2, SunIcon} from "lucide-react";

export const AppSidebar = () => {
    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const {data:session} = useSession();
    useEffect(() => {
        setMounted(true);
    }, []);

    const navigation = [
        { title: 'Dashboard', href: '/dashboard', icon: ChartNoAxesCombined},
        { title: 'Repository', href: '/dashboard/repository', icon: Github },
        { title: 'Reviews', href: '/dashboard/reviews', icon: BookOpen },
        { title: 'Subscription', href: '/dashboard/subscription', icon: HandCoins },
        { title: 'Setting', href: '/dashboard/settings', icon: Settings2 },
    ];

    const isActive = (url: string) => {
        return pathname === url || pathname.startsWith("/dashboard");
    }

    if (!mounted || !session) return null;
    const user = session.user;
    const userName = user.name || user.email?.split('@')[0] || 'Guest';
    const userEmail = user.email?.split('@')[0] || 'User';
    const userInitials = userName.split(' ').map((n) => n[0]).join('').toUpperCase();

    return (
        <Sidebar>
            <SidebarHeader className="border-b">
                <div className="flex flex-col gap-4 px-1 py-2">
                    <div className="flex items-center gap-4 px-3 py-1 rounded-lg transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shrink-0 overflow-hidden">
                            <Github className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-sidebar-foreground tracking-wide">
                                Connected Account
                            </p>
                            <p className="text-sm font-medium text-sidebar-foreground/90">
                                @{userName}
                            </p>
                        </div>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-6 flex flex-col gap-1">
                <SidebarMenu>
                    {navigation.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={`h-10 px-4 ${isActive(item.href) ? 'bg-sidebar-hover text-sidebar-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground'} `}
                            >
                                <Link href={item.href} className="flex items-center gap-3 w-full">
                                    <item.icon className="h-5 w-5 shrink-0"/>
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="px-3 py-4 border-t">
               <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-hover">
                                    <Avatar className="w-8 h-8">
                                        {user.image ? (
                                            <AvatarImage src={user.image} alt={userName} />
                                        ) : (
                                            <AvatarFallback>{userInitials}</AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium text-sidebar-foreground/90">{userName}</p>
                                        <p className="text-xs text-sidebar-foreground/70">@{userEmail}</p>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-40">
                                <DropdownMenuItem
                                    onClick={() => {
                                        const newTheme = theme === 'light' ? 'dark' : 'light';
                                        setTheme(newTheme);
                                    }}
                                >
                                    {theme === 'light' ?
                                        <>
                                            <MoonIcon className="w-5 h-5" />
                                            Dark Mode
                                        </>
                                        : <>
                                            <SunIcon className="w-5 h-5" />
                                            Light Mode
                                        </>}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <LogOut className="w-5 h-5 mt-3 shrink-0" />
                                    <Logout>
                                        Sign Out
                                    </Logout>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
               </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};