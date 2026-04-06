Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "D:\Grafica RJ Print\IP3D\site_limpo-main\site_limpo-main"
sh.Run Chr(34) & "C:\Progra~1\nodejs\node.exe" & Chr(34) & " " & Chr(34) & "D:\Grafica RJ Print\IP3D\site_limpo-main\site_limpo-main\node_modules\.pnpm\next@16.0.8_@babel+core@7.2_7189e576daf9696c66c258340cc7f3a8\node_modules\next\dist\bin\next" & Chr(34) & " start -p 3003", 0, False
