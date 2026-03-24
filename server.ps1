$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8045/")
$listener.Start()
Write-Host "Listening on port 8045..."
try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $response = $context.Response
        $request = $context.Request
        
        $path = $request.Url.LocalPath.TrimStart('/')
        if ($path -eq "") { $path = "index.html" }
        
        $fullPath = Join-Path (Get-Location) $path
        
        if (Test-Path $fullPath) {
            # Basic MIME types
            if ($path -match "\.css$") { $response.ContentType = "text/css" }
            elseif ($path -match "\.js$") { $response.ContentType = "application/javascript" }
            else { $response.ContentType = "text/html" }
            
            $content = [System.IO.File]::ReadAllBytes($fullPath)
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
