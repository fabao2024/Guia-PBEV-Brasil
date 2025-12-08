$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$wc = New-Object System.Net.WebClient

function DL($Id, $Path) {
    try {
        $Url = "https://images.unsplash.com/$Id?w=800&q=80"
        $FullPath = Join-Path $PWD $Path
        Write-Host "Downloading Unsplash $Id to $FullPath..."
        $wc.DownloadFile($Url, $FullPath)
    }
    catch {
        Write-Host "Error downloading $Path: $_"
    }
}

# 1. White Electric SUV (Volvo/BYD vibes)
$WhiteSUV = "photo-1617788138017-80ad40651399"
DL $WhiteSUV "public/car-images/yuan-pro.jpg"
DL $WhiteSUV "public/car-images/aion-y.jpg"
DL $WhiteSUV "public/car-images/captiva-ev.jpg"
DL $WhiteSUV "public/car-images/omoda-5.jpg"
DL $WhiteSUV "public/car-images/ex5-max.jpg"
DL $WhiteSUV "public/car-images/ex30.jpg"
DL $WhiteSUV "public/car-images/white-suv-generic.jpg"

# 2. Blue Electric SUV (Peugeot/Renault vibes)
$BlueSUV = "photo-1593941707874-ef25b8b4a92b"
DL $BlueSUV "public/car-images/e-2008.jpg"
DL $BlueSUV "public/car-images/megane-etech.jpg"
DL $BlueSUV "public/car-images/kona-ev.jpg"
DL $BlueSUV "public/car-images/yuan-plus.jpg"
DL $BlueSUV "public/car-images/id4.jpg"
DL $BlueSUV "public/car-images/blue-suv-generic.jpg"

# 3. Grey/Silver Luxury Sedan (Aion/Seal)
$GreySedan = "photo-1594535182308-8ffefbb661e1"
DL $GreySedan "public/car-images/aion-es.jpg"
DL $GreySedan "public/car-images/seal.jpg"
DL $GreySedan "public/car-images/han-ev.jpg"
DL $GreySedan "public/car-images/etron-gt.jpg"
DL $GreySedan "public/car-images/taycan.jpg"
DL $GreySedan "public/car-images/i4.jpg"

# 4. Luxury Dark SUV (Audi/BMW/Merc)
$LuxSUV = "photo-1619767886558-efdc259cde1a"
DL $LuxSUV "public/car-images/countryman-se.jpg"
DL $LuxSUV "public/car-images/equinox-ev.jpg"
DL $LuxSUV "public/car-images/ex40.jpg"
DL $LuxSUV "public/car-images/ec40.jpg"
DL $LuxSUV "public/car-images/ix1.jpg"
DL $LuxSUV "public/car-images/ev5.jpg"
DL $LuxSUV "public/car-images/ioniq-5.jpg"
DL $LuxSUV "public/car-images/eqa-250.jpg"
DL $LuxSUV "public/car-images/eqb-250.jpg"
DL $LuxSUV "public/car-images/ix3.jpg"
DL $LuxSUV "public/car-images/q8-etron.jpg"
DL $LuxSUV "public/car-images/ix.jpg"
DL $LuxSUV "public/car-images/ev9.jpg"
DL $LuxSUV "public/car-images/eqs.jpg"
DL $LuxSUV "public/car-images/eqe-suv.jpg"
DL $LuxSUV "public/car-images/i7.jpg"
DL $LuxSUV "public/car-images/zeekr-001.jpg"
DL $LuxSUV "public/car-images/zeekr-x.jpg"
DL $LuxSUV "public/car-images/tan-ev.jpg"
DL $LuxSUV "public/car-images/macan-ev.jpg"
DL $LuxSUV "public/car-images/mach-e.jpg"
DL $LuxSUV "public/car-images/blazer-ev.jpg"
DL $LuxSUV "public/car-images/neta-x.jpg"
DL $LuxSUV "public/car-images/e-js4.jpg"
DL $LuxSUV "public/car-images/ariya.jpg"

# 5. Commercial Van
$Van = "photo-1566008885218-40afecbb2f9d" # Generic white van
DL $Van "public/car-images/etransit.jpg"
DL $Van "public/car-images/kangoo-etech.jpg"
DL $Van "public/car-images/idbuzz.jpg"
DL $Van "public/car-images/et3.jpg"
DL $Van "public/car-images/e-expert.jpg"
DL $Van "public/car-images/e-scudo.jpg"
DL $Van "public/car-images/e-jumpy.jpg"
