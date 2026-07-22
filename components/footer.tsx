import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-background relative z-10 mt-10">
            <div className="container mx-auto px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold tracking-tight text-white">RequestLens</span>
                </div>
                <p>© {new Date().getFullYear()} RequestLens Inc. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
                    <Link href="/register" className="hover:text-white transition-colors">Get Started</Link>
                </div>
            </div>
        </footer>
    )
}