Set ws = CreateObject("Wscript.Shell") 
command ="powershell -NoProfile -ExecutionPolicy Unrestricted .\main.ps1"
ws.run command, 0