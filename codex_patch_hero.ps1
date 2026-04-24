param(
    [Parameter(Mandatory = $true)]
    [string[]]$Files
)

$ErrorActionPreference = "Stop"

$replacements = @(
    @{ Old = "relative h-[480px] sm:h-[540px] lg:h-[600px]"; New = "relative h-[288px] sm:h-[324px] lg:h-[360px]" },
    @{ Old = "relative flex h-48 w-48 items-center justify-center rounded-full border border-cyan-500/10 sm:h-80 sm:w-80"; New = "relative flex h-28 w-28 items-center justify-center rounded-full border border-cyan-500/10 sm:h-40 sm:w-40 lg:h-56 lg:w-56" },
    @{ Old = "h-6 w-6 animate-pulse rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"; New = "h-4 w-4 animate-pulse rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] sm:h-5 sm:w-5" },
    @{ Old = "absolute left-0 top-0 h-16 w-16 border-l-2 border-t-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]"; New = "absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] sm:h-12 sm:w-12" },
    @{ Old = "absolute right-0 top-0 h-16 w-16 border-r-2 border-t-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]"; New = "absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] sm:h-12 sm:w-12" },
    @{ Old = "absolute bottom-0 left-0 h-16 w-16 border-b-2 border-l-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]"; New = "absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] sm:h-12 sm:w-12" },
    @{ Old = "absolute bottom-0 right-0 h-16 w-16 border-b-2 border-r-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]"; New = "absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] sm:h-12 sm:w-12" },
    @{ Old = "absolute -left-28 top-1/2 h-px w-24 -translate-y-1/2 bg-gradient-to-l from-cyan-500 to-transparent"; New = "absolute -left-16 top-1/2 h-px w-12 -translate-y-1/2 bg-gradient-to-l from-cyan-500 to-transparent sm:-left-24 sm:w-16 lg:w-20" },
    @{ Old = "absolute -right-28 top-1/2 h-px w-24 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-transparent"; New = "absolute -right-16 top-1/2 h-px w-12 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-transparent sm:-right-24 sm:w-16 lg:w-20" },
    @{ Old = "absolute -top-8 left-0 border-l-2 border-cyan-500 bg-cyan-950/60 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-cyan-400"; New = "absolute -top-6 left-0 border-l-2 border-cyan-500 bg-cyan-950/60 px-2.5 py-1 font-mono text-[8px] font-bold tracking-[0.18em] text-cyan-400 sm:-top-7 sm:px-3 sm:text-[9px]" },
    @{ Old = "absolute left-1/2 top-12 -translate-x-1/2 opacity-30"; New = "absolute left-1/2 top-6 -translate-x-1/2 opacity-30 sm:top-8" },
    @{ Old = "border-y border-white/10 px-4 py-1 text-[10px] font-mono uppercase tracking-[0.5em] text-white/50"; New = "border-y border-white/10 px-3 py-1 text-[8px] font-mono uppercase tracking-[0.35em] text-white/50 sm:px-4 sm:text-[9px] lg:text-[10px]" },
    @{ Old = "relative z-30 mx-auto flex h-full w-full max-w-screen-2xl items-center px-8 lg:px-16"; New = "relative z-30 mx-auto flex h-full w-full max-w-screen-2xl items-center px-5 sm:px-6 lg:px-12" },
    @{ Old = "max-w-2xl border-l-2 border-cyan-500/30 bg-black/10 p-8 backdrop-blur-[2px]"; New = "max-w-xl border-l-2 border-cyan-500/30 bg-black/10 p-5 backdrop-blur-[2px] sm:p-6 lg:max-w-2xl lg:p-8" },
    @{ Old = "mb-6 flex items-center gap-3"; New = "mb-3 flex items-center gap-3 sm:mb-4" },
    @{ Old = "mb-6 text-4xl font-bold leading-[1] tracking-tight text-white md:text-5xl lg:text-7xl"; New = "mb-3 text-3xl font-bold leading-[1] tracking-tight text-white sm:mb-4 md:text-4xl lg:text-5xl" },
    @{ Old = "mb-8 max-w-xl text-lg leading-relaxed text-gray-300 md:text-xl"; New = "mb-5 max-w-lg text-sm leading-relaxed text-gray-300 sm:text-base lg:text-lg" },
    @{ Old = "h-12 bg-[#0B64D3] px-8 text-base font-semibold text-white transition-all hover:bg-[#0A4A9D] hover:shadow-[0_0_20px_rgba(11,100,211,0.4)]"; New = "h-10 bg-[#0B64D3] px-5 text-sm font-semibold text-white transition-all hover:bg-[#0A4A9D] hover:shadow-[0_0_20px_rgba(11,100,211,0.4)] sm:h-11 sm:px-6 sm:text-base" },
    @{ Old = "h-12 border-white/30 bg-white/5 px-8 text-base text-white backdrop-blur-sm hover:bg-white/10"; New = "h-10 border-white/30 bg-white/5 px-5 text-sm text-white backdrop-blur-sm hover:bg-white/10 sm:h-11 sm:px-6 sm:text-base" },
    @{ Old = "absolute bottom-12 right-8 hidden flex-col gap-4 lg:flex"; New = "absolute bottom-8 right-6 hidden flex-col gap-3 lg:flex" },
    @{ Old = "min-w-[220px] border-l-2 border-cyan-500 bg-black/40 p-4 shadow-2xl backdrop-blur-md"; New = "min-w-[200px] border-l-2 border-cyan-500 bg-black/40 p-3 shadow-2xl backdrop-blur-md" },
    @{ Old = "absolute bottom-6 left-8 z-30 flex items-center gap-2"; New = "absolute bottom-4 left-5 z-30 flex items-center gap-2 sm:left-8 sm:bottom-6" }
)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($file in $Files) {
    $content = Get-Content $file -Raw
    $hits = 0

    foreach ($pair in $replacements) {
        if ($content.Contains($pair.Old)) {
            $content = $content.Replace($pair.Old, $pair.New)
            $hits++
        }
    }

    [System.IO.File]::WriteAllText((Resolve-Path $file), $content, $utf8NoBom)
    Write-Output ("UPDATED " + $file + " :: " + $hits + " replacements")
}
