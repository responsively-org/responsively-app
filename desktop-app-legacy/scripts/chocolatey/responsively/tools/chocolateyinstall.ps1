$ErrorActionPreference = 'Stop';

$toolsDir   = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$url        = 'https://github.com/responsively-org/responsively-app/releases/download/v#VERSION#/ResponsivelyApp-Setup-#VERSION#.exe'
$url64      = 'https://github.com/responsively-org/responsively-app/releases/download/v#VERSION#/ResponsivelyApp-Setup-#VERSION#.exe'

$packageArgs = @{
  packageName   = $env:ChocolateyPackageName
  unzipLocation = $toolsDir
  fileType      = 'exe'
  url           = $url
  url64bit      = $url64

  softwareName  = 'responsively*'
  checksum      = '#CHECKSUM#'
  checksumType  = 'sha512'
  checksum64    = '#CHECKSUM#'
  checksumType64= 'sha512'

  silentArgs    = "/S"
  validExitCodes= @(0, 3010, 1641)
}

Install-ChocolateyPackage @packageArgs