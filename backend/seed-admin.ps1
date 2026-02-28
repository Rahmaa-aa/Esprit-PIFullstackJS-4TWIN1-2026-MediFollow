# Script PowerShell pour créer un compte admin MediFollow
# Usage: .\seed-admin.ps1

$body = @{
    email = "admin@medifollow.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/seed-admin" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    Write-Host "Admin créé avec succès!" -ForegroundColor Green
    Write-Host "Email: admin@medifollow.com"
    Write-Host "Password: Admin123!"
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}
