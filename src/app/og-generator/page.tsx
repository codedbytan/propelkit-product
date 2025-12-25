import { Terminal, CreditCard, FileText, Database, Rocket } from "lucide-react";

export default function OgGenerator() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8 font-sans">
            {/* --------------------------------------------------
        THIS IS THE CARD TO SCREENSHOT (1200 x 630)
        -------------------------------------------------- 
      */}
            <div className="relative w-[1200px] h-[630px] bg-slate-950 overflow-hidden flex border border-slate-800 shadow-2xl">

                {/* Background Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />

                {/* --------------------------------------------------
            LEFT SIDE: BRANDING & VALUE PROP (60%)
            -------------------------------------------------- */}
                <div className="relative w-[60%] p-16 flex flex-col justify-center z-10 border-r border-slate-800/50">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-xs font-medium text-blue-400 tracking-wide uppercase">v1.0 Release</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-7xl font-bold text-white tracking-tighter leading-[1.1] mb-6">
                        PropelKit
                    </h1>

                    {/* Sub-Headline */}
                    <p className="text-3xl text-slate-400 font-light tracking-tight leading-snug mb-12">
                        The Enterprise-Grade <br />
                        <span className="text-yellow-400 font-medium">Next.js Boilerplate for India.</span>
                    </p>

                    {/* Stack Icons */}
                    <div className="flex items-center gap-8 opacity-80">
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                <CreditCard className="w-8 h-8 text-indigo-400" />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Payments</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                <FileText className="w-8 h-8 text-green-400" />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">GST Invoices</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                <Database className="w-8 h-8 text-emerald-400" />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Supabase</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                <Rocket className="w-8 h-8 text-orange-400" />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Ship Fast</span>
                        </div>
                    </div>
                </div>

                {/* --------------------------------------------------
            RIGHT SIDE: CODE MOCKUP (40%)
            -------------------------------------------------- */}
                <div className="relative w-[40%] bg-slate-900/50 flex items-center justify-center p-12">

                    {/* Code Window */}
                    <div className="w-full bg-[#1e1e1e] rounded-xl shadow-2xl border border-slate-800 overflow-hidden transform rotate-[-2deg] scale-110">

                        {/* Window Header */}
                        <div className="bg-[#252526] px-4 py-3 flex items-center gap-2 border-b border-[#333]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                            </div>
                            <div className="ml-4 text-xs text-slate-500 font-mono">dashboard.tsx</div>
                        </div>

                        {/* Code Content */}
                        <div className="p-4 font-mono text-sm leading-6">
                            <div className="flex">
                                <span className="text-[hsl(215,20%,35%)] w-8 text-right mr-4 select-none">1</span>
                                <span>
                                    <span className="text-[hsl(300,50%,70%)]">import</span>
                                    <span className="text-white"> {'{'} </span>
                                    <span className="text-[hsl(200,90%,80%)]">auth</span>
                                    <span className="text-white">{' }'} </span>
                                    <span className="text-[hsl(300,50%,70%)]">from</span>
                                    <span className="text-[hsl(100,50%,70%)]"> "@/lib/supabase"</span>
                                </span>
                            </div>
                            <div className="flex">
                                <span className="text-[hsl(215,20%,35%)] w-8 text-right mr-4 select-none">2</span>
                                <span className="text-[hsl(215,20%,35%)]"></span>
                            </div>
                            <div className="flex">
                                <span className="text-[hsl(215,20%,35%)] w-8 text-right mr-4 select-none">3</span>
                                <span>
                                    <span className="text-[hsl(300,50%,70%)]">export default</span>
                                    <span className="text-[hsl(200,90%,70%)]"> async function</span>
                                    <span className="text-[hsl(50,90%,70%)]"> Dashboard</span>
                                    <span className="text-white">() {'{'}</span>
                                </span>
                            </div>
                            <div className="flex">
                                <span className="text-[hsl(215,20%,35%)] w-8 text-right mr-4 select-none">4</span>
                                <span>
                                    <span className="text-white">  </span>
                                    <span className="text-[hsl(300,50%,70%)]">const</span>
                                    <span className="text-[hsl(200,90%,80%)]"> user</span>
                                    <span className="text-white"> = </span>
                                    <span className="text-[hsl(300,50%,70%)]">await</span>
                                    <span className="text-[hsl(50,90%,70%)]"> auth</span>
                                    <span className="text-white">()</span>
                                </span>
                            </div>
                            <div className="flex">
                                <span className="text-[hsl(215,20%,35%)] w-8 text-right mr-4 select-none">5</span>
                                <span className="text-[hsl(215,20%,35%)]"></span>
                            </div>
                            <div className="flex">
                                <span className="text-[hsl(215,20%,35%)] w-8 text-right mr-4 select-none">6</span>
                                <span>
                                    <span className="text-white">  </span>
                                    <span className="text-[hsl(300,50%,70%)]">return</span>
                                    <span className="text-white"> {'<'}</span>
                                    <span className="text-[hsl(200,90%,70%)]">Dashboard</span>
                                    <span className="text-[hsl(180,60%,70%)]"> user</span>
                                    <span className="text-white">={'{'}</span>
                                    <span className="text-[hsl(200,90%,80%)]">user</span>
                                    <span className="text-white">{'}'} /{'>'}</span>
                                </span>
                            </div>
                            <div className="flex">
                                <span className="text-[hsl(215,20%,35%)] w-8 text-right mr-4 select-none">7</span>
                                <span className="text-white">{'}'}</span>
                            </div>
                        </div>

                        {/* Tag */}
                        <div className="mt-4 pb-4 text-center border-t border-slate-800/50 pt-3">
                            <span className="text-[10px] text-[hsl(215,20%,40%)] tracking-widest uppercase font-semibold">
                                Production Ready
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Watermark */}
                <div className="absolute bottom-6 left-16 flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-medium tracking-wide">
                        propelkit.com
                    </span>
                </div>
            </div>

            {/* Helper text outside card */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-sm text-gray-500">
                Set Zoom to 100%. Screenshot this 1200×630 card. Save as public/og.png
            </div>
        </div>
    );
}