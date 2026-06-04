#Requires -Version 5.1
<#
  .SYNOPSIS
    Builds a signed release APK locally for the Coffee Club mobile app.

  .DESCRIPTION
    Checks for JDK and Android SDK, generates a release keystore if one doesn't
    exist, updates gradle.properties with the signing credentials, deep-cleans
    native caches (including node_modules .cxx), kills stuck Gradle daemon,
    and runs ./gradlew assembleRelease --no-daemon.

  .PARAMETER KeystorePath
    Path to the release keystore file. Defaults to android/app/release.keystore.

  .PARAMETER KeystorePassword
    Password for the release keystore. Defaults to 'coffeeclub2026' if generating a new one.

  .PARAMETER KeyAlias
    Alias for the release key. Defaults to 'mykeyalias'.

  .EXAMPLE
    .\scripts\build-signed-apk.ps1
    .\scripts\build-signed-apk.ps1 -KeystorePassword "MySecretPass" -KeyAlias "release"
#>
param(
    [string]$KeystorePath = "android/app/release.keystore",
    [string]$KeystorePassword = "coffeeclub2026",
    [string]$KeyAlias = "mykeyalias",
    [string]$KeyPassword = "coffeeclub2026"
)

$ErrorActionPreference = "Stop"

# --- Resolve paths relative to project root ---
$projectRoot = Split-Path -Parent $PSScriptRoot
$keystoreAbsolute = Join-Path $projectRoot $KeystorePath
$gradlePropsPath  = Join-Path $projectRoot "android/gradle.properties"
$gradlewPath      = Join-Path $projectRoot "android/gradlew.bat"

Write-Host "Project root : $projectRoot"
Write-Host "Keystore     : $keystoreAbsolute"

# --- 1. Check Java ---
$javaCmd = Get-Command java -ErrorAction SilentlyContinue
if (-not $javaCmd) {
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
        $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
    } else {
        Write-Error "Java JDK not found. Please install JDK 17+ and set JAVA_HOME."
    }
}
$javaVer = cmd /c "java -version 2>&1" | Select-Object -First 1
Write-Host "Java found   : $javaVer"

# --- 2. Check Android SDK ---
if (-not $env:ANDROID_HOME) {
    $candidates = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "$env:LOCALAPPDATA\Android\sdk",
        "$env:ProgramFiles\Android\android-sdk",
        "$env:ProgramFiles(x86)\Android\android-sdk"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { $env:ANDROID_HOME = $c; break }
    }
    if (-not $env:ANDROID_HOME) {
        Write-Error "ANDROID_HOME not set and Android SDK not found in common locations."
    }
}
Write-Host "ANDROID_HOME : $env:ANDROID_HOME"

# --- 3. Generate keystore if missing ---
if (-not (Test-Path $keystoreAbsolute)) {
    Write-Host "`nGenerating release keystore..." -ForegroundColor Cyan
    $keytool = if ($env:JAVA_HOME) { "$env:JAVA_HOME\bin\keytool.exe" } else { "keytool" }
    & $keytool -genkeypair `
        -v `
        -keystore $keystoreAbsolute `
        -alias $KeyAlias `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -storepass $KeystorePassword `
        -keypass $KeyPassword `
        -dname "CN=Coffee Club, OU=Mobile, O=Coffee Club, L=Dhaka, C=BD"
    Write-Host "Keystore created: $keystoreAbsolute" -ForegroundColor Green
} else {
    Write-Host "Keystore already exists. Using existing file."
}

# --- 4. Patch gradle.properties with signing credentials ---
Write-Host "`nUpdating gradle.properties..."
$propsLines = Get-Content $gradlePropsPath

$storeFileLine   = "MYAPP_UPLOAD_STORE_FILE=$($keystoreAbsolute.Replace('\','/'))"
$storePassLine   = "MYAPP_UPLOAD_STORE_PASSWORD=$KeystorePassword"
$keyAliasLine    = "MYAPP_UPLOAD_KEY_ALIAS=$KeyAlias"
$keyPassLine     = "MYAPP_UPLOAD_KEY_PASSWORD=$KeyPassword"

$outLines = [System.Collections.Generic.List[string]]::new()
$seenStoreFile = $false
$seenStorePass = $false
$seenKeyAlias  = $false
$seenKeyPass   = $false

foreach ($line in $propsLines) {
    if ($line -match '^MYAPP_UPLOAD_STORE_FILE\s*=') {
        $outLines.Add($storeFileLine)
        $seenStoreFile = $true
    } elseif ($line -match '^MYAPP_UPLOAD_STORE_PASSWORD\s*=') {
        $outLines.Add($storePassLine)
        $seenStorePass = $true
    } elseif ($line -match '^MYAPP_UPLOAD_KEY_ALIAS\s*=') {
        $outLines.Add($keyAliasLine)
        $seenKeyAlias = $true
    } elseif ($line -match '^MYAPP_UPLOAD_KEY_PASSWORD\s*=') {
        $outLines.Add($keyPassLine)
        $seenKeyPass = $true
    } else {
        $outLines.Add($line)
    }
}

if (-not $seenStoreFile) { $outLines.Add($storeFileLine) }
if (-not $seenStorePass) { $outLines.Add($storePassLine) }
if (-not $seenKeyAlias)  { $outLines.Add($keyAliasLine) }
if (-not $seenKeyPass)   { $outLines.Add($keyPassLine) }

Set-Content -Path $gradlePropsPath -Value ($outLines -join "`r`n") -NoNewline
Write-Host "gradle.properties updated." -ForegroundColor Green

# --- 5. Kill any running Gradle daemon ---
Write-Host "`nStopping Gradle daemon..." -ForegroundColor Cyan
Set-Location (Join-Path $projectRoot "android")
& $gradlewPath --stop 2>$null
Write-Host "Gradle daemon stopped (if it was running)."

# --- 6. Deep-clean ALL native build caches ---
Write-Host "`nDeep-cleaning native build caches..." -ForegroundColor Cyan

$pathsToDelete = @(
    (Join-Path $projectRoot "android/app/.cxx"),
    (Join-Path $projectRoot "android/app/build"),
    (Join-Path $projectRoot "android/build")
)

# Also delete .cxx caches inside node_modules for all react-native packages
$cxxDirs = Get-ChildItem -Path (Join-Path $projectRoot "node_modules") -Recurse -Filter ".cxx" -Directory -ErrorAction SilentlyContinue
foreach ($d in $cxxDirs) {
    $pathsToDelete += $d.FullName
}

foreach ($p in $pathsToDelete) {
    if (Test-Path $p) {
        Remove-Item -Recurse -Force -LiteralPath $p
        Write-Host "  Removed $p"
    }
}

# --- 7. Build (no daemon to avoid stuck-state issues) ---
Write-Host "`nRunning Gradle assembleRelease..." -ForegroundColor Cyan
& $gradlewPath assembleRelease --no-daemon

if ($LASTEXITCODE -ne 0) {
    Write-Error "Gradle build failed."
}

# --- 8. Report output ---
$apkPath = Join-Path $projectRoot "android/app/build/outputs/apk/release/app-release.apk"
if (Test-Path $apkPath) {
    Write-Host "`nSUCCESS! Signed APK built at:" -ForegroundColor Green
    Write-Host $apkPath
    $size = (Get-Item $apkPath).Length / 1MB
    Write-Host ("Size: {0:N2} MB" -f $size)
} else {
    Write-Warning "APK not found at expected path. Check android/app/build/outputs/apk/release/"
}

Set-Location $projectRoot
