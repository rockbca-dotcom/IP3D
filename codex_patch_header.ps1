param(
    [Parameter(Mandatory = $true)]
    [string[]]$Files
)

$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($file in $Files) {
    $name = [System.IO.Path]::GetFileName($file)
    $content = Get-Content $file -Raw
    $hits = 0

    switch ($name) {
        "header.js" {
            $pairs = @(
                @{
                    Old = 'let eU=`border-b ${X||"/"!==e_?"bg-white shadow-sm":"bg-white"}`;'
                    New = 'let eU="/"===e_?"relative z-40 -mb-6 px-4":`border-b ${X||"/"!==e_?"bg-white shadow-sm":"bg-white"}`;'
                },
                @{
                    Old = 'className:"container mx-auto flex items-center justify-between px-6 py-3 lg:py-4"'
                    New = 'className:"/"===e_?"mx-auto flex max-w-screen-2xl items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/95 px-6 py-3 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)] backdrop-blur lg:py-4":"container mx-auto flex items-center justify-between px-6 py-3 lg:py-4"'
                }
            )
        }
        "header-ssr.js" {
            $pairs = @(
                @{
                    Old = 'className:`border-b ${c||"/"!==x?"bg-white shadow-sm":"bg-white"}`'
                    New = 'className:"/"===x?"relative z-40 -mb-6 px-4":`border-b ${c||"/"!==x?"bg-white shadow-sm":"bg-white"}`'
                },
                @{
                    Old = 'className:"container mx-auto flex items-center justify-between px-6 py-3 lg:py-4"'
                    New = 'className:"/"===x?"mx-auto flex max-w-screen-2xl items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/95 px-6 py-3 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)] backdrop-blur lg:py-4":"container mx-auto flex items-center justify-between px-6 py-3 lg:py-4"'
                }
            )
        }
        "index.html" {
            $pairs = @(
                @{
                    Old = 'class="border-b bg-white"><div class="container mx-auto flex items-center justify-between px-6 py-3 lg:py-4">'
                    New = 'class="relative z-40 -mb-6 px-4"><div class="mx-auto flex max-w-screen-2xl items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/95 px-6 py-3 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)] backdrop-blur lg:py-4">'
                }
            )
        }
        default {
            throw "Unsupported file for header patch: $file"
        }
    }

    foreach ($pair in $pairs) {
        if ($content.Contains($pair.Old)) {
            $content = $content.Replace($pair.Old, $pair.New)
            $hits++
        }
    }

    [System.IO.File]::WriteAllText((Resolve-Path $file), $content, $utf8NoBom)
    Write-Output ("UPDATED " + $file + " :: " + $hits + " replacements")
}
