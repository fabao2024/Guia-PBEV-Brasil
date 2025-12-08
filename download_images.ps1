$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Download-Image {
    param ($Url, $Path)
    try {
        Write-Host "Downloading $Path..."
        Invoke-WebRequest -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -Uri $Url -OutFile $Path
        Write-Host "Success."
    } catch {
        Write-Host "FAILED: $Path - $_"
    }
}

# Batch 2 (SUVs)
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/2019_GAC_Aion_S.jpg/800px-2019_GAC_Aion_S.jpg" "public/car-images/aion-es.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/2021_BYD_Yuan_Pro_%28facelift%2C_rear%29.jpg/800px-2021_BYD_Yuan_Pro_%28facelift%2C_rear%29.jpg" "public/car-images/yuan-pro.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/GAC_Aion_Y_Plus_Premium_001.jpg/800px-GAC_Aion_Y_Plus_Premium_001.jpg" "public/car-images/aion-y.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/2019_Chevrolet_Captiva_LT.jpg/800px-2019_Chevrolet_Captiva_LT.jpg" "public/car-images/captiva-ev.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Chery_Omoda_E5_%28Malaysia%29_front_view.jpg/800px-Chery_Omoda_E5_%28Malaysia%29_front_view.jpg" "public/car-images/omoda-5.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Geometry_C_012.jpg/800px-Geometry_C_012.jpg" "public/car-images/ex5-max.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Hyundai_Kona_Electric_SX2_IMG_9378.jpg/800px-Hyundai_Kona_Electric_SX2_IMG_9378.jpg" "public/car-images/kona-ev.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/BYD_Atto_3_%28Sweden%29_July_2022_1.jpg/800px-BYD_Atto_3_%28Sweden%29_July_2022_1.jpg" "public/car-images/yuan-plus.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Volvo_EX30_IAA_2023_1.jpg/800px-Volvo_EX30_IAA_2023_1.jpg" "public/car-images/ex30.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Peugeot_e-2008_GT_%282021%29_IMG_3962.jpg/800px-Peugeot_e-2008_GT_%282021%29_IMG_3962.jpg" "public/car-images/e-2008.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Renault_Megane_E-Tech_Electric_IMG_5613.jpg/800px-Renault_Megane_E-Tech_Electric_IMG_5613.jpg" "public/car-images/megane-etech.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mini_Countryman_SE_ALL4_%28U25%29_IMG_9828.jpg/800px-Mini_Countryman_SE_ALL4_%28U25%29_IMG_9828.jpg" "public/car-images/countryman-se.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Chevrolet_Equinox_EV_RS_AWD_%28Mexico%29_front_view.png/800px-Chevrolet_Equinox_EV_RS_AWD_%28Mexico%29_front_view.png" "public/car-images/equinox-ev.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Volkswagen_ID.4_1st_Max_IMG_4187.jpg/800px-Volkswagen_ID.4_1st_Max_IMG_4187.jpg" "public/car-images/id4.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Volvo_XC40_Recharge_Pelo_IMG_5033.jpg/800px-Volvo_XC40_Recharge_Pelo_IMG_5033.jpg" "public/car-images/ex40.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Volvo_C40_Recharge_Twin_Engine_%28France%29_front_view.jpg/800px-Volvo_C40_Recharge_Twin_Engine_%28France%29_front_view.jpg" "public/car-images/ec40.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/BMW_iX1_xDrive30_M_Sport_%28U11%29_IMG_6881.jpg/800px-BMW_iX1_xDrive30_M_Sport_%28U11%29_IMG_6881.jpg" "public/car-images/ix1.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Kia_EV5_Land_AWD_%28OV%29_front_view.jpg/800px-Kia_EV5_Land_AWD_%28OV%29_front_view.jpg" "public/car-images/ev5.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Hyundai_Ioniq_5_IMG_5241.jpg/800px-Hyundai_Ioniq_5_IMG_5241.jpg" "public/car-images/ioniq-5.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Mercedes-Benz_EQA_250_AMG_Line_%28H243%29_IMG_4958.jpg/800px-Mercedes-Benz_EQA_250_AMG_Line_%28H243%29_IMG_4958.jpg" "public/car-images/eqa-250.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Mercedes-Benz_EQB_300_4MATIC_AMG_Line_%28X243%29_IMG_5677.jpg/800px-Mercedes-Benz_EQB_300_4MATIC_AMG_Line_%28X243%29_IMG_5677.jpg" "public/car-images/eqb-250.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Neta_U-II_400_U_Show_Edition_001.jpg/800px-Neta_U-II_400_U_Show_Edition_001.jpg" "public/car-images/neta-x.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Sehol_E40X_001.jpg/800px-Sehol_E40X_001.jpg" "public/car-images/e-js4.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nissan_Ariya_%28Japan%29_front_view.jpg/800px-Nissan_Ariya_%28Japan%29_front_view.jpg" "public/car-images/ariya.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Zeekr_X_001.jpg/800px-Zeekr_X_001.jpg" "public/car-images/zeekr-x.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/BMW_iX3_Premier_Edition_in_Piemont_Red.jpg/800px-BMW_iX3_Premier_Edition_in_Piemont_Red.jpg" "public/car-images/ix3.jpg"

# Batch 3 & 4
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/BYD_Seal_001.jpg/800px-BYD_Seal_001.jpg" "public/car-images/seal.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Zeekr_001_1.jpg/800px-Zeekr_001_1.jpg" "public/car-images/zeekr-001.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/BMW_i4_M50_%28G26%29_IMG_6587.jpg/800px-BMW_i4_M50_%28G26%29_IMG_6587.jpg" "public/car-images/i4.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Ford_Mustang_Mach-E_AWD_First_Edition_%28CX727%29_IMG_6045.jpg/800px-Ford_Mustang_Mach-E_AWD_First_Edition_%28CX727%29_IMG_6045.jpg" "public/car-images/mach-e.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/2024_Chevrolet_Blazer_EV_RS%2C_front_right.jpg/800px-2024_Chevrolet_Blazer_EV_RS%2C_front_right.jpg" "public/car-images/blazer-ev.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/BYD_Tang_EV_003.jpg/800px-BYD_Tang_EV_003.jpg" "public/car-images/tan-ev.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/BYD_Han_EV_Genesis_Edition_001.jpg/800px-BYD_Han_EV_Genesis_Edition_001.jpg" "public/car-images/han-ev.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Porsche_Macan_4_Electric_Genf_2024_1LZ4217.jpg/800px-Porsche_Macan_4_Electric_Genf_2024_1LZ4217.jpg" "public/car-images/macan-ev.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Audi_Q8_55_e-tron_quattro_S_line_IMG_8604.jpg/800px-Audi_Q8_55_e-tron_quattro_S_line_IMG_8604.jpg" "public/car-images/q8-etron.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/BMW_iX_xDrive40_%28I20%29_IMG_6924.jpg/800px-BMW_iX_xDrive40_%28I20%29_IMG_6924.jpg" "public/car-images/ix.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Porsche_Taycan_%282024%29_IMG_2574.jpg/800px-Porsche_Taycan_%282024%29_IMG_2574.jpg" "public/car-images/taycan.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Kia_EV9_GT-Line_IMG_9760.jpg/800px-Kia_EV9_GT-Line_IMG_9760.jpg" "public/car-images/ev9.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Mercedes-Benz_EQS_450%2B_AMG_Line_%28V297%29_IMG_5674.jpg/800px-Mercedes-Benz_EQS_450%2B_AMG_Line_%28V297%29_IMG_5674.jpg" "public/car-images/eqs.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Audi_e-tron_GT_IMG_5270.jpg/800px-Audi_e-tron_GT_IMG_5270.jpg" "public/car-images/etron-gt.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/BMW_i7_Img04.jpg/800px-BMW_i7_Img04.jpg" "public/car-images/i7.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mercedes-Benz_EQE_350_4MATIC_SUV_%28X294%29_IMG_8595.jpg/800px-Mercedes-Benz_EQE_350_4MATIC_SUV_%28X294%29_IMG_8595.jpg" "public/car-images/eqe-suv.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Ford_E-Transit_%282022%29_IMG_5368.jpg/800px-Ford_E-Transit_%282022%29_IMG_5368.jpg" "public/car-images/etransit.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Renault_Kangoo_E-Tech_Electric_IMG_9228.jpg/800px-Renault_Kangoo_E-Tech_Electric_IMG_9228.jpg" "public/car-images/kangoo-etech.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Volkswagen_ID._Buzz_Pro_IMG_5631.jpg/800px-Volkswagen_ID._Buzz_Pro_IMG_5631.jpg" "public/car-images/idbuzz.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/BYD_T3_in_Uruguay.jpg/800px-BYD_T3_in_Uruguay.jpg" "public/car-images/et3.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Peugeot_e-Expert_at_IAA_2024.jpg/800px-Peugeot_e-Expert_at_IAA_2024.jpg" "public/car-images/e-expert.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Fiat_E-Scudo_L2_75_kWh_Magic_Cargo.jpg/800px-Fiat_E-Scudo_L2_75_kWh_Magic_Cargo.jpg" "public/car-images/e-scudo.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Citro%C3%ABn_%C3%AB-Jumpy_L2_75_kWh_Club_%28Facelift%29_front_view.jpg/800px-Citro%C3%ABn_%C3%AB-Jumpy_L2_75_kWh_Club_%28Facelift%29_front_view.jpg" "public/car-images/e-jumpy.jpg"
